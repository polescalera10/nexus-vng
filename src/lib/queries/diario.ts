import { getTeacherIdsByCourse } from "@/lib/queries/course-teachers";
import { createClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/format";
import type {
  Course,
  SessionNote,
  SessionStatus,
  SessionVideo,
  Teacher,
} from "@/types/database";

/**
 * Diario de clase (migración 0043).
 *
 * Lo que el profe cuelga de cada sesión —qué se dio y los vídeos— y lo que el
 * alumno matriculado lee. La RLS ya acota por matrícula
 * (`student_can_see_session`), pero igual que en `queries/alumno.ts` se filtra
 * también a mano: una consulta que solo es correcta gracias a la RLS se
 * convierte en un agujero el día que alguien relaja una política.
 */

export type DiarioSesion = {
  id: string;
  session_date: string;
  status: SessionStatus;
  resumen: string | null;
  videos: Pick<SessionVideo, "id" | "url" | "titulo" | "orden">[];
  /** `null` si el profe todavía no ha pasado lista en esa sesión. */
  asistio: boolean | null;
};

export type CursoDelAlumno = {
  course: Pick<
    Course,
    "id" | "name" | "weekday" | "start_time" | "duration_min" | "cycle_type"
  >;
  teacherNames: string[];
  modalidadNombre: string | null;
  nivelNombre: string | null;
};

export type ProximaClase = {
  courseId: string;
  courseName: string;
  sessionId: string;
  session_date: string;
  start_time: string;
  teacherNames: string[];
  /** Sesión con sustituto o cancelada: el alumno lo tiene que ver antes de ir. */
  status: SessionStatus;
};

/**
 * Cabecera del curso, solo si el alumno está matriculado.
 *
 * `null` cuando no lo está — y la página responde con un 404 en vez de decir
 * "no tienes acceso", que ya confirmaría que ese curso existe.
 */
export async function getCursoDelAlumno(
  studentId: string,
  courseId: string,
): Promise<CursoDelAlumno | null> {
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .neq("status", "baja")
    .maybeSingle();

  if (!enrollment) return null;

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, name, weekday, start_time, duration_min, cycle_type, modalidad_id, nivel_id")
    .eq("id", courseId)
    .maybeSingle();

  if (error || !course) {
    if (error) console.error("[getCursoDelAlumno]", error.message);
    return null;
  }

  const [{ data: modalidad }, { data: nivel }, teacherIdsByCourse] = await Promise.all([
    course.modalidad_id
      ? supabase.from("modalidades").select("nombre").eq("id", course.modalidad_id).maybeSingle()
      : Promise.resolve({ data: null }),
    course.nivel_id
      ? supabase.from("niveles").select("nombre").eq("id", course.nivel_id).maybeSingle()
      : Promise.resolve({ data: null }),
    getTeacherIdsByCourse([courseId]),
  ]);

  const teacherIds = teacherIdsByCourse.get(courseId) ?? [];
  let teacherNames: string[] = [];
  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, full_name")
      .in("id", teacherIds);
    teacherNames = ((teachers ?? []) as Pick<Teacher, "id" | "full_name">[]).map(
      (t) => t.full_name,
    );
  }

  return {
    course: {
      id: course.id,
      name: course.name,
      weekday: course.weekday,
      start_time: course.start_time,
      duration_min: course.duration_min,
      cycle_type: course.cycle_type,
    },
    teacherNames,
    modalidadNombre: modalidad?.nombre ?? null,
    nivelNombre: nivel?.nombre ?? null,
  };
}

/**
 * Diario de un curso: sesiones de hoy hacia atrás, la más reciente primero.
 *
 * Solo pasadas. Una sesión futura no tiene nada que contar y ver la lista de
 * las que vienen no aporta: el "cuándo vuelvo" lo resuelve `getProximaClase`.
 */
