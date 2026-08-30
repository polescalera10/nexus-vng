"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
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
  | { ok: true; studentId: string }
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
    .select("id, student_id")
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
      phone: data.phone,
      email: data.email,
      dance_role: data.dance_role,
      payment_status: "pendiente",
      active: true,
    })
    .select("id")
    .single();

  if (studentError || !student) {
    console.error("[convertLeadToStudent] alumno:", studentError?.message);
    return { status: "error", message: studentInsertMessage(studentError) };
  }

  // 3) Matrícula opcional. Si el rol está lleno entra en lista de espera en vez
  //    de fallar: la ficha ya está creada y perderla por un aforo sería peor.
  let waitlisted = false;
  if (data.course_id && data.role_in_course) {
    const role = data.role_in_course as EnrollmentRole;
    const { data: course } = await supabase
      .from("courses")
      .select("capacity_leaders, capacity_followers")
      .eq("id", data.course_id)
      .maybeSingle();

    const capacity =
      role === "leader" ? (course?.capacity_leaders ?? 0) : (course?.capacity_followers ?? 0);
    const taken = await countActive(supabase, data.course_id, role);
    waitlisted = capacity > 0 && taken >= capacity;

    const { error: enrollError } = await supabase.from("enrollments").insert({
      student_id: student.id,
      course_id: data.course_id,
      role_in_course: role,
      status: waitlisted ? "lista_espera" : "activa",
    });

    if (enrollError) {
      // La ficha se queda creada: es lo valioso. Se avisa para matricular a mano.
      console.error("[convertLeadToStudent] matrícula:", enrollError.message);
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

  redirect(
    `/area-privada/admin/alumnos/${student.id}${waitlisted ? "?aviso=lista_espera" : ""}`,
  );
}

/**
 * Convertir un lead en alumno de un solo clic, desde la propia lista.
 *
 * El caso normal es que el lead ya traiga todo lo que la ficha necesita
 * (nombre, teléfono y, casi siempre, email): abrir un formulario para
 * confirmar tres campos que nadie toca era un paso de más. Aquí se crea la
 * ficha con lo que hay y se deja el resto —cumpleaños, nivel, pareja, curso—
 * para la ficha del alumno, que es donde se rellena de verdad.
 *
 * Solo se delega en la pantalla larga cuando falta algo que hay que escribir a
 * mano: teléfono no convertible a E.164 o nombre inservible.
 */
export async function quickConvertLead(leadId: string): Promise<QuickConversionResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso para convertir leads." };
  }

  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, nombre, telefono, email, student_id")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return { ok: false, message: "Ese lead ya no existe." };
  }
  if (lead.student_id) {
    // Doble clic o dos pestañas: no es un error, ya está hecho.
    return { ok: true, studentId: lead.student_id };
  }

  const fullName = (lead.nombre ?? "").trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return {
      ok: false,
      needsForm: true,
      message: "El nombre del lead no sirve para una ficha. Complétalo a mano.",
    };
  }

  const phone = toE164(lead.telefono ?? "");
  if (!phone) {
    return {
      ok: false,
      needsForm: true,
      message: `El teléfono (${lead.telefono}) no es un número internacional válido.`,
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
      dance_role: "both" as DanceRole,
      payment_status: "pendiente",
      active: true,
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

  return { ok: true, studentId: student.id };
}
