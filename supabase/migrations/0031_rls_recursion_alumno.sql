-- ════════════════════════════════════════════════════════════════════════════
-- 0031 · Romper la recursión de RLS que dejó 0026
--
--   0019/0020 dieron al profesor lectura de `enrollments` mirando `courses`,
--   `teachers` y `class_sessions`. 0026 dio al alumno lectura de esas tres
--   mirando `enrollments`. El resultado es un ciclo: al planificar cualquier
--   consulta sobre `students`, `enrollments`, `teachers` o `class_sessions`,
--   Postgres expande políticas hasta toparse consigo mismo y aborta con
--   42P17 «infinite recursion detected in policy for relation "enrollments"».
--
--   No es un fallo de datos ni de permisos: la consulta ni siquiera llega a
--   ejecutarse, así que el panel entero (alumnos, matrículas, conversión de
--   leads) devolvía error para cualquier sesión autenticada.
--
--   Arreglo: las políticas del alumno dejan de consultar tablas con RLS y
--   pasan por funciones SECURITY DEFINER, igual que ya hacía
--   `current_student_id()`. El grafo de dependencias entre políticas queda sin
--   ciclos y el alcance de lectura del alumno no cambia.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Helpers ──────────────────────────────────────────────────────────────────
-- SECURITY DEFINER: leen `enrollments`/`courses` saltándose la RLS, que es
-- justo lo que corta el ciclo. El filtro sigue siendo el alumno de la sesión,
-- así que no amplían lo que cada uno puede ver.

create or replace function public.current_student_course_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.course_id
  from public.enrollments e
  where e.student_id = public.current_student_id();
$$;

comment on function public.current_student_course_ids() is
  'Cursos en los que está matriculado el alumno de la sesión. SECURITY DEFINER para evitar la recursión de RLS (ver 0031).';

create or replace function public.current_student_teacher_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct c.teacher_id
  from public.courses c
  where c.teacher_id is not null
    and c.id in (
      select e.course_id
      from public.enrollments e
      where e.student_id = public.current_student_id()
    );
$$;

comment on function public.current_student_teacher_ids() is
  'Profesores titulares de los cursos del alumno de la sesión. SECURITY DEFINER para evitar la recursión de RLS (ver 0031).';

revoke execute on function public.current_student_course_ids() from anon;
revoke execute on function public.current_student_teacher_ids() from anon;

-- ── Políticas del alumno, ya sin tocar tablas con RLS ────────────────────────

drop policy if exists "courses: alumno lee los suyos" on public.courses;
create policy "courses: alumno lee los suyos"
  on public.courses for select
  to authenticated
  using (id in (select public.current_student_course_ids()));

drop policy if exists "teachers: alumno lee los de sus cursos" on public.teachers;
create policy "teachers: alumno lee los de sus cursos"
  on public.teachers for select
  to authenticated
  using (id in (select public.current_student_teacher_ids()));

drop policy if exists "class_sessions: alumno lee las de sus cursos" on public.class_sessions;
create policy "class_sessions: alumno lee las de sus cursos"
  on public.class_sessions for select
  to authenticated
  using (course_id in (select public.current_student_course_ids()));
