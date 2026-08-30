-- 0032d · El alumno ve quién le da sus cursos. Vía función SECURITY DEFINER,
-- para no reabrir la recursión de RLS que arregló 0031.

drop policy if exists "course_teachers: alumno lee los de sus cursos" on public.course_teachers;
create policy "course_teachers: alumno lee los de sus cursos"
  on public.course_teachers for select
  to authenticated
  using (course_id in (select public.current_student_course_ids()));
