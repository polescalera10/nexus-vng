import { getCourseIdsForTeacher, getTeacherIdsByCourse } from "@/lib/queries/course-teachers";
import { createClient } from "@/lib/supabase/server";
import {
  getModalidadOptions,
  getNivelOptions,
  type ModalidadOption,
  type NivelOption,
} from "@/lib/queries/catalogo";
import type {
  ClassSession,
  Course,
  Enrollment,
  Student,
  Teacher,
} from "@/types/database";

/**
 * Queries del módulo Cursos (panel interno).
 * Siempre vía createClient() (anon key + sesión): respetan RLS.
 * Los joins se resuelven en JS con consultas separadas — los tipos de
 * `Database` no describen relaciones y el volumen de datos es pequeño.
 */

export type CourseListItem = {
  course: Course;
  modalidadNombre: string | null;
  nivelNombre: string | null;
  /** Profes titulares del curso (0032: pueden ser varios). */
  teacherIds: string[];
  teacherNames: string[];
  /** Matrículas `activa` por rol (las pausadas no cuentan contra aforo). */
  leadersCount: number;
  followersCount: number;
};

/**
 * Campos del alumno que necesita la lista de matriculados. Teléfono, cuota y
 * socio fundador van aquí porque la ficha mínima del panel los pinta sin
 * abrir el detalle (ver `_components/StudentMiniCard`).
 */
export type EnrollmentStudent = Pick<
  Student,
  "id" | "full_name" | "dance_role" | "phone" | "payment_status" | "is_founding_member"
>;

export type EnrollmentWithStudent = Enrollment & {
  student: EnrollmentStudent | null;
};

export type SessionWithSubstitute = ClassSession & {
  substituteName: string | null;
};

export type CourseDetail = {
  course: Course;
  modalidadNombre: string | null;
  nivelNombre: string | null;
  teachers: Pick<Teacher, "id" | "full_name">[];
  enrollments: EnrollmentWithStudent[];
  sessions: SessionWithSubstitute[];
};

export type CourseCatalogs = {
  modalidades: ModalidadOption[];
  niveles: NivelOption[];
  teachers: { id: string; full_name: string }[];
};

/**
 * Catálogos para el formulario de curso. Modalidades y niveles salen de
 * `queries/catalogo.ts` — la misma fuente que usa el formulario de profesor,
 * para que ampliar el catálogo no haya que hacerlo en dos sitios.
 */
export async function getCourseCatalogs(): Promise<CourseCatalogs> {
  const supabase = await createClient();

  const [modalidades, niveles, teachers] = await Promise.all([
    getModalidadOptions(),
    getNivelOptions(),
    supabase
      .from("teachers")
      .select("id, full_name")
      .eq("active", true)
      .order("full_name", { ascending: true }),
  ]);

  return {
    modalidades,
    niveles,
    teachers: teachers.data ?? [],
  };
}

/** Completa cada curso con nombres de catálogo y contadores de aforo. */
async function buildListItems(courses: Course[]): Promise<CourseListItem[]> {
  if (courses.length === 0) return [];

  const supabase = await createClient();
  const courseIds = courses.map((c) => c.id);

  const [modalidades, niveles, teachers, enrollments, teacherIdsByCourse] = await Promise.all([
    supabase.from("modalidades").select("id, nombre"),
    supabase.from("niveles").select("id, nombre"),
    supabase.from("teachers").select("id, full_name"),
    supabase
      .from("enrollments")
      .select("course_id, role_in_course")
      .in("course_id", courseIds)
      .eq("status", "activa"),
    getTeacherIdsByCourse(courseIds),
  ]);

  const modalidadById = new Map((modalidades.data ?? []).map((m) => [m.id, m.nombre]));
  const nivelById = new Map((niveles.data ?? []).map((n) => [n.id, n.nombre]));
  const teacherById = new Map((teachers.data ?? []).map((t) => [t.id, t.full_name]));

  const counts = new Map<string, { leaders: number; followers: number }>();
  for (const e of enrollments.data ?? []) {
    const entry = counts.get(e.course_id) ?? { leaders: 0, followers: 0 };
    if (e.role_in_course === "leader") entry.leaders += 1;
    else entry.followers += 1;
    counts.set(e.course_id, entry);
  }

  return courses.map((course) => ({
    course,
    modalidadNombre: modalidadById.get(course.modalidad_id) ?? null,
    nivelNombre: course.nivel_id ? (nivelById.get(course.nivel_id) ?? null) : null,
    teacherIds: teacherIdsByCourse.get(course.id) ?? [],
    teacherNames: (teacherIdsByCourse.get(course.id) ?? [])
      .map((id) => teacherById.get(id))
      .filter((name): name is string => !!name),
    leadersCount: counts.get(course.id)?.leaders ?? 0,
    followersCount: counts.get(course.id)?.followers ?? 0,
  }));
}

