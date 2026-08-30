import { getCourseIdsForTeacher } from "@/lib/queries/course-teachers";
import { createClient } from "@/lib/supabase/server";
import type { Course, Profile, Teacher } from "@/types/database";

/**
 * Consultas del módulo Profesores (panel admin).
 * Todas usan el cliente de servidor con la sesión del usuario → respetan RLS
 * (lectura para autenticados, gestión solo admin según 0019).
 */

export type LinkableProfile = Pick<Profile, "id" | "nombre">;
export type TeacherCourse = Pick<
  Course,
  "id" | "name" | "weekday" | "start_time" | "duration_min" | "active"
> & { modalidad_nombre: string | null };

export type TeacherMonthReport = {
  /** "2026-07" */
  monthKey: string;
  titularSessions: number;
  titularMinutes: number;
  substituteSessions: number;
  substituteMinutes: number;
};

export async function getTeachers(): Promise<Teacher[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("active", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[getTeachers]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getTeacherById]", error.message);
    return null;
  }
  return data;
}

/**
 * Perfiles con role='profesor' vinculables a un teacher: los que aún no
 * tienen fila en `teachers`, más el ya vinculado al teacher en edición.
 */
export async function getLinkableProfiles(
  currentProfileId: string | null,
): Promise<LinkableProfile[]> {
  const supabase = await createClient();

  const [{ data: profiles, error: pErr }, { data: linked, error: tErr }] =
    await Promise.all([
      supabase.from("profiles").select("id, nombre").eq("role", "profesor"),
      supabase.from("teachers").select("profile_id").not("profile_id", "is", null),
    ]);

  if (pErr || tErr) {
    console.error("[getLinkableProfiles]", pErr?.message ?? tErr?.message);
    return [];
  }

  const taken = new Set(
    (linked ?? [])
      .map((t) => t.profile_id)
      .filter((id): id is string => id !== null && id !== currentProfileId),
  );

  return (profiles ?? [])
    .filter((p) => !taken.has(p.id))
    .sort((a, b) => (a.nombre ?? "").localeCompare(b.nombre ?? "", "es"));
}

/** Nombre del profile vinculado (para la ficha). */
export async function getProfileName(profileId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", profileId)
    .maybeSingle();
  return data?.nombre ?? null;
}

/** Cursos asignados al profesor (titular), con el nombre de su modalidad. */
export async function getTeacherCourses(teacherId: string): Promise<TeacherCourse[]> {
  const supabase = await createClient();

  const courseIds = await getCourseIdsForTeacher(teacherId);
  if (courseIds.length === 0) return [];

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, name, modalidad_id, weekday, start_time, duration_min, active")
    .in("id", courseIds)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[getTeacherCourses]", error.message);
    return [];
  }
  if (!courses || courses.length === 0) return [];

  const { data: modalidades } = await supabase.from("modalidades").select("id, nombre");
  const nameById = new Map((modalidades ?? []).map((m) => [m.id, m.nombre]));

  return courses.map(({ modalidad_id, ...c }) => ({
    ...c,
    modalidad_nombre: nameById.get(modalidad_id) ?? null,
  }));
}

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * Registro de horas de los últimos 6 meses (mes actual incluido), read-only.
 *   · Titular:   sesiones `impartida` de SUS cursos SIN sustituto asignado.
 *   · Sustituto: sesiones `impartida` donde él es `substitute_teacher_id`.
 * Las horas se suman con el `duration_min` del curso de cada sesión.
 * Devuelve siempre 6 filas, de más reciente a más antigua.
 */
export async function getTeacherHoursReport(
  teacherId: string,
): Promise<TeacherMonthReport[]> {
  const supabase = await createClient();

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const fromIso = `${ym(from)}-01`;

  // Meses del informe, de más reciente a más antiguo.
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    months.push(ym(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  const rows = new Map<string, TeacherMonthReport>(
    months.map((monthKey) => [
      monthKey,
      {
        monthKey,
        titularSessions: 0,
        titularMinutes: 0,
        substituteSessions: 0,
        substituteMinutes: 0,
      },
    ]),
  );

  const ownCourseIds = await getCourseIdsForTeacher(teacherId);

  let ownCourses: { id: string; duration_min: number }[] = [];
  if (ownCourseIds.length > 0) {
    const { data, error: cErr } = await supabase
      .from("courses")
      .select("id, duration_min")
      .in("id", ownCourseIds);

    if (cErr) {
      console.error("[getTeacherHoursReport] courses:", cErr.message);
      return [...rows.values()];
    }
    ownCourses = data ?? [];
  }

  const durationByCourse = new Map(ownCourses.map((c) => [c.id, c.duration_min]));

  // Titular: sesiones impartidas de sus cursos sin sustituto.
  if (durationByCourse.size > 0) {
    const { data: titular, error } = await supabase
      .from("class_sessions")
      .select("course_id, session_date")
      .in("course_id", [...durationByCourse.keys()])
      .eq("status", "impartida")
      .is("substitute_teacher_id", null)
      .gte("session_date", fromIso);

    if (error) {
      console.error("[getTeacherHoursReport] titular:", error.message);
    } else {
      for (const s of titular ?? []) {
        const row = rows.get(s.session_date.slice(0, 7));
        if (!row) continue;
        row.titularSessions += 1;
        row.titularMinutes += durationByCourse.get(s.course_id) ?? 0;
      }
    }
  }

  // Sustituto: sesiones impartidas cubiertas por él (en cursos de otros).
  const { data: subs, error: sErr } = await supabase
    .from("class_sessions")
    .select("course_id, session_date")
    .eq("substitute_teacher_id", teacherId)
    .eq("status", "impartida")
    .gte("session_date", fromIso);

  if (sErr) {
    console.error("[getTeacherHoursReport] sustituto:", sErr.message);
  } else if (subs && subs.length > 0) {
    const missing = [...new Set(subs.map((s) => s.course_id))].filter(
      (id) => !durationByCourse.has(id),
    );
    if (missing.length > 0) {
      const { data: extra } = await supabase
        .from("courses")
        .select("id, duration_min")
        .in("id", missing);
      for (const c of extra ?? []) durationByCourse.set(c.id, c.duration_min);
    }
    for (const s of subs) {
      const row = rows.get(s.session_date.slice(0, 7));
      if (!row) continue;
      row.substituteSessions += 1;
      row.substituteMinutes += durationByCourse.get(s.course_id) ?? 0;
    }
  }

  return [...rows.values()];
}
