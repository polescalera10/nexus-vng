-- 0032n · Puntos, lectura del profe titular. Ver 0032a.

drop policy if exists "point_events: profesor lee los de sus alumnos" on public.point_events;
create policy "point_events: profesor lee los de sus alumnos"
  on public.point_events for select
  to authenticated
  using (public.teaches_student(student_id));
