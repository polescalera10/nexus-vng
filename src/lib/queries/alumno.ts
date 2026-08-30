import { getTeacherIdsByCourse } from "@/lib/queries/course-teachers";
import { createClient } from "@/lib/supabase/server";
import type { Course, Enrollment, Student, Teacher } from "@/types/database";

/**
 * Consultas del área del ALUMNO.
 *
 * Todas usan la sesión del propio alumno, así que la RLS de la migración 0026
 * es la que acota lo que ve: su ficha, sus matrículas, los cursos donde está
 * matriculado y los profesores de esos cursos. Aquí no hace falta filtrar por
 * `student_id` a mano — pero se hace igual, porque una consulta que solo es
 * correcta gracias a la RLS se convierte en un agujero el día que alguien
 * relaja una política.
 */

export type MyCourse = Pick<Enrollment, "id" | "status" | "role_in_course"> & {
  course: Pick<Course, "id" | "name" | "weekday" | "start_time" | "duration_min"> | null;
  /** Profes titulares del curso (0032: pueden ser varios). */
  teacherNames: string[];
};

/** Ficha del alumno enlazada al usuario de la sesión. */
export async function getStudentForUser(userId: string): Promise<Student | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getStudentForUser]", error.message);
    return null;
  }
  return data;
}

/** Cursos en los que está matriculado (sin las bajas). */
export async function getMyCourses(studentId: string): Promise<MyCourse[]> {
  const supabase = await createClient();

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("id, status, role_in_course, course_id")
    .eq("student_id", studentId)
    .neq("status", "baja");

  if (error) {
    console.error("[getMyCourses]", error.message);
    return [];
  }
  if (!enrollments || enrollments.length === 0) return [];

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, weekday, start_time, duration_min")
    .in("id", [...new Set(enrollments.map((e) => e.course_id))]);

  const teacherIdsByCourse = await getTeacherIdsByCourse((courses ?? []).map((c) => c.id));
  const teacherIds = [...new Set([...teacherIdsByCourse.values()].flat())];

  const teacherName = new Map<string, string>();
  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, full_name")
      .in("id", teacherIds);
    for (const t of (teachers ?? []) as Pick<Teacher, "id" | "full_name">[]) {
      teacherName.set(t.id, t.full_name);
    }
  }

  const courseById = new Map((courses ?? []).map((c) => [c.id, c]));

  return enrollments
    .map((e) => {
      const c = courseById.get(e.course_id);
      return {
        id: e.id,
        status: e.status,
        role_in_course: e.role_in_course,
        course: c
          ? {
              id: c.id,
              name: c.name,
              weekday: c.weekday,
              start_time: c.start_time,
              duration_min: c.duration_min,
            }
          : null,
        teacherNames: c
          ? (teacherIdsByCourse.get(c.id) ?? [])
              .map((id) => teacherName.get(id))
              .filter((name): name is string => !!name)
          : [],
      };
    })
    .sort((a, b) => {
      const aw = a.course?.weekday ?? 99;
      const bw = b.course?.weekday ?? 99;
      if (aw !== bw) return aw - bw;
      return (a.course?.start_time ?? "").localeCompare(b.course?.start_time ?? "");
    });
}
