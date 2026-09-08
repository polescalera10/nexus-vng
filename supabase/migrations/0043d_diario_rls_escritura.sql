-- 0043d · Diario de clase, escritura. Ver 0043a.
--
-- Escriben el profe de la sesión y el admin. El alumno solo lee: no hay
-- política de insert/update/delete para él, y sin política la RLS deniega.
-- `with check` además de `using` para que no se pueda mover una fila a una
-- sesión ajena en un update.

drop policy if exists "session_notes: gestiona profesor de la sesion / admin" on public.session_notes;
create policy "session_notes: gestiona profesor de la sesion / admin"
  on public.session_notes for all
  to authenticated
  using (public.is_admin() or public.can_teach_session(class_session_id))
  with check (public.is_admin() or public.can_teach_session(class_session_id));

drop policy if exists "session_videos: gestiona profesor de la sesion / admin" on public.session_videos;
create policy "session_videos: gestiona profesor de la sesion / admin"
  on public.session_videos for all
  to authenticated
  using (public.is_admin() or public.can_teach_session(class_session_id))
  with check (public.is_admin() or public.can_teach_session(class_session_id));
