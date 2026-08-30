-- 0032m · Alumnos, escritura: solo titular, como antes de 0032 (el sustituto
-- no edita fichas). Ver 0032a.

drop policy if exists "students: profesor actualiza sus alumnos" on public.students;
create policy "students: profesor actualiza sus alumnos"
  on public.students for update
  to authenticated
  using (public.teaches_student(id))
  with check (public.teaches_student(id));
