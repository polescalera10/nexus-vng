import { createClient } from "@/lib/supabase/server";

/**
 * Lecturas de `course_teachers` (profes titulares de cada curso, N:N).
 * Viven aparte porque las necesitan cuatro módulos —cursos, profesores,
 * asistencia y el área de alumno— y todos harían la misma consulta plana.
 */

/** Ids de los cursos donde el profe es titular. */
export async function getCourseIdsForTeacher(teacherId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_teachers")
    .select("course_id")
    .eq("teacher_id", teacherId);

  if (error) {
    console.error("[getCourseIdsForTeacher]", error.message);
    return [];
  }
  return [...new Set((data ?? []).map((r) => r.course_id))];
}

/** courseId → ids de sus profes titulares. Los cursos sin profe no salen. */
export async function getTeacherIdsByCourse(
  courseIds: string[],
): Promise<Map<string, string[]>> {
  const byCourse = new Map<string, string[]>();
  if (courseIds.length === 0) return byCourse;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_teachers")
    .select("course_id, teacher_id")
    .in("course_id", courseIds);

  if (error) {
    console.error("[getTeacherIdsByCourse]", error.message);
    return byCourse;
  }

  for (const row of data ?? []) {
    byCourse.set(row.course_id, [...(byCourse.get(row.course_id) ?? []), row.teacher_id]);
  }
  return byCourse;
}

/**
 * Deja los profes de un curso exactamente en `teacherIds`: borra los que
 * sobran y añade los que faltan, sin tocar los que ya estaban (así el
 * `created_at` de cada vínculo sobrevive a una edición del curso).
 */
export async function syncCourseTeachers(
  courseId: string,
  teacherIds: string[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const wanted = [...new Set(teacherIds)];

  const { data: current, error: readErr } = await supabase
    .from("course_teachers")
    .select("teacher_id")
    .eq("course_id", courseId);

  if (readErr) return { error: readErr.message };

  const currentIds = (current ?? []).map((r) => r.teacher_id);
  const toRemove = currentIds.filter((id) => !wanted.includes(id));
  const toAdd = wanted.filter((id) => !currentIds.includes(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("course_teachers")
      .delete()
      .eq("course_id", courseId)
      .in("teacher_id", toRemove);
    if (error) return { error: error.message };
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("course_teachers")
      .insert(toAdd.map((teacher_id) => ({ course_id: courseId, teacher_id })));
    if (error) return { error: error.message };
  }

  return { error: null };
}
