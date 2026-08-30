"use server";

import { revalidatePath } from "next/cache";
import { formatTime, WEEKDAYS } from "@/lib/format";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validation/enrollment";
import { dispatchWhatsappEvent } from "@/lib/whatsapp/dispatch";
import type { EnrollmentRole, InscripcionEstado } from "@/types/database";

/**
 * Server Actions de matrícula (solo admin).
 * El control de aforo por rol (leader/follower) vive aquí: la BD no lo
 * impone (ver 0015_enrollments.sql). Al promover desde lista de espera se
 * despacha el aviso de WhatsApp `confirmacion_lista_espera` (vía n8n).
 */

export type EnrollFormState = {
  status: "idle" | "success" | "error" | "full";
  message?: string;
  errors?: Record<string, string[]>;
};

export type EnrollmentActionResult = {
  status: "success" | "error";
  message?: string;
};

const ROLE_LABEL: Record<EnrollmentRole, string> = {
  leader: "leaders",
  follower: "followers",
};


function revalidateCourse(courseId: string, studentId?: string) {
  revalidatePath("/area-privada/admin/cursos");
  revalidatePath("/area-privada/profesor/cursos");
  revalidatePath(`/area-privada/admin/cursos/${courseId}`);
  revalidatePath(`/area-privada/profesor/cursos/${courseId}`);
  if (studentId) {
    revalidatePath(`/area-privada/admin/alumnos/${studentId}`);
    revalidatePath(`/area-privada/admin/alumnos/${studentId}/editar`);
  }
}

/**
 * Aforo lleno para ese rol. Capacidad 0 significa "no se controla" (así lo
 * dejó 0013_courses y así lo lee `getCourseOptions`), no "no cabe nadie": sin
 * esta distinción el catálogo actual, todo a 0/0, daría lleno siempre.
 */
function isRoleFull(capacity: number, current: number): boolean {
  return capacity > 0 && current >= capacity;
}

/** Matrículas `activa` del rol en el curso (las pausadas no cuentan). */
async function countActive(courseId: string, role: EnrollmentRole): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("role_in_course", role)
    .eq("status", "activa");
  return count ?? 0;
}

/**
 * Matricula a un alumno en un curso con control de aforo por rol:
 * si cabe → `activa`; si está lleno → devuelve `status: "full"` y la UI
 * pide confirmación para reenviar con `to_waitlist=true` → `lista_espera`.
 * Si el alumno tuvo una matrícula en `baja`, se reutiliza esa fila
 * (unique student_id+course_id).
 */
