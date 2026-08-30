-- 0032c · Lectura de course_teachers para staff, igual que `courses`. Ver 0032a.

drop policy if exists "course_teachers: lectura admin/profesor" on public.course_teachers;
create policy "course_teachers: lectura admin/profesor"
  on public.course_teachers for select
  to authenticated
  using ("current_role"() = any (array['admin'::user_role, 'profesor'::user_role]));
