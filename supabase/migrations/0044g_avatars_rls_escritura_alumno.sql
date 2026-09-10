-- ════════════════════════════════════════════════════════════════════════════
-- 0044g · quién escribe en el bucket `avatars`
--
-- Cada alumno, solo dentro de la carpeta que lleva su id. La comparación es
-- contra `current_student_id()`, no contra `auth.uid()`: la carpeta se nombra
-- con el id de la FICHA, que es el que viaja en `students.avatar_path` y el
-- que valida el CHECK de 0044a. Con auth.uid() las dos mitades no cuadrarían.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "avatars: el alumno sube en su carpeta" on storage.objects;
create policy "avatars: el alumno sube en su carpeta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_student_id()::text
  );

drop policy if exists "avatars: el alumno reemplaza en su carpeta" on storage.objects;
create policy "avatars: el alumno reemplaza en su carpeta"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_student_id()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_student_id()::text
  );

drop policy if exists "avatars: el alumno borra en su carpeta" on storage.objects;
create policy "avatars: el alumno borra en su carpeta"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_student_id()::text
  );
