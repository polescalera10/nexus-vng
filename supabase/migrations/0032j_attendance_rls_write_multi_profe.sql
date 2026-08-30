-- 0032j · Asistencia, corrección. El alumno tiene que seguir matriculado (no
-- de baja) y el apunte queda a nombre de quien lo firma. Ver 0032a.

drop policy if exists "attendance: profesor corrige su sesión" on public.attendance;
create policy "attendance: profesor corrige su sesión"
  on public.attendance for update
  to authenticated
  using (public.can_teach_session(class_session_id))
  with check (
    public.can_teach_session(class_session_id)
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
