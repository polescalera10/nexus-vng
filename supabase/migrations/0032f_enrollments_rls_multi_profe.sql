-- 0032f · Matrículas: el titular sale ya de `course_teachers`. Ver 0032a.

drop policy if exists "enrollments: profesor de su curso / admin" on public.enrollments;
create policy "enrollments: profesor de su curso / admin"
  on public.enrollments for select
  to authenticated
  using (
    is_admin()
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1
      from public.class_sessions cs
      join public.teachers t on t.id = cs.substitute_teacher_id
      where cs.course_id = enrollments.course_id and t.profile_id = auth.uid()
    )
  );
