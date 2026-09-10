-- ════════════════════════════════════════════════════════════════════════════
-- 0044c · política de UPDATE del alumno sobre su propia ficha
--
-- `using` acota qué filas alcanza; `with check` impide que el update mueva la
-- fila fuera de su alcance (cambiarse el `profile_id` a otro). El guard de
-- 0044b es la segunda barrera, la que dice QUÉ columnas: RLS decide la fila,
-- el trigger decide el campo.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "students: alumno actualiza su perfil" on public.students;
create policy "students: alumno actualiza su perfil"
  on public.students for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
