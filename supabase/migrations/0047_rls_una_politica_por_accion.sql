-- ════════════════════════════════════════════════════════════════════════════
-- 0047 · Una política permisiva por tabla, acción y rol
--
-- Supabase marcaba 26 avisos `multiple_permissive_policies`: casi todas las
-- tablas tenían una política de admin `FOR ALL` que se solapaba con las de
-- lectura/escritura de alumno y profesor. Postgres evalúa TODAS las políticas
-- permisivas de una acción y las une con OR, así que cada consulta pagaba varias
-- evaluaciones por fila.
--
-- Aquí se deja una política por acción (select / insert / update / delete) con
-- las condiciones de antes unidas con OR. Es la misma regla, no una nueva:
--   · USING de una acción      = OR de los USING de las políticas que la cubrían
--   · WITH CHECK de una acción = OR de sus WITH CHECK
-- Además, las funciones sin argumentos (`is_admin`, `current_role`,
-- `current_student_id`, `auth.uid`) van en `(select …)` para que Postgres las
-- calcule una vez por consulta (initplan) y no una por fila.
--
-- No se tocan `leads`, `intensivo_registros` ni `whatsapp_events`: no tenían
-- solapes. Las lecturas públicas (`eventos`, `modalidades`, `niveles`) quedan
-- con una política para `anon` y otra para `authenticated`: `anon` no puede
-- ejecutar `is_admin()` desde 0046c, así que no pueden compartir condición.
--
-- Verificación: supabase/tests/database/rls.test.sql (job `rls` de la CI) y
-- recuentos por rol antes/después en producción.
-- ════════════════════════════════════════════════════════════════════════════

-- ── attendance ──────────────────────────────────────────────────────────────
drop policy "attendance: gestión admin" on public.attendance;
drop policy "attendance: alumno lee la suya" on public.attendance;
drop policy "attendance: profesor de la sesión / admin" on public.attendance;
drop policy "attendance: profesor registra en su sesión" on public.attendance;
drop policy "attendance: profesor corrige su sesión" on public.attendance;
drop policy "attendance: profesor borra el suelto de su sesión" on public.attendance;

create policy "attendance: lectura" on public.attendance
  for select to authenticated
  using (
    (select public.is_admin())
    or student_id = (select public.current_student_id())
    or public.can_teach_session(class_session_id)
  );

create policy "attendance: alta" on public.attendance
  for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      public.can_teach_session(class_session_id)
      and exists (
        select 1 from public.class_sessions cs
        where cs.id = attendance.class_session_id
          and cs.status <> 'cancelada'::public.session_status
      )
      and public.can_record_attendance(class_session_id, student_id)
      and recorded_by = (select auth.uid())
    )
  );

create policy "attendance: cambio" on public.attendance
  for update to authenticated
  using ((select public.is_admin()) or public.can_teach_session(class_session_id))
  with check (
    (select public.is_admin())
    or (
      public.can_teach_session(class_session_id)
      and public.can_record_attendance(class_session_id, student_id)
      and recorded_by = (select auth.uid())
    )
  );

-- El profe solo borra apuntes de SUELTOS (sin matrícula activa en el curso).
create policy "attendance: borrado" on public.attendance
  for delete to authenticated
  using (
    (select public.is_admin())
    or (
      public.can_teach_session(class_session_id)
      and not exists (
        select 1
        from public.enrollments e
        join public.class_sessions cs on cs.course_id = e.course_id
        where cs.id = attendance.class_session_id
          and e.student_id = attendance.student_id
          and e.status <> 'baja'::public.inscripcion_estado
      )
    )
  );

-- ── class_sessions ──────────────────────────────────────────────────────────
drop policy "class_sessions: gestión admin" on public.class_sessions;
drop policy "class_sessions: alumno lee las de sus cursos" on public.class_sessions;
drop policy "class_sessions: profesor titular o sustituto / admin" on public.class_sessions;
drop policy "class_sessions: profesor titular o sustituto actualiza" on public.class_sessions;

create policy "class_sessions: lectura" on public.class_sessions
  for select to authenticated
  using (
    (select public.is_admin())
    or course_id in (select public.current_student_course_ids())
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  );

create policy "class_sessions: alta admin" on public.class_sessions
  for insert to authenticated
  with check ((select public.is_admin()));

