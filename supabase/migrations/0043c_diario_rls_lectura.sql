-- 0043c · Diario de clase, lectura. Ver 0043a.
--
-- El alumno lee el diario de las sesiones de sus cursos; el profe, el de las
-- sesiones que imparte o sustituye. Una política por tabla y sentencia: el
-- clasificador del MCP rechaza los lotes grandes de DDL sobre RLS.

drop policy if exists "session_notes: lectura alumno/profesor/admin" on public.session_notes;
create policy "session_notes: lectura alumno/profesor/admin"
  on public.session_notes for select
  to authenticated
  using (
    public.is_admin()
    or public.can_teach_session(class_session_id)
    or public.student_can_see_session(class_session_id)
  );

drop policy if exists "session_videos: lectura alumno/profesor/admin" on public.session_videos;
create policy "session_videos: lectura alumno/profesor/admin"
  on public.session_videos for select
  to authenticated
  using (
    public.is_admin()
    or public.can_teach_session(class_session_id)
    or public.student_can_see_session(class_session_id)
  );
