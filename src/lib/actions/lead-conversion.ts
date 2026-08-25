"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { leadConversionSchema } from "@/lib/validation/lead-conversion";
import type { EnrollmentRole } from "@/types/database";

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
    return {
      status: "error",
      message:
        studentError?.code === "23505"
          ? "Ya hay un alumno con ese email."
          : "No se ha podido crear la ficha de alumno.",
    };
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
