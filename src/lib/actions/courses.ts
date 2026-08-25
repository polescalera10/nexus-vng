"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatTime, WEEKDAYS } from "@/lib/format";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { courseSchema } from "@/lib/validation/course";
import { dispatchWhatsappEvent } from "@/lib/whatsapp/dispatch";
import type { SessionStatus } from "@/types/database";

/**
 * Server Actions del módulo Cursos (solo admin).
 * Patrón: validar (Zod) → mutar vía createClient() (respeta RLS) → revalidar.
 * Al asignar sustituto se despacha su aviso de WhatsApp (vía n8n).
 */

export type CourseFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Errores por campo, para feedback inline. */
  errors?: Record<string, string[]>;
};

export type ActionResult = {
  status: "success" | "error";
  message?: string;
};

/** true si el usuario logueado es admin (defensa además de la RLS). */

/** Revalida las vistas (admin + profe) que pintan datos del curso. */
function revalidateCourse(courseId?: string) {
  revalidatePath("/area-privada/admin/cursos");
  revalidatePath("/area-privada/profesor/cursos");
  if (courseId) {
    revalidatePath(`/area-privada/admin/cursos/${courseId}`);
    revalidatePath(`/area-privada/profesor/cursos/${courseId}`);
  }
}

/**
 * Alta/edición de curso. Si `formData` trae `id`, actualiza; si no, crea.
 * Tras guardar redirige al detalle del curso.
 */
export async function saveCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para gestionar cursos." };
  }

  const id = String(formData.get("id") ?? "");

  const raw = {
    name: formData.get("name"),
    modalidad_id: formData.get("modalidad_id"),
    nivel_id: formData.get("nivel_id") ?? "",
    teacher_id: formData.get("teacher_id") ?? "",
    weekday: formData.get("weekday"),
    start_time: formData.get("start_time"),
    duration_min: formData.get("duration_min"),
    capacity_leaders: formData.get("capacity_leaders"),
    capacity_followers: formData.get("capacity_followers"),
    cycle_type: formData.get("cycle_type"),
    start_date: formData.get("start_date") ?? "",
    end_date: formData.get("end_date") ?? "",
    active: formData.get("active") === "on",
  };

  const parsed = courseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = {
    name: parsed.data.name,
    modalidad_id: parsed.data.modalidad_id,
    nivel_id: parsed.data.nivel_id || null,
    teacher_id: parsed.data.teacher_id || null,
    weekday: parsed.data.weekday,
    start_time: parsed.data.start_time,
    duration_min: parsed.data.duration_min,
    capacity_leaders: parsed.data.capacity_leaders,
    capacity_followers: parsed.data.capacity_followers,
    cycle_type: parsed.data.cycle_type,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    active: parsed.data.active,
  };

  const supabase = await createClient();
  let courseId = id;

  if (id) {
    const { error } = await supabase.from("courses").update(values).eq("id", id);
    if (error) {
      console.error("[saveCourse] update error:", error.message);
      return { status: "error", message: "No se ha podido guardar el curso. Inténtalo de nuevo." };
    }
  } else {
    const { data, error } = await supabase
      .from("courses")
      .insert(values)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[saveCourse] insert error:", error?.message);
      return { status: "error", message: "No se ha podido crear el curso. Inténtalo de nuevo." };
    }
    courseId = data.id;
  }

  revalidateCourse(courseId);
  redirect(`/area-privada/admin/cursos/${courseId}`);
}

/** Date local → "YYYY-MM-DD" (sin sorpresas de zona horaria). */
function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Genera las próximas sesiones del curso según su `weekday` (1=Lun … 7=Dom):
 * desde hoy (o `start_date` si es futura), `weeks` ocurrencias, sin rebasar
 * `end_date`. Las fechas ya existentes se saltan (unique course_id+session_date).
 */