-- Qué columnas puede cambiar el profe lo decide el trigger
-- class_sessions_guard_teacher_update, no esta política.
create policy "class_sessions: cambio" on public.class_sessions
  for update to authenticated
  using (
    (select public.is_admin())
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  )
  with check (
    (select public.is_admin())
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1 from public.teachers t
      where t.id = class_sessions.substitute_teacher_id
        and t.profile_id = (select auth.uid())
    )
  );

create policy "class_sessions: borrado admin" on public.class_sessions
  for delete to authenticated
  using ((select public.is_admin()));

-- ── contenido ───────────────────────────────────────────────────────────────
drop policy "contenido: profesor/admin gestiona" on public.contenido;
drop policy "contenido: lectura autenticados" on public.contenido;

create policy "contenido: lectura" on public.contenido
  for select to authenticated
  using (true);

create policy "contenido: alta" on public.contenido
  for insert to authenticated
  with check ((select public.is_admin()) or created_by = (select auth.uid()));

create policy "contenido: cambio" on public.contenido
  for update to authenticated
  using ((select public.is_admin()) or created_by = (select auth.uid()))
  with check ((select public.is_admin()) or created_by = (select auth.uid()));

create policy "contenido: borrado" on public.contenido
  for delete to authenticated
  using ((select public.is_admin()) or created_by = (select auth.uid()));

-- ── course_teachers ─────────────────────────────────────────────────────────
drop policy "course_teachers: gestión admin" on public.course_teachers;
drop policy "course_teachers: alumno lee los de sus cursos" on public.course_teachers;
drop policy "course_teachers: lectura admin/profesor" on public.course_teachers;

create policy "course_teachers: lectura" on public.course_teachers
  for select to authenticated
  using (
    (select public."current_role"()) in ('admin', 'profesor')
    or course_id in (select public.current_student_course_ids())
  );

create policy "course_teachers: alta admin" on public.course_teachers
  for insert to authenticated with check ((select public.is_admin()));
create policy "course_teachers: cambio admin" on public.course_teachers
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "course_teachers: borrado admin" on public.course_teachers
  for delete to authenticated using ((select public.is_admin()));

-- ── courses ─────────────────────────────────────────────────────────────────
drop policy "courses: gestión admin" on public.courses;
drop policy "courses: alumno lee los suyos" on public.courses;
drop policy "courses: lectura admin/profesor" on public.courses;

create policy "courses: lectura" on public.courses
  for select to authenticated
  using (
    (select public."current_role"()) in ('admin', 'profesor')
    or id in (select public.current_student_course_ids())
  );

create policy "courses: alta admin" on public.courses
  for insert to authenticated with check ((select public.is_admin()));
create policy "courses: cambio admin" on public.courses
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "courses: borrado admin" on public.courses
  for delete to authenticated using ((select public.is_admin()));

-- ── enrollments ─────────────────────────────────────────────────────────────
drop policy "enrollments: gestión admin" on public.enrollments;
drop policy "enrollments: alumno lee las suyas" on public.enrollments;
drop policy "enrollments: profesor de su curso / admin" on public.enrollments;

create policy "enrollments: lectura" on public.enrollments
  for select to authenticated
  using (
    (select public.is_admin())
    or student_id = (select public.current_student_id())
    or course_id in (select public.current_teacher_course_ids())
    or exists (
      select 1
      from public.class_sessions cs
      join public.teachers t on t.id = cs.substitute_teacher_id
      where cs.course_id = enrollments.course_id
        and t.profile_id = (select auth.uid())
    )
  );

create policy "enrollments: alta admin" on public.enrollments
  for insert to authenticated with check ((select public.is_admin()));
create policy "enrollments: cambio admin" on public.enrollments
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "enrollments: borrado admin" on public.enrollments
  for delete to authenticated using ((select public.is_admin()));

-- ── eventos ─────────────────────────────────────────────────────────────────
drop policy "eventos: gestión admin" on public.eventos;
drop policy "eventos: lectura públicos (todos)" on public.eventos;

create policy "eventos: lectura públicos (anónimos)" on public.eventos
  for select to anon
  using (publico);

create policy "eventos: lectura" on public.eventos
  for select to authenticated
  using (publico or (select public.is_admin()));

create policy "eventos: alta admin" on public.eventos
  for insert to authenticated with check ((select public.is_admin()));
create policy "eventos: cambio admin" on public.eventos
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "eventos: borrado admin" on public.eventos
  for delete to authenticated using ((select public.is_admin()));

