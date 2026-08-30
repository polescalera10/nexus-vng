-- 0032i · Asistencia, lectura. Ver 0032a.

drop policy if exists "attendance: profesor de la sesión / admin" on public.attendance;
create policy "attendance: profesor de la sesión / admin"
  on public.attendance for select
  to authenticated
  using (is_admin() or public.can_teach_session(class_session_id));
