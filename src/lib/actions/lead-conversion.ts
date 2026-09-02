"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { roleCapacity } from "@/lib/enrollment-capacity";
import { buildConversionQuery } from "@/lib/leads/conversion-notice";
import { matchLeadCourses } from "@/lib/leads/course-match";
import { toE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { leadConversionSchema } from "@/lib/validation/lead-conversion";
import type { DanceRole, EnrollmentRole } from "@/types/database";

/**
 * Aceptar un lead como alumno.
 *
 * Antes, dar de alta a alguien que ya había escrito por la web significaba
 * copiar sus datos a mano en el formulario de alumno y acordarse de mover el
 * lead a "convertido". Aquí se hace en un paso y, si el lead pedía una clase
 * concreta, se matricula de camino.
 *
 * El lead NO se borra ni se vacía: se le pone `student_id` y `converted_at`.
 * Es lo que permite seguir midiendo qué campaña trajo a cada alumno.
 */

export type LeadConversionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Resultado de la conversión en un clic desde la lista de leads.
 *
 * `needsForm` distingue lo que se arregla escribiendo (un teléfono que no es
 * E.164, un email ya usado) de lo que no: en ese caso la tarjeta abre la
 * pantalla de conversión en vez de dejar al admin con un error seco.
 */
export type QuickConversionResult =
  | { ok: true; studentId: string; query: string }
  | { ok: false; message: string; needsForm?: boolean };

/** Motivo legible de por qué la BD ha rechazado la ficha. */
function studentInsertMessage(error: { code?: string; message?: string } | null) {
  if (error?.code === "23505") return "Ya hay un alumno con ese email.";
  if (error?.code === "42501") {
    return "La base de datos ha rechazado la ficha por permisos (RLS).";
  }
  return error?.message
    ? `No se ha podido crear la ficha de alumno: ${error.message}`
    : "No se ha podido crear la ficha de alumno.";
}

/**
 * Matricula al alumno en todo lo que pidió el lead, con el rol que ha dicho el
 * admin. Un aforo lleno no cancela nada: entra en lista de espera, igual que
 * en la pantalla larga. Devuelve el resumen para poder contárselo al admin —
 * una matrícula silenciosa que no ha pasado es peor que no matricular.
 */
async function enrollFromLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  courseIds: string[],
  role: EnrollmentRole,
): Promise<{
  enrolled: number;
  waitlisted: number;
  failed: number;
  /** Clases que pidió pero que no admiten su rol (p. ej. un leader en Heels). */
  closed: string[];
}> {
  let enrolled = 0;
  let waitlisted = 0;
  let failed = 0;
  const closed: string[] = [];

  for (const courseId of courseIds) {
    const { data: course } = await supabase
      .from("courses")
      .select("name, capacity_leaders, capacity_followers")
      .eq("id", courseId)
      .maybeSingle();
    if (!course) {
      failed += 1;
      continue;
    }

    const taken = await countActive(supabase, courseId, role);
    const capacity = roleCapacity(course, role, taken);

    // Rol cerrado: no se inventa una matrícula imposible, se cuenta y se dice.
    if (capacity.kind === "closed") {
      closed.push(course.name);
      continue;
    }

    const full = capacity.kind === "full";
    const { error } = await supabase.from("enrollments").insert({
      student_id: studentId,
      course_id: courseId,
      role_in_course: role,
      status: full ? "lista_espera" : "activa",
    });

    if (error) {
      console.error("[enrollFromLead]", courseId, error.message);
      failed += 1;
    } else if (full) {
      waitlisted += 1;
    } else {
      enrolled += 1;
    }
  }

  return { enrolled, waitlisted, failed, closed };
}

/** Matrículas `activa` de ese rol en el curso (las pausadas no ocupan plaza). */
async function countActive(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  role: EnrollmentRole,
): Promise<number> {
  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("role_in_course", role)
    .eq("status", "activa");
  return count ?? 0;
}

export async function convertLeadToStudent(
  _prev: LeadConversionState,
  formData: FormData,
): Promise<LeadConversionState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permiso para convertir leads." };
  }

  const parsed = leadConversionSchema.safeParse({
    lead_id: formData.get("lead_id"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    dance_role: formData.get("dance_role"),
    course_id: formData.get("course_id") ?? "",
    role_in_course: formData.get("role_in_course") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // 1) El lead debe existir y no estar ya convertido (doble clic, dos pestañas).
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, student_id, origen")
    .eq("id", data.lead_id)
    .maybeSingle();

  if (leadError || !lead) {
    return { status: "error", message: "Ese lead ya no existe." };
  }
  if (lead.student_id) {
    return {
      status: "error",
      message: "Este lead ya se convirtió en alumno.",
    };
  }

  // 2) Ficha de alumno.
  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      full_name: data.full_name,
      phone: toE164(data.phone) ?? data.phone,
      email: data.email,
      dance_role: data.dance_role,
      payment_status: "pendiente",
      active: true,
      is_founding_member: lead.origen === "socio-fundador",
    })
    .select("id")
    .single();

  if (studentError || !student) {
    console.error("[convertLeadToStudent] alumno:", studentError?.message);
    return { status: "error", message: studentInsertMessage(studentError) };
  }

  // 3) Matrícula opcional. Ni un aforo lleno ni un rol cerrado cancelan nada:
  //    la ficha ya está creada y perderla por eso sería peor. Se cuenta y se
  //    cuenta en el parte.
  let waitlisted = false;
  let enrolled = 0;
  const closed: string[] = [];
  if (data.course_id && data.role_in_course) {
    const role = data.role_in_course as EnrollmentRole;
    const { data: course } = await supabase
      .from("courses")
      .select("name, capacity_leaders, capacity_followers")
      .eq("id", data.course_id)
      .maybeSingle();

    const taken = await countActive(supabase, data.course_id, role);
    const capacity = course
      ? roleCapacity(course, role, taken)
      : ({ kind: "closed" } as const);

    if (capacity.kind === "closed") {
      closed.push(course?.name ?? "El curso elegido");
    } else {
      waitlisted = capacity.kind === "full";
      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_id: student.id,
        course_id: data.course_id,
        role_in_course: role,
        status: waitlisted ? "lista_espera" : "activa",
      });

      if (enrollError) {
        console.error("[convertLeadToStudent] matrícula:", enrollError.message);
      } else if (!waitlisted) {
        enrolled = 1;
      }
    }
  }

  // 4) Cerrar el lead sin perder su historia.
  const { error: linkError } = await supabase
    .from("leads")
    .update({
      student_id: student.id,
      converted_at: new Date().toISOString(),
      estado: "convertido",
    })
    .eq("id", data.lead_id);

  if (linkError) {
    console.error("[convertLeadToStudent] enlazar lead:", linkError.message);
  }

  revalidatePath("/area-privada/admin");
  revalidatePath("/area-privada/admin/leads");
  revalidatePath("/area-privada/admin/alumnos");
  if (data.course_id) revalidatePath(`/area-privada/admin/cursos/${data.course_id}`);

  // Mismo parte que la conversión rápida: la ficha ya sabe pintarlo y así el
  // aviso de lista de espera deja de depender de un parámetro que nadie leía.
  const query = buildConversionQuery({
    enrolled,
    waitlisted: waitlisted ? 1 : 0,
    failed: 0,
    closed,
    unmatched: [],
  });
  redirect(`/area-privada/admin/alumnos/${student.id}${query}`);
}

