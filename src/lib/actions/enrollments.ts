"use server";

import { revalidatePath } from "next/cache";
import { formatTime, WEEKDAYS } from "@/lib/format";
import { isAdminSession } from "@/lib/auth";
import {
  closedRoleMessage,
  effectiveCapacity,
  overbookedMessage,
} from "@/lib/enrollment-capacity";
import { aboveLevelMessage, checkLevel } from "@/lib/level-access";
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
 * Aviso si el curso va por encima del nivel del alumno ("se puede bajar, no
 * saltar"). Nunca bloquea: quien decide si alguien está listo es el profe.
 * Devuelve null cuando no hay nada que comparar o el nivel encaja.
 */
async function levelNotice(
  studentNivelId: string | null,
  courseNivelId: string | null,
): Promise<string | null> {
  if (!courseNivelId) return null;

  const supabase = await createClient();
  const ids = [courseNivelId, ...(studentNivelId ? [studentNivelId] : [])];
  const { data } = await supabase
    .from("niveles")
    .select("id, nombre, orden")
    .in("id", ids);

  const byId = new Map((data ?? []).map((n) => [n.id, n]));
  const check = checkLevel(
    studentNivelId ? (byId.get(studentNivelId) ?? null) : null,
    byId.get(courseNivelId) ?? null,
  );
  return check.kind === "above" ? aboveLevelMessage(check) : null;
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
    .select("id, full_name, dance_role, active, is_founding_member, nivel_id")
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
    .select("id, name, nivel_id, capacity_leaders, capacity_followers")
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

  // Aforo del rol. El socio fundador entra aunque esté lleno: la plaza se
  // vendió como acceso, no como cupo (ver FOUNDING_BYPASSES_CAPACITY).
  const current = await countActive(course_id, role_in_course);
  const capacity = effectiveCapacity(
    course,
    role_in_course,
    current,
    student.is_founding_member,
  );

  // Rol cerrado: no hay lista de espera que valga, la plaza no existe.
  if (capacity.kind === "closed") {
    return {
      status: "error",
      errors: { role_in_course: [closedRoleMessage(course.name, role_in_course)] },
    };
  }

  const isFull = capacity.kind === "full";
  if (isFull && !to_waitlist) {
    return {
      status: "full",
      message: `Aforo de ${ROLE_LABEL[role_in_course]} completo (${current}/${course[role_in_course === "leader" ? "capacity_leaders" : "capacity_followers"]}). Confirma para apuntar a ${student.full_name} a la lista de espera.`,
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

  const avisos = [
    newStatus === "activa"
      ? `${student.full_name} matriculado/a como ${role_in_course}.`
      : `${student.full_name} apuntado/a a la lista de espera.`,
    capacity.kind === "overbooked"
      ? overbookedMessage(course.name, role_in_course, capacity.over)
      : null,
    await levelNotice(student.nivel_id, course.nivel_id),
  ].filter((m): m is string => m !== null);

  return { status: "success", message: avisos.join(" ") };
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

  const { data: waiting } = await supabase
    .from("students")
    .select("is_founding_member")
    .eq("id", enrollment.student_id)
    .maybeSingle();

  const { data: course } = await supabase
    .from("courses")
    .select("name, weekday, start_time, capacity_leaders, capacity_followers")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const current = await countActive(enrollment.course_id, enrollment.role_in_course);
  const capacity = effectiveCapacity(
    course,
    enrollment.role_in_course,
    current,
    waiting?.is_founding_member ?? false,
  );

  if (capacity.kind === "closed") {
    return {
      status: "error",
      message: `${closedRoleMessage(course.name, enrollment.role_in_course)} Cambia el rol de la matrícula antes de activarla.`,
    };
  }
  if (capacity.kind === "full") {
    return {
      status: "error",
      message: `El aforo de ${ROLE_LABEL[enrollment.role_in_course]} sigue completo (${current}). Libera una plaza antes de promocionar.`,
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
  return {
    status: "success",
    message:
      capacity.kind === "overbooked"
        ? overbookedMessage(course.name, enrollment.role_in_course, capacity.over)
        : "Matrícula pasada a activa.",
  };
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
    .select("name, capacity_leaders, capacity_followers")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const { data: moving } = await supabase
    .from("students")
    .select("is_founding_member")
    .eq("id", enrollment.student_id)
    .maybeSingle();

  const capacity = effectiveCapacity(
    course,
    role,
    await countActive(enrollment.course_id, role),
    moving?.is_founding_member ?? false,
  );

  // Pasar a un rol que la clase no admite dejaría una matrícula imposible.
  if (capacity.kind === "closed") {
    return { status: "error", message: closedRoleMessage(course.name, role) };
  }
  const full = capacity.kind === "full" && enrollment.status === "activa";

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
    .select("id, active, is_founding_member, nivel_id")
    .eq("id", studentId)
    .maybeSingle();
  if (!student || !student.active) {
    return { status: "error", message: "Alumno no encontrado o inactivo." };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, nivel_id, capacity_leaders, capacity_followers")
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

  const capacity = effectiveCapacity(
    course,
    role,
    await countActive(courseId, role),
    student.is_founding_member,
  );
  if (capacity.kind === "closed") {
    return { status: "error", message: closedRoleMessage(course.name, role) };
  }
  const full = capacity.kind === "full";
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

  const avisos = [
    full ? `Aforo de ${ROLE_LABEL[role]} completo: entra en lista de espera.` : null,
    capacity.kind === "overbooked"
      ? overbookedMessage(course.name, role, capacity.over)
      : null,
    await levelNotice(student.nivel_id, course.nivel_id),
  ].filter((m): m is string => m !== null);

  return {
    status: "success",
    message: avisos.length > 0 ? avisos.join(" ") : undefined,
  };
}