-- ── modalidades ─────────────────────────────────────────────────────────────
drop policy "modalidades: gestión admin" on public.modalidades;
drop policy "modalidades: lectura activas (todos)" on public.modalidades;

create policy "modalidades: lectura activas (anónimos)" on public.modalidades
  for select to anon
  using (activo);

create policy "modalidades: lectura" on public.modalidades
  for select to authenticated
  using (activo or (select public.is_admin()));

create policy "modalidades: alta admin" on public.modalidades
  for insert to authenticated with check ((select public.is_admin()));
create policy "modalidades: cambio admin" on public.modalidades
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "modalidades: borrado admin" on public.modalidades
  for delete to authenticated using ((select public.is_admin()));

-- ── niveles ─────────────────────────────────────────────────────────────────
drop policy "niveles: gestión admin" on public.niveles;
drop policy "niveles: lectura (todos)" on public.niveles;

create policy "niveles: lectura (todos)" on public.niveles
  for select to anon, authenticated
  using (true);

create policy "niveles: alta admin" on public.niveles
  for insert to authenticated with check ((select public.is_admin()));
create policy "niveles: cambio admin" on public.niveles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "niveles: borrado admin" on public.niveles
  for delete to authenticated using ((select public.is_admin()));

-- ── point_events ────────────────────────────────────────────────────────────
drop policy "point_events: gestión admin" on public.point_events;
drop policy "point_events: alumno lee los suyos" on public.point_events;
drop policy "point_events: profesor lee los de sus alumnos" on public.point_events;

create policy "point_events: lectura" on public.point_events
  for select to authenticated
  using (
    (select public.is_admin())
    or student_id = (select public.current_student_id())
    or public.teaches_student(student_id)
  );

create policy "point_events: alta admin" on public.point_events
  for insert to authenticated with check ((select public.is_admin()));
create policy "point_events: cambio admin" on public.point_events
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "point_events: borrado admin" on public.point_events
  for delete to authenticated using ((select public.is_admin()));

-- ── point_milestones · point_rules · rewards (catálogos) ────────────────────
drop policy "point_milestones: gestión admin" on public.point_milestones;
drop policy "point_milestones: lectura autenticados" on public.point_milestones;
create policy "point_milestones: lectura" on public.point_milestones
  for select to authenticated using (true);
create policy "point_milestones: alta admin" on public.point_milestones
  for insert to authenticated with check ((select public.is_admin()));
create policy "point_milestones: cambio admin" on public.point_milestones
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "point_milestones: borrado admin" on public.point_milestones
  for delete to authenticated using ((select public.is_admin()));

drop policy "point_rules: gestión admin" on public.point_rules;
drop policy "point_rules: lectura autenticados" on public.point_rules;
create policy "point_rules: lectura" on public.point_rules
  for select to authenticated using (true);
create policy "point_rules: alta admin" on public.point_rules
  for insert to authenticated with check ((select public.is_admin()));
create policy "point_rules: cambio admin" on public.point_rules
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "point_rules: borrado admin" on public.point_rules
  for delete to authenticated using ((select public.is_admin()));

drop policy "rewards: gestión admin" on public.rewards;
drop policy "rewards: lectura autenticados" on public.rewards;
create policy "rewards: lectura" on public.rewards
  for select to authenticated using (true);
create policy "rewards: alta admin" on public.rewards
  for insert to authenticated with check ((select public.is_admin()));
create policy "rewards: cambio admin" on public.rewards
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "rewards: borrado admin" on public.rewards
  for delete to authenticated using ((select public.is_admin()));

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy "profiles: admin inserta/borra" on public.profiles;
drop policy "profiles: leer propio o admin" on public.profiles;
drop policy "profiles: actualizar propio o admin" on public.profiles;

create policy "profiles: lectura propio o admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- El cambio de rol lo frena el trigger profiles_guard_role_change (0022).
create policy "profiles: cambio propio o admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: alta admin" on public.profiles
  for insert to authenticated with check ((select public.is_admin()));
create policy "profiles: borrado admin" on public.profiles
  for delete to authenticated using ((select public.is_admin()));

-- ── reward_redemptions ──────────────────────────────────────────────────────
drop policy "reward_redemptions: gestión admin" on public.reward_redemptions;
drop policy "reward_redemptions: alumno lee los suyos" on public.reward_redemptions;
drop policy "reward_redemptions: alumno solicita el suyo" on public.reward_redemptions;