export async function enrollStudent(
  _prev: EnrollFormState,
  formData: FormData,
): Promise<EnrollFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para matricular alumnos." };
  }

  const raw = {
    course_id: formData.get("course_id"),
    student_id: formData.get("student_id"),
    role_in_course: formData.get("role_in_course"),
    to_waitlist: formData.get("to_waitlist") === "true",
  };

  const parsed = enrollmentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { course_id, student_id, role_in_course, to_waitlist } = parsed.data;
  const supabase = await createClient();

  // Alumno: debe existir, estar activo y ser compatible con el rol elegido.
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, dance_role, active")
    .eq("id", student_id)
    .maybeSingle();
  if (!student || !student.active) {
    return { status: "error", message: "Alumno no encontrado o inactivo." };
  }
  if (student.dance_role !== "both" && student.dance_role !== role_in_course) {
    return {
      status: "error",
      errors: {
        role_in_course: [
          `Este alumno baila como ${student.dance_role}; no puede matricularse como ${role_in_course}.`,
        ],
      },
    };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, capacity_leaders, capacity_followers")
    .eq("id", course_id)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  // Matrícula previa: solo se reutiliza si está en `baja`.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("course_id", course_id)
    .eq("student_id", student_id)
    .maybeSingle();
  if (existing && existing.status !== "baja") {
    return {
      status: "error",
      message: "Este alumno ya está matriculado (o en lista de espera) en el curso.",
    };
  }

  // Aforo del rol.
  const capacity =
    role_in_course === "leader" ? course.capacity_leaders : course.capacity_followers;
  const current = await countActive(course_id, role_in_course);
  const isFull = isRoleFull(capacity, current);

  if (isFull && !to_waitlist) {
    return {
      status: "full",
      message: `Aforo de ${ROLE_LABEL[role_in_course]} completo (${current}/${capacity}). Confirma para apuntar a ${student.full_name} a la lista de espera.`,
    };
  }

  const newStatus: InscripcionEstado = isFull ? "lista_espera" : "activa";

  const { error } = existing
    ? await supabase
        .from("enrollments")
        .update({
          role_in_course,
          status: newStatus,
          enrolled_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    : await supabase
        .from("enrollments")
        .insert({ course_id, student_id, role_in_course, status: newStatus });

  if (error) {
    console.error("[enrollStudent] error:", error.message);
    return { status: "error", message: "No se ha podido guardar la matrícula." };
  }

  revalidateCourse(course_id, student_id);
  return {
    status: "success",
    message:
      newStatus === "activa"
        ? `${student.full_name} matriculado/a como ${role_in_course}.`
        : `${student.full_name} apuntado/a a la lista de espera.`,
  };
}

/**
 * Cambia el estado de una matrícula: baja desde el detalle del curso, y
 * pausar/reactivar desde la ficha del alumno.
 *
 * Reactivar a alguien que estaba en lista de espera pasa por
 * `promoteFromWaitlist`, que revalida el aforo y avisa por WhatsApp. Sin ese
 * desvío, este atajo sería la forma de colar a alguien en un curso lleno.
 */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: InscripcionEstado,
): Promise<EnrollmentActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para editar matrículas." };
  }

  const supabase = await createClient();

  if (status === "activa") {
    const { data: current } = await supabase
      .from("enrollments")
      .select("status")
      .eq("id", enrollmentId)
      .maybeSingle();
    if (current?.status === "lista_espera") return promoteFromWaitlist(enrollmentId);
  }
  const { data, error } = await supabase
    .from("enrollments")
    .update({ status })
    .eq("id", enrollmentId)
    .select("course_id, student_id")
    .single();

  if (error || !data) {
    console.error("[updateEnrollmentStatus] error:", error?.message);
    return { status: "error", message: "No se ha podido actualizar la matrícula." };
  }

  revalidateCourse(data.course_id, data.student_id);
  return {
    status: "success",
    message: status === "baja" ? "Matrícula dada de baja." : "Matrícula actualizada.",
  };
}

/**
 * Pasa una matrícula de `lista_espera` a `activa`, revalidando antes el
 * aforo del rol: si sigue lleno, error claro y no se toca nada.
 * Tras promover con éxito despacha el aviso `confirmacion_lista_espera`
 * (best-effort: un fallo del webhook no revierte la promoción).
 */
export async function promoteFromWaitlist(
  enrollmentId: string,
): Promise<EnrollmentActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para editar matrículas." };
  }

  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, course_id, student_id, role_in_course, status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (!enrollment || enrollment.status !== "lista_espera") {
    return { status: "error", message: "Esta matrícula ya no está en lista de espera." };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("name, weekday, start_time, capacity_leaders, capacity_followers")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const capacity =
    enrollment.role_in_course === "leader"
      ? course.capacity_leaders
      : course.capacity_followers;
  const current = await countActive(enrollment.course_id, enrollment.role_in_course);

  if (isRoleFull(capacity, current)) {
    return {
      status: "error",
      message: `El aforo de ${ROLE_LABEL[enrollment.role_in_course]} sigue completo (${current}/${capacity}). Libera una plaza antes de promocionar.`,
    };
  }

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "activa" })
    .eq("id", enrollmentId);

  if (error) {
    console.error("[promoteFromWaitlist] error:", error.message);
    return { status: "error", message: "No se ha podido pasar la matrícula a activa." };
  }

  // Aviso de plaza confirmada (WhatsApp vía n8n). Best-effort: nunca lanza.
  const { data: student } = await supabase
    .from("students")
    .select("full_name, phone")
    .eq("id", enrollment.student_id)
    .maybeSingle();
  if (student) {
    await dispatchWhatsappEvent(supabase, {
      type: "confirmacion_lista_espera",
      studentId: enrollment.student_id,
      payload: {
        student_name: student.full_name,
        phone: student.phone,
        course_name: course.name,
        weekday: WEEKDAYS[course.weekday],
        start_time: formatTime(course.start_time),
      },
    });
  }

  revalidateCourse(enrollment.course_id, enrollment.student_id);
  return { status: "success", message: "Matrícula pasada a activa." };
}

