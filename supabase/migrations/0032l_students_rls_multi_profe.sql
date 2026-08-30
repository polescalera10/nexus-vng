-- 0032l · Alumnos, lectura del profe (titular o sustituto). Ver 0032a.

drop policy if exists "students: lectura profesor con matrícula / admin" on public.students;
create policy "students: lectura profesor con matrícula / admin"
  on public.students for select
  to authenticated
  using (is_admin() or public.teaches_or_substitutes_student(id));
