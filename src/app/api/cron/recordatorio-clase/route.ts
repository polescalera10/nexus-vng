import { NextResponse } from "next/server";
import { cronRequestIsAuthorized } from "@/lib/cron-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatTime, WEEKDAYS } from "@/lib/format";
import { dispatchWhatsappEvent } from "@/lib/whatsapp/dispatch";

/**
 * GET /api/cron/recordatorio-clase — lo llama n8n una vez al día (cron).
 * Protegido por el header `x-cron-secret` == CRON_SECRET (env).
 * Usa el service role (no hay sesión de usuario): NO pasa por RLS.
 *
 * Lógica (docs/whatsapp-contracts.md):
 *   1. Asegura las `class_sessions` de MAÑANA para los cursos activos cuyo
 *      `weekday` coincida (upsert ignorando duplicados, respetando
 *      start_date/end_date).
 *   2. Para cada sesión `programada` de mañana, despacha un evento
 *      `recordatorio_clase` por alumno con matrícula `activa` (y alumno
 *      activo), con dedupe por `payload->>session_id`.
 *
 * Responde JSON { sessions, dispatched, skipped }.
 */

/** Date local → "YYYY-MM-DD" (sin sorpresas de zona horaria). */
function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[recordatorio-clase] CRON_SECRET no configurado.");
    return NextResponse.json(
      { error: "CRON_SECRET no configurado en el servidor." },
      { status: 500 },
    );
  }
  if (!cronRequestIsAuthorized(request, secret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Mañana, en hora local del servidor.
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateISO = toISODate(tomorrow);
  // getDay(): 0=Dom…6=Sáb → convención del panel 1=Lun…7=Dom.
  const weekday = tomorrow.getDay() === 0 ? 7 : tomorrow.getDay();

  // 1) Asegurar las sesiones de mañana de los cursos activos de ese día.
  const { data: weekdayCourses, error: coursesError } = await supabase
    .from("courses")
    .select("id, start_date, end_date")
    .eq("active", true)
    .eq("weekday", weekday);
  if (coursesError) {
    console.error("[recordatorio-clase] courses error:", coursesError.message);
    return NextResponse.json({ error: "Error leyendo cursos." }, { status: 500 });
  }

  const eligible = (weekdayCourses ?? []).filter(
    (c) =>
      (!c.start_date || c.start_date <= dateISO) &&
      (!c.end_date || c.end_date >= dateISO),
  );
  if (eligible.length > 0) {
    const { error: upsertError } = await supabase.from("class_sessions").upsert(
      eligible.map((c) => ({
        course_id: c.id,
        session_date: dateISO,
        status: "programada" as const,
        substitute_teacher_id: null,
      })),
      { onConflict: "course_id,session_date", ignoreDuplicates: true },
    );
    if (upsertError) {
      console.error("[recordatorio-clase] upsert error:", upsertError.message);
    }
  }

  // 2) Sesiones programadas de mañana (incluye las generadas a mano).
  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select("id, course_id")
    .eq("session_date", dateISO)
    .eq("status", "programada");
  if (sessionsError) {
    console.error("[recordatorio-clase] sessions error:", sessionsError.message);
    return NextResponse.json({ error: "Error leyendo sesiones." }, { status: 500 });
  }

  const sessionRows = sessions ?? [];
  if (sessionRows.length === 0) {
    return NextResponse.json({ sessions: 0, dispatched: 0, skipped: 0 });
  }

  // Datos de curso, matrículas activas y alumnos — queries planas.
  const courseIds = [...new Set(sessionRows.map((s) => s.course_id))];
  const [courseRes, enrollRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, weekday, start_time")
      .in("id", courseIds),
    supabase
      .from("enrollments")
      .select("student_id, course_id")
      .in("course_id", courseIds)
      .eq("status", "activa"),
  ]);

  const courseById = new Map((courseRes.data ?? []).map((c) => [c.id, c]));
  const enrollments = enrollRes.data ?? [];

  const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
  const studentById = new Map<
    string,
    { id: string; full_name: string; phone: string }
  >();
  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, phone")
      .eq("active", true)
      .in("id", studentIds);
    for (const s of students ?? []) studentById.set(s.id, s);
  }

  // Dedupe: eventos `recordatorio_clase` ya creados para estas sesiones.
  // Solo este cron crea el tipo y siempre el día antes de la sesión, así que
  // una ventana de 7 días de created_at cubre cualquier reejecución.
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data: previous } = await supabase
    .from("whatsapp_events")
    .select("student_id, payload")
    .eq("type", "recordatorio_clase")
    .gte("created_at", since.toISOString());

  const sessionIdSet = new Set(sessionRows.map((s) => s.id));
  const alreadySent = new Set<string>();
  for (const ev of previous ?? []) {
    const sessionId = (ev.payload as Record<string, unknown>)?.session_id;
    if (typeof sessionId === "string" && sessionIdSet.has(sessionId) && ev.student_id) {
      alreadySent.add(`${sessionId}:${ev.student_id}`);
    }
  }

  const enrollmentsByCourse = new Map<string, string[]>();
  for (const e of enrollments) {
    const list = enrollmentsByCourse.get(e.course_id) ?? [];
    list.push(e.student_id);
    enrollmentsByCourse.set(e.course_id, list);
  }

  let dispatched = 0;
  let skipped = 0;

  for (const session of sessionRows) {
    const course = courseById.get(session.course_id);
    if (!course) continue;

    for (const studentId of enrollmentsByCourse.get(session.course_id) ?? []) {
      const student = studentById.get(studentId);
      if (!student) continue; // matrícula activa pero alumno de baja
      if (alreadySent.has(`${session.id}:${studentId}`)) {
        skipped += 1;
        continue;
      }

      await dispatchWhatsappEvent(supabase, {
        type: "recordatorio_clase",
        studentId,
        payload: {
          session_id: session.id,
          course_id: course.id,
          course_name: course.name,
          session_date: dateISO,
          weekday: WEEKDAYS[course.weekday],
          start_time: formatTime(course.start_time),
          student_name: student.full_name,
          phone: student.phone,
        },
      });
      alreadySent.add(`${session.id}:${studentId}`);
      dispatched += 1;
    }
  }

  return NextResponse.json({ sessions: sessionRows.length, dispatched, skipped });
}
