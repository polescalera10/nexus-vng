"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatTime, WEEKDAYS } from "@/lib/format";
import { isAdminSession } from "@/lib/auth";
import { syncCourseTeachers } from "@/lib/queries/course-teachers";
import {
  currentMonthInMadrid,
  formatMonth,
  sessionDatesForMonth,
} from "@/lib/sessions";
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
    teacher_ids: formData.getAll("teacher_ids").map(String).filter(Boolean),
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

  // Los profes van en `course_teachers` (0032): un curso puede tener varios.
  const { error: teachersError } = await syncCourseTeachers(courseId, parsed.data.teacher_ids);
  if (teachersError) {
    console.error("[saveCourse] course_teachers:", teachersError);
    return {
      status: "error",
      message: "El curso se ha guardado, pero no se han podido asignar los profes.",
    };
  }

  revalidateCourse(courseId);
  redirect(`/area-privada/admin/cursos/${courseId}`);
}

/**
 * Genera las sesiones de UN MES para un curso, según su `weekday`.
 *
 * Por mes natural y no "las próximas N semanas": lo normal es dar al botón con
 * el mes ya empezado o a mitad, y con la lógica anterior se perdían las
 * sesiones ya pasadas del mes y se colaban las del siguiente (ver
 * `lib/sessions.ts`). Las fechas que ya existen se saltan — el unique
 * (course_id, session_date) las protege — así que se puede pulsar dos veces
 * sin duplicar nada.
 *
 * `month` en formato "YYYY-MM"; por omisión, el mes en curso en Madrid.
 */
export async function generateSessions(
  courseId: string,
  month?: string,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para generar sesiones." };
  }

  const mes = month ?? currentMonthInMadrid();

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, weekday, start_date, end_date")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return { status: "error", message: "Curso no encontrado." };

  const dates = sessionDatesForMonth(
    course.weekday,
    mes,
    course.start_date,
    course.end_date,
  );

  if (dates.length === 0) {
    return {
      status: "error",
      message: `No hay sesiones que generar en ${formatMonth(mes)}: el mes queda fuera del rango del curso.`,
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
    message: `${dates.length} ${dates.length === 1 ? "sesión" : "sesiones"} de ${formatMonth(mes)} (las que ya existían se conservan).`,
  };
}

/**
 * Lo mismo, para TODOS los cursos activos de una vez.
 *
 * Es el gesto real de principio de mes: quince cursos, quince clics. Los
 * cursos inactivos se quedan fuera — si no se imparten, no tienen sesiones.
 */
export async function generateSessionsForAllCourses(
  month?: string,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para generar sesiones." };
  }

  const mes = month ?? currentMonthInMadrid();

  const supabase = await createClient();
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, weekday, start_date, end_date")
    .eq("active", true);

  if (coursesError) {
    console.error("[generateSessionsForAllCourses] cursos:", coursesError.message);
    return { status: "error", message: "No se han podido leer los cursos." };
  }
  if (!courses || courses.length === 0) {
    return { status: "error", message: "No hay cursos activos." };
  }

  const rows = courses.flatMap((c) =>
    sessionDatesForMonth(c.weekday, mes, c.start_date, c.end_date).map(
      (session_date) => ({
        course_id: c.id,
        session_date,
        status: "programada" as const,
        substitute_teacher_id: null,
      }),
    ),
  );

  if (rows.length === 0) {
    return {
      status: "error",
      message: `Ningún curso activo tiene sesiones en ${formatMonth(mes)}.`,
    };
  }

  const { error } = await supabase
    .from("class_sessions")
    .upsert(rows, { onConflict: "course_id,session_date", ignoreDuplicates: true });

  if (error) {
    console.error("[generateSessionsForAllCourses] upsert:", error.message);
    return { status: "error", message: "No se han podido generar las sesiones." };
  }

  revalidateCourse();
  revalidatePath("/area-privada/admin");
  revalidatePath("/area-privada/profesor");
  return {
    status: "success",
    message: `${rows.length} sesiones de ${formatMonth(mes)} repartidas entre ${courses.length} cursos (las que ya existían se conservan).`,
  };
}

/** Lo que se perdería al borrar una sesión. */
export type SessionUsage = { asistencia: number; diario: boolean };

export type DeleteSessionResult = ActionResult & {
  /** Presente cuando hace falta confirmar porque la sesión tiene datos. */
  usage?: SessionUsage;
};

/**
 * Borra una sesión.
 *
 * `attendance`, `session_notes` y `session_videos` cuelgan con ON DELETE
 * CASCADE: borrar una sesión con lista pasada o diario se lleva esos datos y
 * no hay vuelta atrás. Por eso la primera llamada se NIEGA y devuelve el
 * recuento; la UI enseña qué se pierde y solo entonces repite con
 * `force: true`. Una sesión vacía se borra directamente, sin fricción.
 */
export async function deleteSession(
  sessionId: string,
  force = false,
): Promise<DeleteSessionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para borrar sesiones." };
  }

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, course_id, session_date")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return { status: "error", message: "Esa sesión ya no existe." };

  const [{ count: asistencia }, { count: notas }, { count: videos }] = await Promise.all([
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("class_session_id", sessionId),
    supabase
      .from("session_notes")
      .select("id", { count: "exact", head: true })
      .eq("class_session_id", sessionId),
    supabase
      .from("session_videos")
      .select("id", { count: "exact", head: true })
      .eq("class_session_id", sessionId),
  ]);

  const usage: SessionUsage = {
    asistencia: asistencia ?? 0,
    diario: (notas ?? 0) + (videos ?? 0) > 0,
  };

  if (!force && (usage.asistencia > 0 || usage.diario)) {
    const partes = [
      usage.asistencia > 0 &&
        `la lista de ${usage.asistencia} ${usage.asistencia === 1 ? "alumno" : "alumnos"}`,
      usage.diario && "el diario con sus vídeos",
    ].filter(Boolean);
    return {
      status: "error",
      usage,
      message: `Esta sesión tiene datos: se perdería ${partes.join(" y ")}. Confirma para borrarla.`,
    };
  }

  const { error } = await supabase.from("class_sessions").delete().eq("id", sessionId);
  if (error) {
    console.error("[deleteSession]", error.message);
    return { status: "error", message: "No se ha podido borrar la sesión." };
  }

  revalidateCourse(session.course_id);
  revalidatePath("/area-privada/admin");
  return { status: "success", message: "Sesión borrada." };
}

/**
 * Cambia la fecha de una sesión (una clase que se mueve de día).
 *
 * Mover en vez de borrar y volver a crear conserva la lista y el diario, que
 * es justo lo que se quiere cuando la clase del martes se pasa al jueves.
 * El unique (course_id, session_date) impide dejar dos sesiones el mismo día:
 * ese choque se traduce a un mensaje, no a un error de Postgres en pantalla.
 */
export async function updateSessionDate(
  sessionId: string,
  sessionDate: string,
): Promise<ActionResult> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para editar sesiones." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
    return { status: "error", message: "Esa fecha no es válida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .update({ session_date: sessionDate })
    .eq("id", sessionId)
    .select("course_id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "Ya hay una sesión de este curso ese día.",
      };
    }
    console.error("[updateSessionDate]", error?.message);
    return { status: "error", message: "No se ha podido cambiar la fecha." };
  }

  revalidateCourse(data.course_id);
  revalidatePath("/area-privada/admin");
  return { status: "success", message: "Fecha actualizada." };
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
