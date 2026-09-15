-- 0046b · `auth.uid()` envuelto en `(select …)` en las políticas.
--
-- Sin el subselect Postgres vuelve a llamar a `auth.uid()` por cada fila; con
-- él lo calcula una vez por consulta (initplan). Mismo resultado, menos coste.
-- Lint 0003_auth_rls_initplan de Supabase. Las expresiones son las de
-- producción a 15-09-2026, cambiando solo esa llamada.

alter policy "profiles: leer propio o admin" on public.profiles
  using ((id = (select auth.uid())) or public.is_admin());

alter policy "profiles: actualizar propio o admin" on public.profiles
  using ((id = (select auth.uid())) or public.is_admin())
  with check ((id = (select auth.uid())) or public.is_admin());

alter policy "contenido: profesor/admin gestiona" on public.contenido
  using (public.is_admin() or (created_by = (select auth.uid())))
  with check (public.is_admin() or (created_by = (select auth.uid())));

alter policy "students: alumno lee su ficha" on public.students
  using (profile_id = (select auth.uid()));

alter policy "students: alumno actualiza su perfil" on public.students
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

alter policy "enrollments: profesor de su curso / admin" on public.enrollments
  using (
    public.is_admin()
    or (course_id in (select public.current_teacher_course_ids()))
    or exists (
      select 1
      from public.class_sessions cs
      join public.teachers t on t.id = cs.substitute_teacher_id
      where cs.course_id = enrollments.course_id
        and t.profile_id = (select auth.uid())
    )
  );

alter policy "class_sessions: profesor titular o sustituto / admin" on public.class_sessions
  using (
    public.is_admin()
    or (course_id in (select public.current_teacher_course_ids()))
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  );

alter policy "class_sessions: profesor titular o sustituto actualiza" on public.class_sessions
  using (
    (course_id in (select public.current_teacher_course_ids()))
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  )
  with check (
    (course_id in (select public.current_teacher_course_ids()))
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  );

alter policy "attendance: profesor registra en su sesión" on public.attendance
  with check (
    public.can_teach_session(class_session_id)
    and exists (
      select 1 from public.class_sessions cs
      where cs.id = attendance.class_session_id
        and cs.status <> 'cancelada'::session_status
    )
    and public.can_record_attendance(class_session_id, student_id)
    and recorded_by = (select auth.uid())
  );

alter policy "attendance: profesor corrige su sesión" on public.attendance
  using (public.can_teach_session(class_session_id))
  with check (
    public.can_teach_session(class_session_id)
    and public.can_record_attendance(class_session_id, student_id)
    and recorded_by = (select auth.uid())
  );
