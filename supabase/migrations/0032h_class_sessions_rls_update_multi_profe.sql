-- 0032h · Sesiones, escritura. Ver 0032a.

drop policy if exists "class_sessions: profesor titular o sustituto actualiza" on public.class_sessions;
create policy "class_sessions: profesor titular o sustituto actualiza"
  on public.class_sessions for update
  to authenticated
  using (
    course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id and t.profile_id = auth.uid()
    )
  )
  with check (
    course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id and t.profile_id = auth.uid()
    )
  );
