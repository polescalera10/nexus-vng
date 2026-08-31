import { getCourseIdsForTeacher } from "@/lib/queries/course-teachers";
import { createClient } from "@/lib/supabase/server";
import type { Attendance, ClassSession, Course, Student } from "@/types/database";

/**
 * Queries del módulo Asistencia (panel del profesor).
 * Siempre vía createClient() (anon key + sesión): respetan RLS.
 * Joins resueltos en JS con consultas planas — los tipos de `Database`
 * no describen relaciones (convención de Fase 2).
 */

/** Date local → "YYYY-MM-DD" (sin sorpresas de zona horaria). */
function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type TeacherSessionItem = {
  session: ClassSession;
  courseName: string;
  /** Hora de inicio del curso ("HH:MM:SS"). */
  startTime: string;
  /** Matrículas `activa` del curso. */
  enrolledCount: number;
  /** true si ya hay asistencia registrada para la sesión. */
  attendanceTaken: boolean;
};

export type TeacherAgenda = {
  /** Sesiones de hoy (programadas o impartidas). */
  today: TeacherSessionItem[];
  /** Sesiones de los 7 días siguientes. */
  upcoming: TeacherSessionItem[];
};

/**
 * Agenda del profe: sesiones de hoy y de los próximos 7 días donde es
 * titular del curso o sustituto de la sesión. Las canceladas no aparecen.
 */
export async function getTeacherAgenda(teacherId: string): Promise<TeacherAgenda> {
  const supabase = await createClient();

  const now = new Date();
  const todayIso = toISODate(now);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 7);
  const horizonIso = toISODate(horizon);

  const ownCourseIds = await getCourseIdsForTeacher(teacherId);

  // Titular y sustituto en dos consultas planas; dedupe por id de sesión.
  const bySessionId = new Map<string, ClassSession>();

  if (ownCourseIds.length > 0) {
    const { data } = await supabase
      .from("class_sessions")
      .select("*")
      .in("course_id", ownCourseIds)
      .gte("session_date", todayIso)
      .lte("session_date", horizonIso)
      .neq("status", "cancelada");
    for (const s of data ?? []) bySessionId.set(s.id, s);
  }

  const { data: subSessions } = await supabase
    .from("class_sessions")
    .select("*")
    .eq("substitute_teacher_id", teacherId)
    .gte("session_date", todayIso)
    .lte("session_date", horizonIso)
    .neq("status", "cancelada");
  for (const s of subSessions ?? []) bySessionId.set(s.id, s);

  const sessions = [...bySessionId.values()];
  if (sessions.length === 0) return { today: [], upcoming: [] };

  const courseIds = [...new Set(sessions.map((s) => s.course_id))];
  const sessionIds = sessions.map((s) => s.id);

  const [coursesRes, enrollmentsRes, attendanceRes] = await Promise.all([
    supabase.from("courses").select("id, name, start_time").in("id", courseIds),
    supabase
      .from("enrollments")
      .select("course_id")
      .in("course_id", courseIds)
      .eq("status", "activa"),
    supabase
      .from("attendance")
      .select("class_session_id")
      .in("class_session_id", sessionIds),
  ]);

  const courseById = new Map((coursesRes.data ?? []).map((c) => [c.id, c]));
  const enrolledByCourse = new Map<string, number>();
  for (const e of enrollmentsRes.data ?? []) {
    enrolledByCourse.set(e.course_id, (enrolledByCourse.get(e.course_id) ?? 0) + 1);
  }
  const takenSessionIds = new Set(
    (attendanceRes.data ?? []).map((a) => a.class_session_id),
  );

  const items: TeacherSessionItem[] = sessions
    .map((session) => {
      const course = courseById.get(session.course_id);
      return {
        session,
        courseName: course?.name ?? "Curso",
        startTime: course?.start_time ?? "00:00:00",
        enrolledCount: enrolledByCourse.get(session.course_id) ?? 0,
        attendanceTaken: takenSessionIds.has(session.id),
      };
    })
    .sort(
      (a, b) =>
        a.session.session_date.localeCompare(b.session.session_date) ||
        a.startTime.localeCompare(b.startTime),
    );

  return {
    today: items.filter((i) => i.session.session_date === todayIso),
    upcoming: items.filter((i) => i.session.session_date > todayIso),
  };
}

/** Una fila de la hoja: matriculado del curso o socio fundador de suelto. */
export type RosterStudent = Pick<Student, "id" | "full_name"> & {
  /** false = viene de suelto por su plaza fundadora, sin matrícula. */
  enrolled: boolean;
};

export type AttendanceSheetData = {
  session: ClassSession;
  course: Course;
  /**
   * Matrículas `activa` del curso (pausada y lista_espera fuera) más los
   * fundadores que ya tienen apunte en esta sesión.
   */
  students: RosterStudent[];
  /** Asistencia ya registrada (vacío si aún no se ha pasado lista). */
  records: Attendance[];
  /**
   * Fundadores que el profe puede añadir a esta sesión (RPC
   * `founding_drop_in_candidates`, 0038c). Vacío en compañías.
   */
  dropInCandidates: Pick<Student, "id" | "full_name">[];
};

/**
 * Datos de la hoja de asistencia de una sesión. La RLS de `class_sessions`
 * solo devuelve la fila al titular/sustituto (o admin): para cualquier otro
 * usuario esto devuelve null y la página hace notFound().
 */
export async function getAttendanceSheet(
  sessionId: string,
): Promise<AttendanceSheetData | null> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("class_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return null;

  const [courseRes, enrollmentsRes, attendanceRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", session.course_id).maybeSingle(),
    supabase
      .from("enrollments")
      .select("student_id")
      .eq("course_id", session.course_id)
      .eq("status", "activa"),
    supabase.from("attendance").select("*").eq("class_session_id", sessionId),
  ]);
  if (!courseRes.data) return null;

  // El roster son las matrículas activas MÁS los sueltos ya apuntados: si solo
  // se leyeran las matrículas, el fundador añadido a mano desaparecería de la
  // hoja al recargar y su fila de `attendance` quedaría huérfana en pantalla.
  const enrolledIds = new Set((enrollmentsRes.data ?? []).map((e) => e.student_id));
  const recordedIds = (attendanceRes.data ?? []).map((a) => a.student_id);
  const studentIds = [...new Set([...enrolledIds, ...recordedIds])];

  let students: RosterStudent[] = [];
  if (studentIds.length > 0) {
    const { data } = await supabase
      .from("students")
      .select("id, full_name")
      .in("id", studentIds)
      .order("full_name", { ascending: true });
    students = (data ?? []).map((s) => ({ ...s, enrolled: enrolledIds.has(s.id) }));
  }

  const { data: candidates } = await supabase.rpc("founding_drop_in_candidates", {
    p_session_id: sessionId,
  });

  return {
    session,
    course: courseRes.data,
    students,
    records: attendanceRes.data ?? [],
    dropInCandidates: candidates ?? [],
  };
}