/** Lista de cursos para el admin, ordenada por día y hora. */
export async function getAdminCourses(includeInactive: boolean): Promise<CourseListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*")
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);

  const { data } = await query;
  return buildListItems(data ?? []);
}

/** Curso a secas (formulario de edición). */
export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

/** Detalle completo: curso + catálogo + matrículas con alumno + sesiones con sustituto. */
export async function getCourseDetail(id: string): Promise<CourseDetail | null> {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!course) return null;

  const [modalidad, nivel, teacherIdsByCourse, enrollmentsRes, sessionsRes] = await Promise.all([
    supabase.from("modalidades").select("nombre").eq("id", course.modalidad_id).maybeSingle(),
    course.nivel_id
      ? supabase.from("niveles").select("nombre").eq("id", course.nivel_id).maybeSingle()
      : Promise.resolve({ data: null }),
    getTeacherIdsByCourse([id]),
    supabase
      .from("enrollments")
      .select("*")
      .eq("course_id", id)
      .order("enrolled_at", { ascending: true }),
    supabase
      .from("class_sessions")
      .select("*")
      .eq("course_id", id)
      .order("session_date", { ascending: true }),
  ]);

  const enrollmentRows = enrollmentsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];

  // Profes titulares del curso (0032: pueden ser varios).
  const teacherIds = teacherIdsByCourse.get(id) ?? [];
  let teachers: Pick<Teacher, "id" | "full_name">[] = [];
  if (teacherIds.length > 0) {
    const { data } = await supabase
      .from("teachers")
      .select("id, full_name")
      .in("id", teacherIds)
      .order("full_name", { ascending: true });
    teachers = data ?? [];
  }

  // Alumnos de las matrículas.
  const studentIds = [...new Set(enrollmentRows.map((e) => e.student_id))];
  const studentById = new Map<string, EnrollmentStudent>();
  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, dance_role, phone, payment_status, is_founding_member")
      .in("id", studentIds);
    for (const s of students ?? []) studentById.set(s.id, s);
  }

  // Nombres de los profes sustitutos.
  const substituteIds = [
    ...new Set(
      sessions
        .map((s) => s.substitute_teacher_id)
        .filter((v): v is string => Boolean(v)),
    ),
  ];
  const substituteById = new Map<string, string>();
  if (substituteIds.length > 0) {
    const { data: subs } = await supabase
      .from("teachers")
      .select("id, full_name")
      .in("id", substituteIds);
    for (const t of subs ?? []) substituteById.set(t.id, t.full_name);
  }

  return {
    course,
    modalidadNombre: modalidad.data?.nombre ?? null,
    nivelNombre: nivel.data?.nombre ?? null,
    teachers,
    enrollments: enrollmentRows.map((e) => ({
      ...e,
      student: studentById.get(e.student_id) ?? null,
    })),
    sessions: sessions.map((s) => ({
      ...s,
      substituteName: s.substitute_teacher_id
        ? (substituteById.get(s.substitute_teacher_id) ?? null)
        : null,
    })),
  };
}