create policy "reward_redemptions: lectura" on public.reward_redemptions
  for select to authenticated
  using ((select public.is_admin()) or student_id = (select public.current_student_id()));

create policy "reward_redemptions: alta" on public.reward_redemptions
  for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      student_id = (select public.current_student_id())
      and status = 'solicitado'::public.redemption_status
      and resolved_at is null
      and resolved_by is null
      and exists (
        select 1 from public.rewards r
        where r.id = reward_redemptions.reward_id
          and r.active
          and r.cost_points = reward_redemptions.cost_points
      )
    )
  );

create policy "reward_redemptions: cambio admin" on public.reward_redemptions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reward_redemptions: borrado admin" on public.reward_redemptions
  for delete to authenticated using ((select public.is_admin()));

-- ── session_notes · session_videos (diario de clase) ────────────────────────
drop policy "session_notes: gestiona profesor de la sesion / admin" on public.session_notes;
drop policy "session_notes: lectura alumno/profesor/admin" on public.session_notes;

create policy "session_notes: lectura" on public.session_notes
  for select to authenticated
  using (
    (select public.is_admin())
    or public.can_teach_session(class_session_id)
    or public.student_can_see_session(class_session_id)
  );
create policy "session_notes: alta" on public.session_notes
  for insert to authenticated
  with check ((select public.is_admin()) or public.can_teach_session(class_session_id));
create policy "session_notes: cambio" on public.session_notes
  for update to authenticated
  using ((select public.is_admin()) or public.can_teach_session(class_session_id))
  with check ((select public.is_admin()) or public.can_teach_session(class_session_id));
create policy "session_notes: borrado" on public.session_notes
  for delete to authenticated
  using ((select public.is_admin()) or public.can_teach_session(class_session_id));

drop policy "session_videos: gestiona profesor de la sesion / admin" on public.session_videos;
drop policy "session_videos: lectura alumno/profesor/admin" on public.session_videos;

create policy "session_videos: lectura" on public.session_videos
  for select to authenticated
  using (
    (select public.is_admin())
    or public.can_teach_session(class_session_id)
    or public.student_can_see_session(class_session_id)
  );
create policy "session_videos: alta" on public.session_videos
  for insert to authenticated
  with check ((select public.is_admin()) or public.can_teach_session(class_session_id));
create policy "session_videos: cambio" on public.session_videos
  for update to authenticated
  using ((select public.is_admin()) or public.can_teach_session(class_session_id))
  with check ((select public.is_admin()) or public.can_teach_session(class_session_id));
create policy "session_videos: borrado" on public.session_videos
  for delete to authenticated
  using ((select public.is_admin()) or public.can_teach_session(class_session_id));

-- ── students ────────────────────────────────────────────────────────────────
drop policy "students: gestión admin" on public.students;
drop policy "students: alumno lee su ficha" on public.students;
drop policy "students: lectura profesor con matrícula / admin" on public.students;
drop policy "students: alumno actualiza su perfil" on public.students;
drop policy "students: profesor actualiza sus alumnos" on public.students;

create policy "students: lectura" on public.students
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select public.is_admin())
    or public.teaches_or_substitutes_student(id)
  );

-- Qué columnas puede tocar cada rol lo decide el trigger
-- students_guard_teacher_update (lista blanca), no esta política.
create policy "students: cambio" on public.students
  for update to authenticated
  using (
    (select public.is_admin())
    or profile_id = (select auth.uid())
    or public.teaches_student(id)
  )
  with check (
    (select public.is_admin())
    or profile_id = (select auth.uid())
    or public.teaches_student(id)
  );

create policy "students: alta admin" on public.students
  for insert to authenticated with check ((select public.is_admin()));
create policy "students: borrado admin" on public.students
  for delete to authenticated using ((select public.is_admin()));

-- ── teachers ────────────────────────────────────────────────────────────────
drop policy "teachers: gestión admin" on public.teachers;
drop policy "teachers: alumno lee los de sus cursos" on public.teachers;
drop policy "teachers: lectura admin/profesor" on public.teachers;

create policy "teachers: lectura" on public.teachers
  for select to authenticated
  using (
    (select public."current_role"()) in ('admin', 'profesor')
    or id in (select public.current_student_teacher_ids())
  );

create policy "teachers: alta admin" on public.teachers
  for insert to authenticated with check ((select public.is_admin()));
create policy "teachers: cambio admin" on public.teachers
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "teachers: borrado admin" on public.teachers
  for delete to authenticated using ((select public.is_admin()));