export async function generateSessions(
  courseId: string,
  weeks = 4,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para generar sesiones." };
  }

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (course.start_date) {
    const start = new Date(`${course.start_date}T00:00:00`);
    if (start > cursor) cursor.setTime(start.getTime());
  }

  // weekday 1=Lun…7=Dom → getDay() 0=Dom…6=Sáb.
  const targetDay = course.weekday % 7;
  while (cursor.getDay() !== targetDay) cursor.setDate(cursor.getDate() + 1);

  const end = course.end_date ? new Date(`${course.end_date}T00:00:00`) : null;
  const dates: string[] = [];
  for (let i = 0; i < weeks; i++) {
    if (end && cursor > end) break;
    dates.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  if (dates.length === 0) {
    return {
      status: "error",
      message: "No hay fechas que generar: el curso ya ha terminado (end_date pasada).",
    };
  }

  const { error } = await supabase.from("class_sessions").upsert(
    dates.map((session_date) => ({
      course_id: courseId,
      session_date,
      status: "programada" as const,
      substitute_teacher_id: null,
    })),
    { onConflict: "course_id,session_date", ignoreDuplicates: true },
  );

  if (error) {
    console.error("[generateSessions] upsert error:", error.message);
    return { status: "error", message: "No se han podido generar las sesiones." };
  }

  revalidateCourse(courseId);
  return {
    status: "success",
    message: `Sesiones generadas hasta el ${dates[dates.length - 1]} (las existentes se conservan).`,
  };
}

/** Cambia el estado de una sesión (programada ⇄ cancelada). */
export async function updateSessionStatus(
  sessionId: string,
  status: Extract<SessionStatus, "programada" | "cancelada">,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para editar sesiones." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .update({ status })
    .eq("id", sessionId)
    .select("course_id")
    .single();

  if (error || !data) {
    console.error("[updateSessionStatus] error:", error?.message);
    return { status: "error", message: "No se ha podido actualizar la sesión." };
  }

  revalidateCourse(data.course_id);
  return {
    status: "success",
    message: status === "cancelada" ? "Sesión cancelada." : "Sesión reprogramada.",
  };
}

/**
 * Asigna (o quita, con `teacherId = null`) el profe sustituto de una sesión.
 * Al asignar (no al quitar) se despacha el aviso de WhatsApp al sustituto:
 * como `whatsapp_events.student_id` es FK a students y el destinatario es un
 * teacher, se registra como `broadcast` con `payload.kind = 'sustitucion'` y
 * el profe dentro de payload.recipients[] (ver docs/whatsapp-contracts.md;
 * un enum dedicado queda anotado para Fase 4). Best-effort: nunca lanza.
 */
export async function assignSubstitute(
  sessionId: string,
  teacherId: string | null,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para asignar sustitutos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .update({ substitute_teacher_id: teacherId })
    .eq("id", sessionId)
    .select("course_id, session_date")
    .single();

  if (error || !data) {
    console.error("[assignSubstitute] error:", error?.message);
    return { status: "error", message: "No se ha podido guardar la sustitución." };
  }

  if (teacherId) {
    const [{ data: teacher }, { data: course }] = await Promise.all([
      supabase
        .from("teachers")
        .select("id, full_name, phone")
        .eq("id", teacherId)
        .maybeSingle(),
      supabase
        .from("courses")
        .select("name, weekday, start_time")
        .eq("id", data.course_id)
        .maybeSingle(),
    ]);

    if (teacher && course) {
      await dispatchWhatsappEvent(supabase, {
        type: "broadcast",
        studentId: null,
        payload: {
          kind: "sustitucion",
          recipients: [
            {
              teacher_id: teacher.id,
              full_name: teacher.full_name,
              phone: teacher.phone,
            },
          ],
          course_name: course.name,
          session_date: data.session_date,
          weekday: WEEKDAYS[course.weekday],
          start_time: formatTime(course.start_time),
        },
      });
    } else {
      console.error("[assignSubstitute] sin datos para el aviso al sustituto.");
    }
  }

  revalidateCourse(data.course_id);
  return {
    status: "success",
    message: teacherId ? "Sustituto asignado." : "Sustitución retirada.",
  };
}
