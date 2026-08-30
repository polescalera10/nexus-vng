-- 0032k · Asistencia, alta. Además, la sesión no puede estar cancelada. Ver 0032a.

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
    and exists (
      select 1
      from public.enrollments e
      join public.class_sessions cs on cs.course_id = e.course_id
      where cs.id = attendance.class_session_id
        and e.student_id = attendance.student_id
        and e.status <> 'baja'::inscripcion_estado
    )
    and recorded_by = auth.uid()
  );
