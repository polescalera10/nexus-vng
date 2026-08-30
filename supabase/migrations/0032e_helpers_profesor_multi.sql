-- 0032e · Helpers para que las políticas del profesor miren `course_teachers`
-- en vez de `courses.teacher_id`. SECURITY DEFINER por el mismo motivo que en
-- 0031a: leen tablas con RLS y así el grafo de políticas sigue sin ciclos.

-- Cursos donde el usuario de la sesión es profe titular.
create or replace function public.current_teacher_course_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select ct.course_id
  from public.course_teachers ct
  join public.teachers t on t.id = ct.teacher_id
  where t.profile_id = auth.uid();
$$;

-- Titular del curso de la sesión, o sustituto de esa sesión concreta.
create or replace function public.can_teach_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sessions cs
    where cs.id = p_session_id
      and (
        cs.course_id in (select public.current_teacher_course_ids())
        or exists (
          select 1 from public.teachers t
          where t.id = cs.substitute_teacher_id and t.profile_id = auth.uid()
        )
      )
  );
$$;

-- Alumno matriculado en algún curso donde el usuario es titular.
create or replace function public.teaches_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id
      and e.course_id in (select public.current_teacher_course_ids())
  );
$$;

-- Igual, contando también las sesiones donde el usuario es sustituto.
create or replace function public.teaches_or_substitutes_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id
      and (
        e.course_id in (select public.current_teacher_course_ids())
        or exists (
          select 1
          from public.class_sessions cs
          join public.teachers t on t.id = cs.substitute_teacher_id
          where cs.course_id = e.course_id and t.profile_id = auth.uid()
        )
      )
  );
$$;

-- Reescrita: los profes del alumno salen ya de `course_teachers` (ver 0031a).
create or replace function public.current_student_teacher_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct ct.teacher_id
  from public.course_teachers ct
  where ct.course_id in (
    select e.course_id
    from public.enrollments e
    where e.student_id = public.current_student_id()
  );
$$;

revoke execute on function public.current_teacher_course_ids() from anon;
revoke execute on function public.can_teach_session(uuid) from anon;
revoke execute on function public.teaches_student(uuid) from anon;
revoke execute on function public.teaches_or_substitutes_student(uuid) from anon;
