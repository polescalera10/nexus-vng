-- ════════════════════════════════════════════════════════════════════════════
-- 0038b · Asistencia: el fundador de suelto entra en la lista
--
--   Sustituye el `exists` sobre `enrollments` que 0032j y 0032k llevaban
--   inline por `can_record_attendance` (0038a), que además admite al socio
--   fundador sin matrícula en clases regulares.
--
--   Lo demás no se toca: sigue haciendo falta ser titular o sustituto de la
--   sesión, la sesión no puede estar cancelada y el apunte queda firmado por
--   quien lo hace.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "attendance: profesor registra en su sesión" on public.attendance;
create policy "attendance: profesor registra en su sesión"
  on public.attendance for insert
  to authenticated
  with check (
    public.can_teach_session(class_session_id)
    and exists (
      select 1 from public.class_sessions cs
      where cs.id = attendance.class_session_id
        and cs.status <> 'cancelada'::session_status
    )
    and public.can_record_attendance(class_session_id, student_id)
    and recorded_by = auth.uid()
  );

drop policy if exists "attendance: profesor corrige su sesión" on public.attendance;
create policy "attendance: profesor corrige su sesión"
  on public.attendance for update
  to authenticated
  using (public.can_teach_session(class_session_id))
  with check (
    public.can_teach_session(class_session_id)
    and public.can_record_attendance(class_session_id, student_id)
    and recorded_by = auth.uid()
  );

-- Borrar el apunte de un suelto añadido por error. Antes no existía política
-- de DELETE: con matrícula no hacía falta (se corrige marcando ausente), pero
-- un suelto equivocado deja una fila que no cuelga de ninguna matrícula y no
-- hay otra forma de quitarla desde el panel.
drop policy if exists "attendance: profesor borra el suelto de su sesión" on public.attendance;
create policy "attendance: profesor borra el suelto de su sesión"
  on public.attendance for delete
  to authenticated
  using (
    public.can_teach_session(class_session_id)
    and not exists (
      select 1
      from public.enrollments e
      join public.class_sessions cs on cs.course_id = e.course_id
      where cs.id = attendance.class_session_id
        and e.student_id = attendance.student_id
        and e.status <> 'baja'::inscripcion_estado
    )
  );