/**
 * Cambia el rol de una matrícula (leader ↔ follower) desde la ficha del alumno.
 *
 * Es el arreglo del error más probable de la conversión rápida: allí el rol se
 * elige de memoria, en un clic, y a veces se falla. Se comprueba el aforo del
 * rol de destino y, si está lleno, la matrícula pasa a lista de espera en vez
 * de saltarse el cupo por la puerta de atrás.
 */
export async function setEnrollmentRole(
  enrollmentId: string,
  role: EnrollmentRole,
): Promise<EnrollmentActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para editar matrículas." };
  }
  if (role !== "leader" && role !== "follower") {
    return { status: "error", message: "Rol no válido." };
  }

  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, course_id, student_id, role_in_course, status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (!enrollment) return { status: "error", message: "Matrícula no encontrada." };
  if (enrollment.role_in_course === role) return { status: "success" };

  const { data: course } = await supabase
    .from("courses")
    .select("capacity_leaders, capacity_followers")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const capacity = role === "leader" ? course.capacity_leaders : course.capacity_followers;
  const full =
    enrollment.status === "activa" &&
    isRoleFull(capacity, await countActive(enrollment.course_id, role));

  const { error } = await supabase
    .from("enrollments")
    .update({
      role_in_course: role,
      ...(full ? { status: "lista_espera" as InscripcionEstado } : {}),
    })
    .eq("id", enrollmentId);

  if (error) {
    console.error("[setEnrollmentRole] error:", error.message);
    return { status: "error", message: "No se ha podido cambiar el rol." };
  }

  revalidateCourse(enrollment.course_id, enrollment.student_id);
  return {
    status: "success",
    message: full
      ? `Aforo de ${ROLE_LABEL[role]} completo: la matrícula pasa a lista de espera.`
      : undefined,
  };
}

/**
 * Matricula desde la ficha del alumno. A diferencia de `enrollStudent`, que
 * pide confirmación antes de mandar a nadie a la lista de espera, aquí se
 * apunta y se avisa: el admin está editando una lista de clases, no dando de
 * alta en un curso concreto, y frenar con un diálogo por cada aforo lleno
 * convertiría la edición en un interrogatorio.
 *
 * Reutiliza la fila si el alumno ya estuvo matriculado y se dio de baja
 * (`unique (student_id, course_id)` de 0015).
 */
export async function addStudentEnrollment(
  studentId: string,
  courseId: string,
  role: EnrollmentRole,
): Promise<EnrollmentActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para matricular alumnos." };
  }
  if (role !== "leader" && role !== "follower") {
    return { status: "error", message: "Rol no válido." };
  }

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, active")
    .eq("id", studentId)
    .maybeSingle();
  if (!student || !student.active) {
    return { status: "error", message: "Alumno no encontrado o inactivo." };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, capacity_leaders, capacity_followers")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (existing && existing.status !== "baja") {
    return { status: "error", message: "Ya está matriculado en ese curso." };
  }

  const capacity = role === "leader" ? course.capacity_leaders : course.capacity_followers;
  const full = isRoleFull(capacity, await countActive(courseId, role));
  const newStatus: InscripcionEstado = full ? "lista_espera" : "activa";

  const { error } = existing
    ? await supabase
        .from("enrollments")
        .update({
          role_in_course: role,
          status: newStatus,
          enrolled_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    : await supabase
        .from("enrollments")
        .insert({ course_id: courseId, student_id: studentId, role_in_course: role, status: newStatus });

  if (error) {
    console.error("[addStudentEnrollment] error:", error.message);
    return { status: "error", message: "No se ha podido guardar la matrícula." };
  }

  revalidateCourse(courseId, studentId);
  return {
    status: "success",
    message: full
      ? `Aforo de ${ROLE_LABEL[role]} completo: entra en lista de espera.`
      : undefined,
  };
}