/**
 * Alumnos activos matriculables en el curso: sin matrícula previa o con
 * matrícula en `baja` (la action reutiliza esa fila por el unique student+course).
 */
export async function getEnrollableStudents(
  courseId: string,
): Promise<Pick<Student, "id" | "full_name" | "dance_role">[]> {
  const supabase = await createClient();

  const [studentsRes, enrolledRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, dance_role")
      .eq("active", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("enrollments")
      .select("student_id, status")
      .eq("course_id", courseId),
  ]);

  const blocked = new Set(
    (enrolledRes.data ?? [])
      .filter((e) => e.status !== "baja")
      .map((e) => e.student_id),
  );

  return (studentsRes.data ?? []).filter((s) => !blocked.has(s.id));
}

/** Fila de `teachers` vinculada al usuario logueado (o null si el admin no la ha vinculado). */
export async function getTeacherForUser(
  profileId: string,
): Promise<Pick<Teacher, "id" | "full_name"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teachers")
    .select("id, full_name")
    .eq("profile_id", profileId)
    .maybeSingle();
  return data ?? null;
}

/**
 * Cursos visibles para un profe: los suyos como titular más aquellos donde
 * cubre alguna sesión como sustituto. La RLS de `courses` deja leer todos
 * los cursos a cualquier autenticado, por eso el filtro vive aquí.
 */
export async function getTeacherCourses(teacherId: string): Promise<CourseListItem[]> {
  const supabase = await createClient();

  const [ownCourseIds, subRes] = await Promise.all([
    getCourseIdsForTeacher(teacherId),
    supabase
      .from("class_sessions")
      .select("course_id")
      .eq("substitute_teacher_id", teacherId),
  ]);

  let own: Course[] = [];
  if (ownCourseIds.length > 0) {
    const { data } = await supabase.from("courses").select("*").in("id", ownCourseIds);
    own = data ?? [];
  }
  const ownIds = new Set(own.map((c) => c.id));
  const subIds = [
    ...new Set((subRes.data ?? []).map((s) => s.course_id).filter((id) => !ownIds.has(id))),
  ];

  let subCourses: Course[] = [];
  if (subIds.length > 0) {
    const { data } = await supabase.from("courses").select("*").in("id", subIds);
    subCourses = data ?? [];
  }

  const all = [...own, ...subCourses].sort(
    (a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time),
  );
  return buildListItems(all);
}

export type CourseOption = {
  id: string;
  name: string;
  weekday: number;
  start_time: string;
  /** Plazas libres. 0 puede ser "aforo completo" o "no admite ese rol". */
  free_leaders: number;
  free_followers: number;
  admits_leaders: boolean;
  admits_followers: boolean;
};

/**
 * Cursos activos con plazas libres por rol, para el desplegable de matrícula
 * rápida (conversión de lead). `null` en plazas = aforo sin límite declarado
 * (capacidad 0 en la migración significa "no se controla").
 */
export async function getCourseOptions(): Promise<CourseOption[]> {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, name, weekday, start_time, capacity_leaders, capacity_followers")
    .eq("active", true)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[getCourseOptions]", error.message);
    return [];
  }
  if (!courses || courses.length === 0) return [];

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, role_in_course")
    .in(
      "course_id",
      courses.map((c) => c.id),
    )
    .eq("status", "activa");

  const taken = new Map<string, { leader: number; follower: number }>();
  for (const e of enrollments ?? []) {
    const row = taken.get(e.course_id) ?? { leader: 0, follower: 0 };
    row[e.role_in_course] += 1;
    taken.set(e.course_id, row);
  }

  return courses.map((c) => {
    const used = taken.get(c.id) ?? { leader: 0, follower: 0 };
    return {
      id: c.id,
      name: c.name,
      weekday: c.weekday,
      start_time: c.start_time,
      free_leaders: Math.max(0, c.capacity_leaders - used.leader),
      free_followers: Math.max(0, c.capacity_followers - used.follower),
      admits_leaders: c.capacity_leaders > 0,
      admits_followers: c.capacity_followers > 0,
    };
  });
}
