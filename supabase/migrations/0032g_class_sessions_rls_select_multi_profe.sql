-- 0032g · Sesiones, lectura. Ver 0032a.

drop policy if exists "class_sessions: profesor titular o sustituto / admin" on public.class_sessions;
create policy "class_sessions: profesor titular o sustituto / admin"
  on public.class_sessions for select
  to authenticated
  using (
    is_admin()
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id and t.profile_id = auth.uid()
    )
  );
