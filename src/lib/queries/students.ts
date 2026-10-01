import { createClient } from "@/lib/supabase/server";
import type {
  Course,
  DanceRole,
  Enrollment,
  Nivel,
  PaymentStatus,
  Student,
} from "@/types/database";

/**
 * Consultas del módulo Alumnos. Siempre con el cliente de servidor (RLS):
 * el admin ve todo; el profesor solo alcanza a sus alumnos/matrículas.
 */

export type StudentsEstadoFilter = "activos" | "inactivos" | "todos";

export type StudentFilters = {
  /** Búsqueda por nombre (ilike). */
  q?: string;
  nivelId?: string;
  rol?: DanceRole;
  cuota?: PaymentStatus;
  /** Filtra por matrícula en ese curso (se excluyen matrículas en `baja`). */
  cursoId?: string;
  /** Por defecto solo activos. */
  estado?: StudentsEstadoFilter;
};

export type StudentListItem = Student & { nivel: Nivel | null };

export async function listStudents(filters: StudentFilters): Promise<StudentListItem[]> {
  const supabase = await createClient();

  // Filtro por curso: matrícula vigente (activa/pausada/lista_espera) en él.
  let courseStudentIds: string[] | null = null;
  if (filters.cursoId) {
    const { data } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("course_id", filters.cursoId)
      .neq("status", "baja");
    courseStudentIds = [...new Set((data ?? []).map((e) => e.student_id))];
    if (courseStudentIds.length === 0) return [];
  }

  let query = supabase.from("students").select("*").order("full_name");

  const estado = filters.estado ?? "activos";
  if (estado !== "todos") query = query.eq("active", estado === "activos");
  if (filters.q) {
    const q = filters.q.replace(/[%_]/g, "\\$&");
    query = query.ilike("full_name", `%${q}%`);
  }
  if (filters.nivelId) query = query.eq("nivel_id", filters.nivelId);
  if (filters.rol) query = query.eq("dance_role", filters.rol);
  if (filters.cuota) query = query.eq("payment_status", filters.cuota);
  if (courseStudentIds) query = query.in("id", courseStudentIds);

  const { data, error } = await query;
  if (error) {
    console.error("[listStudents] error:", error.message);
    return [];
  }

  const niveles = await getNiveles();
  const byId = new Map(niveles.map((n) => [n.id, n]));
  return (data ?? []).map((s) => ({
    ...s,
    nivel: s.nivel_id ? (byId.get(s.nivel_id) ?? null) : null,
  }));
}

/** Catálogo de niveles, por orden. */
export async function getNiveles(): Promise<Nivel[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("niveles").select("*").order("orden");
  return data ?? [];
}

/** Cursos activos para el filtro de la lista. */
export async function getActiveCourses(): Promise<Pick<Course, "id" | "name">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, name")
    .eq("active", true)
    .order("name");
  return data ?? [];
}

export type PartnerOption = Pick<Student, "id" | "full_name" | "partner_id">;

/** Alumnos activos elegibles como pareja (excluyendo al propio alumno). */
export async function getPartnerOptions(excludeId?: string): Promise<PartnerOption[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select("id, full_name, partner_id")
    .eq("active", true)
    .order("full_name");
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return data ?? [];
}

/** Ficha básica para el formulario de edición. */
export async function getStudent(id: string): Promise<Student | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null; // ids mal formados → notFound en la página
  return data;
}

export type StudentCourseEnrollment = Enrollment & { course: Course | null };

export type StudentDetail = {
  student: Student;
  nivel: Nivel | null;
  /** null si no existe o si RLS no lo deja ver (p. ej. pareja ajena al profe). */
  partner: Pick<Student, "id" | "full_name"> | null;
  enrollments: StudentCourseEnrollment[];
  attendance: { total: number; present: number };
};

/** Ficha completa: datos + pareja + cursos matriculados + asistencia. */
export async function getStudentDetail(id: string): Promise<StudentDetail | null> {
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !student) return null;

  const [enrollRes, totalRes, presentRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id),
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id)
      .eq("present", true),
  ]);

  const nivel = student.nivel_id
    ? ((
        await supabase
          .from("niveles")
          .select("*")
          .eq("id", student.nivel_id)
          .maybeSingle()
      ).data ?? null)
    : null;

  const partner = student.partner_id
    ? ((
        await supabase
          .from("students")
          .select("id, full_name")
          .eq("id", student.partner_id)
          .maybeSingle()
      ).data ?? null)
    : null;

  const enrollments = enrollRes.data ?? [];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];
  let coursesById = new Map<string, Course>();
  if (courseIds.length > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds);
    coursesById = new Map((courses ?? []).map((c) => [c.id, c]));
  }

  return {
    student,
    nivel,
    partner,
    enrollments: enrollments.map((e) => ({
      ...e,
      course: coursesById.get(e.course_id) ?? null,
    })),
    attendance: { total: totalRes.count ?? 0, present: presentRes.count ?? 0 },
  };
}

/** Alumnos activos con email y sin cuenta de acceso (los que cubre "Dar acceso a todos"). */
export async function countStudentsSinAcceso(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("active", true)
    .is("profile_id", null)
    .not("email", "is", null);
  if (error) {
    console.error("[countStudentsSinAcceso]", error.message);
    return 0;
  }
  return count ?? 0;
}