export async function getDiarioDelCurso(
  studentId: string,
  courseId: string,
  limit = 20,
): Promise<DiarioSesion[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("class_sessions")
    .select("id, session_date, status")
    .eq("course_id", courseId)
    .lte("session_date", todayInMadrid())
    .order("session_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getDiarioDelCurso]", error.message);
    return [];
  }
  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);

  const [{ data: notes }, { data: videos }, { data: asistencias }] = await Promise.all([
    supabase.from("session_notes").select("class_session_id, resumen").in("class_session_id", sessionIds),
    supabase
      .from("session_videos")
      .select("id, class_session_id, url, titulo, orden")
      .in("class_session_id", sessionIds)
      .order("orden", { ascending: true }),
    supabase
      .from("attendance")
      .select("class_session_id, present")
      .eq("student_id", studentId)
      .in("class_session_id", sessionIds),
  ]);

  const resumenPorSesion = new Map(
    ((notes ?? []) as Pick<SessionNote, "class_session_id" | "resumen">[]).map((n) => [
      n.class_session_id,
      n.resumen,
    ]),
  );

  const videosPorSesion = new Map<string, DiarioSesion["videos"]>();
  for (const v of (videos ?? []) as SessionVideo[]) {
    const lista = videosPorSesion.get(v.class_session_id) ?? [];
    lista.push({ id: v.id, url: v.url, titulo: v.titulo, orden: v.orden });
    videosPorSesion.set(v.class_session_id, lista);
  }

  const asistioPorSesion = new Map(
    (asistencias ?? []).map((a) => [a.class_session_id, a.present]),
  );

  return sessions.map((s) => ({
    id: s.id,
    session_date: s.session_date,
    status: s.status,
    resumen: resumenPorSesion.get(s.id) ?? null,
    videos: videosPorSesion.get(s.id) ?? [],
    asistio: asistioPorSesion.get(s.id) ?? null,
  }));
}

/**
 * Próxima sesión del alumno entre todos sus cursos, incluida la de hoy.
 *
 * Se devuelve también cuando está cancelada, y a propósito: enterarse de que
 * no hay clase al llegar a la puerta es peor que verlo aquí.
 */
export async function getProximaClase(studentId: string): Promise<ProximaClase | null> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", studentId)
    .neq("status", "baja");

  const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))];
  if (courseIds.length === 0) return null;

  const { data: sessions, error } = await supabase
    .from("class_sessions")
    .select("id, course_id, session_date, status")
    .in("course_id", courseIds)
    .gte("session_date", todayInMadrid())
    .order("session_date", { ascending: true })
    .limit(1);

  if (error) {
    console.error("[getProximaClase]", error.message);
    return null;
  }

  const next = sessions?.[0];
  if (!next) return null;

  const [{ data: course }, teacherIdsByCourse] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, start_time")
      .eq("id", next.course_id)
      .maybeSingle(),
    getTeacherIdsByCourse([next.course_id]),
  ]);

  const teacherIds = teacherIdsByCourse.get(next.course_id) ?? [];
  let teacherNames: string[] = [];
  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, full_name")
      .in("id", teacherIds);
    teacherNames = ((teachers ?? []) as Pick<Teacher, "id" | "full_name">[]).map(
      (t) => t.full_name,
    );
  }

  return {
    courseId: next.course_id,
    courseName: course?.name ?? "Tu clase",
    sessionId: next.id,
    session_date: next.session_date,
    start_time: course?.start_time ?? "00:00:00",
    teacherNames,
    status: next.status,
  };
}

/** Nota + vídeos de una sesión. Para la pantalla del profe. */
export async function getDiarioDeSesion(sessionId: string): Promise<{
  resumen: string | null;
  videos: SessionVideo[];
}> {
  const supabase = await createClient();

  const [{ data: note }, { data: videos }] = await Promise.all([
    supabase
      .from("session_notes")
      .select("resumen")
      .eq("class_session_id", sessionId)
      .maybeSingle(),
    supabase
      .from("session_videos")
      .select("*")
      .eq("class_session_id", sessionId)
      .order("orden", { ascending: true }),
  ]);

  return { resumen: note?.resumen ?? null, videos: (videos ?? []) as SessionVideo[] };
}
