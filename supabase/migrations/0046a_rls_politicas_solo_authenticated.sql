-- 0046a · Las políticas de gestión dejan de aplicarse al rol `anon`.
--
-- Estaban creadas sin `TO`, es decir para `public` (todos los roles, anon
-- incluido). Un anónimo nunca puede ser admin ni staff, así que no le daban
-- nada, pero obligaban a Postgres a evaluar `is_admin()` / `current_role()` en
-- cada lectura anónima. Mientras eso fuera así, no se le podía retirar a `anon`
-- el EXECUTE de esos helpers (0046c) sin tumbar la web pública.
--
-- Las dos lecturas públicas de verdad (modalidades activas, eventos públicos)
-- pierden el `OR is_admin()`: el admin ya lee todo por su política de gestión.

alter policy "attendance: gestión admin" on public.attendance to authenticated;
alter policy "class_sessions: gestión admin" on public.class_sessions to authenticated;
alter policy "contenido: profesor/admin gestiona" on public.contenido to authenticated;
alter policy "course_teachers: gestión admin" on public.course_teachers to authenticated;
alter policy "courses: gestión admin" on public.courses to authenticated;
alter policy "enrollments: gestión admin" on public.enrollments to authenticated;
alter policy "eventos: gestión admin" on public.eventos to authenticated;
alter policy "intensivo_registros: actualización staff" on public.intensivo_registros to authenticated;
alter policy "intensivo_registros: alta staff" on public.intensivo_registros to authenticated;
alter policy "intensivo_registros: borrado admin" on public.intensivo_registros to authenticated;
alter policy "intensivo_registros: lectura staff" on public.intensivo_registros to authenticated;
alter policy "leads: lectura admin" on public.leads to authenticated;
alter policy "leads: update admin" on public.leads to authenticated;
alter policy "modalidades: gestión admin" on public.modalidades to authenticated;
alter policy "niveles: gestión admin" on public.niveles to authenticated;
alter policy "point_events: gestión admin" on public.point_events to authenticated;
alter policy "point_milestones: gestión admin" on public.point_milestones to authenticated;
alter policy "point_rules: gestión admin" on public.point_rules to authenticated;
alter policy "profiles: actualizar propio o admin" on public.profiles to authenticated;
alter policy "profiles: admin inserta/borra" on public.profiles to authenticated;
alter policy "profiles: leer propio o admin" on public.profiles to authenticated;
alter policy "reward_redemptions: gestión admin" on public.reward_redemptions to authenticated;
alter policy "rewards: gestión admin" on public.rewards to authenticated;
alter policy "students: gestión admin" on public.students to authenticated;
alter policy "teachers: gestión admin" on public.teachers to authenticated;
alter policy "whatsapp_events: gestión admin" on public.whatsapp_events to authenticated;

alter policy "modalidades: lectura activas (todos)" on public.modalidades using (activo);
alter policy "eventos: lectura públicos (todos)" on public.eventos using (publico);