/**
 * Convertir un lead en alumno de un solo clic, desde la propia lista.
 *
 * El caso normal es que el lead ya traiga todo lo que la ficha necesita
 * (nombre, teléfono y, casi siempre, email): abrir un formulario para
 * confirmar tres campos que nadie toca era un paso de más. Además se
 * matricula en las clases que pidió — que es el motivo por el que escribió.
 *
 * `role` lo elige el admin en la propia tarjeta: es el único dato que el
 * formulario público nunca preguntó y `enrollments.role_in_course` no admite
 * nulos. Se guarda también como `dance_role` del alumno, porque es lo que el
 * admin acaba de afirmar y así las matrículas siguientes cuadran solas.
 *
 * Solo se delega en la pantalla larga cuando falta algo que hay que escribir a
 * mano: teléfono no convertible a E.164 o nombre inservible.
 */
export async function quickConvertLead(
  leadId: string,
  role: EnrollmentRole,
): Promise<QuickConversionResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso para convertir leads." };
  }
  if (role !== "leader" && role !== "follower") {
    return { ok: false, message: "Rol no válido." };
  }

  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, nombre, telefono, email, intereses, student_id, origen")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return { ok: false, message: "Ese lead ya no existe." };
  }
  if (lead.student_id) {
    // Doble clic o dos pestañas: no es un error, ya está hecho.
    return { ok: true, studentId: lead.student_id, query: "" };
  }

  const fullName = (lead.nombre ?? "").trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return {
      ok: false,
      needsForm: true,
      message: "El nombre del lead no sirve para una ficha. Complétalo a mano.",
    };
  }

  // El teléfono se guarda en E.164 si se puede deducir el prefijo, y si no tal
  // cual lo escribió el lead: hay alumnos de fuera con formatos de todo tipo y
  // bloquear la conversión por eso era peor que guardar el número raro.
  const rawPhone = (lead.telefono ?? "").trim();
  const phone = toE164(rawPhone) ?? rawPhone;
  if (!phone) {
    return {
      ok: false,
      needsForm: true,
      message: "El lead no tiene teléfono. Escríbelo a mano antes de crear la ficha.",
    };
  }

  // `students.email` admite null: un lead sin email se convierte igual y el
  // email se pide luego (sin él no habrá acceso al área privada, nada más).
  const email = (lead.email ?? "").trim().toLowerCase() || null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      full_name: fullName,
      phone,
      email,
      dance_role: role as DanceRole,
      payment_status: "pendiente",
      active: true,
      is_founding_member: lead.origen === "socio-fundador",
    })
    .select("id")
    .single();

  if (studentError || !student) {
    console.error("[quickConvertLead] alumno:", studentError?.message);
    return {
      ok: false,
      // Un email duplicado se resuelve editándolo: la pantalla larga sirve.
      needsForm: studentError?.code === "23505",
      message: studentInsertMessage(studentError),
    };
  }

  // Las clases que pidió. Solo cursos activos: matricular en uno retirado
  // dejaría una matrícula que no aparece por ningún lado.
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, weekday, start_time")
    .eq("active", true);

  const { courseIds, unmatched } = matchLeadCourses(lead.intereses, courses ?? []);
  const summary = await enrollFromLead(supabase, student.id, courseIds, role);

  const { error: linkError } = await supabase
    .from("leads")
    .update({
      student_id: student.id,
      converted_at: new Date().toISOString(),
      estado: "convertido",
    })
    .eq("id", leadId);

  if (linkError) {
    console.error("[quickConvertLead] enlazar lead:", linkError.message);
  }

  revalidatePath("/area-privada/admin");
  revalidatePath("/area-privada/admin/leads");
  revalidatePath("/area-privada/admin/alumnos");
  revalidatePath("/area-privada/admin/cursos");
  for (const courseId of courseIds) {
    revalidatePath(`/area-privada/admin/cursos/${courseId}`);
  }

  return {
    ok: true,
    studentId: student.id,
    query: buildConversionQuery({ ...summary, unmatched }),
  };
}
