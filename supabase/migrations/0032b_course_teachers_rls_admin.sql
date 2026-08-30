-- 0032b · Gestión de course_teachers: solo admin. Ver 0032a.

drop policy if exists "course_teachers: gestión admin" on public.course_teachers;
create policy "course_teachers: gestión admin"
  on public.course_teachers for all
  using (is_admin())
  with check (is_admin());
