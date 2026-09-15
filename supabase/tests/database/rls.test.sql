-- ════════════════════════════════════════════════════════════════════════════
-- Tests de RLS por rol (pgTAP) · `supabase test db`
--
-- Qué cubre: lo que cada rol (anon, alumno, profesor, admin) puede leer y
-- escribir, las regresiones de la auditoría de seguridad (escalada de rol,
-- insert anónimo en leads, helpers invocables por anon, oráculo de asistencia)
-- y las reglas que viven en triggers (guards de columnas por rol).
--
-- Cómo está hecho:
--   · Todo va dentro de una transacción con ROLLBACK: no deja nada.
--   · Crea sus propios datos con UUIDs fijos (prefijo 7e570000-…) y TODAS las
--     consultas filtran por esos ids. Así da igual lo que traigan el seed o el
--     catálogo de 0025: los recuentos no dependen de ellos.
--   · Para "ser" un usuario: `request.jwt.claims` con su `sub` + `set local
--     role authenticated`, que es exactamente lo que hace PostgREST. `reset
--     role` vuelve a postgres (salta RLS) para preparar el siguiente bloque.
--
-- Mapa de datos:
--   usuarios  …01 admin · …02 profe P1 · …03 profe P2 · …04 alumno S1 · …05 alumno S2
--   teachers  …11 T1 (P1) · …12 T2 (P2)
--   students  …21 S1 (login …04, curso C1) · …22 S2 (login …05, curso C2, fuera del ranking)
--             …23 S3 (sin login, curso C1) · …24 S4 (socio fundador, sin matrícula)
--   courses   …31 C1 (da T1) · …32 C2 (da T2)
--   sessions  …41 CS1 (C1) · …42 CS2 (C2)
--
-- Al añadir una tabla o una política: añade aquí su caso por rol. Si un test
-- de este fichero falla tras tocar RLS, la política está mal, no el test.
-- ════════════════════════════════════════════════════════════════════════════

begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- ─── Datos ──────────────────────────────────────────────────────────────────

insert into auth.users (id, email) values
  ('7e570000-0000-4000-8000-000000000001', 'rls-admin@test.local'),
  ('7e570000-0000-4000-8000-000000000002', 'rls-profe1@test.local'),
  ('7e570000-0000-4000-8000-000000000003', 'rls-profe2@test.local'),
  ('7e570000-0000-4000-8000-000000000004', 'rls-alumno1@test.local'),
  ('7e570000-0000-4000-8000-000000000005', 'rls-alumno2@test.local');

-- handle_new_user los crea como alumno; sin claims, el guard deja cambiar el rol.
update public.profiles set role = 'admin'    where id = '7e570000-0000-4000-8000-000000000001';
update public.profiles set role = 'profesor' where id in ('7e570000-0000-4000-8000-000000000002',
                                                         '7e570000-0000-4000-8000-000000000003');

insert into public.modalidades (id, nombre, slug, activo) values
  ('7e570000-0000-4000-8000-000000000051', 'RLS activa',   'rls-activa',   true),
  ('7e570000-0000-4000-8000-000000000052', 'RLS inactiva', 'rls-inactiva', false);

insert into public.eventos (id, titulo, slug, fecha, publico) values
  ('7e570000-0000-4000-8000-000000000061', 'RLS público', 'rls-publico', now() + interval '7 days', true),
  ('7e570000-0000-4000-8000-000000000062', 'RLS privado', 'rls-privado', now() + interval '7 days', false);

insert into public.teachers (id, profile_id, full_name) values
  ('7e570000-0000-4000-8000-000000000011', '7e570000-0000-4000-8000-000000000002', 'Profe Uno'),
  ('7e570000-0000-4000-8000-000000000012', '7e570000-0000-4000-8000-000000000003', 'Profe Dos');

insert into public.students (id, profile_id, full_name, phone, dance_role, is_founding_member, active, show_in_leaderboard) values
  ('7e570000-0000-4000-8000-000000000021', '7e570000-0000-4000-8000-000000000004', 'Alumna Uno',  '+34600000021', 'follower', false, true, true),
  ('7e570000-0000-4000-8000-000000000022', '7e570000-0000-4000-8000-000000000005', 'Alumno Dos',  '+34600000022', 'leader',   false, true, false),
  ('7e570000-0000-4000-8000-000000000023', null,                                   'Alumno Tres', '+34600000023', 'leader',   false, true, true),
  ('7e570000-0000-4000-8000-000000000024', null,                                   'Fundadora',   '+34600000024', 'follower', true,  true, true);

insert into public.courses (id, name, modalidad_id, weekday, start_time) values
  ('7e570000-0000-4000-8000-000000000031', 'RLS C1', '7e570000-0000-4000-8000-000000000051', 2, '20:00'),
  ('7e570000-0000-4000-8000-000000000032', 'RLS C2', '7e570000-0000-4000-8000-000000000051', 3, '21:00');

insert into public.course_teachers (course_id, teacher_id) values
  ('7e570000-0000-4000-8000-000000000031', '7e570000-0000-4000-8000-000000000011'),
  ('7e570000-0000-4000-8000-000000000032', '7e570000-0000-4000-8000-000000000012');

insert into public.enrollments (student_id, course_id, role_in_course, status) values
  ('7e570000-0000-4000-8000-000000000021', '7e570000-0000-4000-8000-000000000031', 'follower', 'activa'),
  ('7e570000-0000-4000-8000-000000000022', '7e570000-0000-4000-8000-000000000032', 'leader',   'activa'),
  ('7e570000-0000-4000-8000-000000000023', '7e570000-0000-4000-8000-000000000031', 'leader',   'activa');

insert into public.class_sessions (id, course_id, session_date) values
  ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000031', current_date),
  ('7e570000-0000-4000-8000-000000000042', '7e570000-0000-4000-8000-000000000032', current_date);

insert into public.attendance (class_session_id, student_id, recorded_by) values
  ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000021', '7e570000-0000-4000-8000-000000000002'),
  ('7e570000-0000-4000-8000-000000000042', '7e570000-0000-4000-8000-000000000022', '7e570000-0000-4000-8000-000000000003');

insert into public.session_notes (id, class_session_id, resumen) values
  ('7e570000-0000-4000-8000-000000000091', '7e570000-0000-4000-8000-000000000041', 'Resumen C1'),
  ('7e570000-0000-4000-8000-000000000092', '7e570000-0000-4000-8000-000000000042', 'Resumen C2');

insert into public.session_videos (id, class_session_id, url) values
  ('7e570000-0000-4000-8000-000000000093', '7e570000-0000-4000-8000-000000000041', 'https://youtu.be/dQw4w9WgXcQ'),
  ('7e570000-0000-4000-8000-000000000094', '7e570000-0000-4000-8000-000000000042', 'https://youtu.be/dQw4w9WgXcQ');

insert into public.point_events (id, student_id, points, concept) values
  ('7e570000-0000-4000-8000-000000000081', '7e570000-0000-4000-8000-000000000021', 50, 'RLS S1'),
  ('7e570000-0000-4000-8000-000000000082', '7e570000-0000-4000-8000-000000000022', 30, 'RLS S2');

insert into public.rewards (id, name, cost_points, stock, active) values
  ('7e570000-0000-4000-8000-000000000085', 'RLS premio', 20, 5, true);

insert into public.leads (id, nombre, telefono, origen) values
  ('7e570000-0000-4000-8000-000000000071', 'Lead RLS', '+34600000071', 'test-rls');

insert into public.whatsapp_events (id, student_id, type) values
  ('7e570000-0000-4000-8000-000000000072', '7e570000-0000-4000-8000-000000000021', 'broadcast');

insert into public.intensivo_registros (id, nombre, sesion) values
  ('7e570000-0000-4000-8000-000000000073', 'Registro RLS', 'rls');


-- ═══ ANON ══════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select is((select count(*) from public.modalidades where id in ('7e570000-0000-4000-8000-000000000051','7e570000-0000-4000-8000-000000000052')),
  1::bigint, 'anon: solo ve la modalidad activa');
select is((select count(*) from public.eventos where id in ('7e570000-0000-4000-8000-000000000061','7e570000-0000-4000-8000-000000000062')),
  1::bigint, 'anon: solo ve el evento público');
select is((select count(*) from public.students), 0::bigint, 'anon: no ve alumnos');
select is((select count(*) from public.profiles), 0::bigint, 'anon: no ve perfiles');
select is((select count(*) from public.leads), 0::bigint, 'anon: no ve leads');
select is((select count(*) from public.teachers), 0::bigint, 'anon: no ve profesores');
select is((select count(*) from public.courses), 0::bigint, 'anon: no ve cursos');
select is((select count(*) from public.point_events), 0::bigint, 'anon: no ve puntos');

select throws_ok($$ insert into public.leads (nombre, telefono, origen) values ('Spam', '+34600000000', 'rest') $$,
  '42501', null, 'anon: no puede insertar leads por REST (auditoría A2, 0023)');
select is_empty($$ update public.modalidades set nombre = 'x' where id = '7e570000-0000-4000-8000-000000000051' returning id $$,
  'anon: no puede modificar modalidades');
select throws_ok($$ select public.is_admin() $$, '42501', null, 'anon: no puede ejecutar is_admin() (0046c)');
select throws_ok($$ select public.current_role() $$, '42501', null, 'anon: no puede ejecutar current_role() (0046c)');
select lives_ok($$ select public.founding_spots_taken() $$, 'anon: sí puede leer el contador de plazas fundadoras');

reset role;


-- ═══ ALUMNO S1 ═════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"7e570000-0000-4000-8000-000000000004","role":"authenticated"}', true);
set local role authenticated;

select is(array(select id from public.profiles where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000004']::uuid[], 'alumno: solo ve su perfil');
select is(array(select id from public.students where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000021']::uuid[], 'alumno: solo ve su ficha');
select is(array(select id from public.courses where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000031']::uuid[], 'alumno: solo ve sus cursos');
select is(array(select id from public.class_sessions where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000041']::uuid[], 'alumno: solo ve las sesiones de sus cursos');
select is(array(select id from public.teachers where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000011']::uuid[], 'alumno: solo ve a los profes de sus cursos');
select is(array(select id from public.session_notes where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000091']::uuid[], 'alumno: solo ve el diario de sus sesiones');
select is(array(select id from public.session_videos where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000093']::uuid[], 'alumno: solo ve los vídeos de sus sesiones');
select is((select count(*) from public.attendance where student_id <> '7e570000-0000-4000-8000-000000000021'),
  0::bigint, 'alumno: no ve la asistencia de otros');
select is(array(select id from public.point_events where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000081']::uuid[], 'alumno: solo ve sus puntos');
select is((select count(*) from public.leads), 0::bigint, 'alumno: no ve leads');
select is((select count(*) from public.whatsapp_events), 0::bigint, 'alumno: no ve la cola de WhatsApp');
select is((select count(*) from public.intensivo_registros), 0::bigint, 'alumno: no ve registros de intensivos');

select throws_ok($$ update public.profiles set role = 'admin' where id = '7e570000-0000-4000-8000-000000000004' $$,
  'P0001', null, 'alumno: no puede ascenderse a admin (auditoría C1, 0022)');
select isnt_empty($$ update public.students set full_name = 'Alumna Uno Editada' where id = '7e570000-0000-4000-8000-000000000021' returning id $$,
  'alumno: puede editar su nombre');
select throws_ok($$ update public.students set payment_status = 'al_dia' where id = '7e570000-0000-4000-8000-000000000021' $$,
  'P0001', null, 'alumno: no puede tocar su estado de cuota (guard 0044b)');
select is_empty($$ update public.students set full_name = 'Hackeado' where id = '7e570000-0000-4000-8000-000000000022' returning id $$,
  'alumno: no puede editar la ficha de otro');

select is(array(select student_id from public.leaderboard_alumno(500) where student_id::text like '7e570000-%' order by student_id),
  array['7e570000-0000-4000-8000-000000000021']::uuid[], 'alumno: el ranking respeta show_in_leaderboard');

select is(public.can_drop_in_session('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000024'),
  false, 'alumno: can_drop_in_session no le responde (oráculo cerrado, 0046d)');
select is(public.can_record_attendance('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000023'),
  false, 'alumno: can_record_attendance no le responde (oráculo cerrado, 0046d)');
select is_empty($$ select id from public.founding_drop_in_candidates('7e570000-0000-4000-8000-000000000041') $$,
  'alumno: no ve candidatos a clase suelta');

select throws_ok($$ insert into public.reward_redemptions (reward_id, student_id, cost_points)
                    values ('7e570000-0000-4000-8000-000000000085', '7e570000-0000-4000-8000-000000000022', 20) $$,
  '42501', null, 'alumno: no puede canjear a nombre de otro');
select throws_ok($$ insert into public.reward_redemptions (reward_id, student_id, cost_points)
                    values ('7e570000-0000-4000-8000-000000000085', '7e570000-0000-4000-8000-000000000021', 1) $$,
  '42501', null, 'alumno: no puede canjear pagando menos de lo que cuesta');
select lives_ok($$ insert into public.reward_redemptions (reward_id, student_id, cost_points)
                   values ('7e570000-0000-4000-8000-000000000085', '7e570000-0000-4000-8000-000000000021', 20) $$,
  'alumno: puede canjear un premio propio con saldo');

reset role;


-- ═══ PROFESOR P1 (da C1) ═══════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"7e570000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

select is(array(select id from public.students where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000021', '7e570000-0000-4000-8000-000000000023']::uuid[],
  'profesor: ve solo a los alumnos de sus cursos');
select is(array(select id from public.class_sessions where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000041']::uuid[], 'profesor: ve solo sus sesiones');
select is((select count(*) from public.enrollments where course_id = '7e570000-0000-4000-8000-000000000032'),
  0::bigint, 'profesor: no ve matrículas de cursos ajenos');
select is((select count(*) from public.attendance where class_session_id = '7e570000-0000-4000-8000-000000000042'),
  0::bigint, 'profesor: no ve asistencia de sesiones ajenas');
select is(array(select id from public.point_events where id::text like '7e570000-%' order by id),
  array['7e570000-0000-4000-8000-000000000081']::uuid[], 'profesor: ve solo los puntos de sus alumnos');
select is((select count(*) from public.leads), 0::bigint, 'profesor: no ve leads');
select is((select count(*) from public.whatsapp_events), 0::bigint, 'profesor: no ve la cola de WhatsApp');
select is((select count(*) from public.intensivo_registros where id = '7e570000-0000-4000-8000-000000000073'),
  1::bigint, 'profesor: ve los registros de intensivos (staff)');

select isnt_empty($$ update public.students set notes = 'Va bien' where id = '7e570000-0000-4000-8000-000000000021' returning id $$,
  'profesor: puede anotar a un alumno suyo');
select throws_ok($$ update public.students set full_name = 'Otro nombre' where id = '7e570000-0000-4000-8000-000000000021' $$,
  'P0001', null, 'profesor: no puede cambiar el nombre de un alumno (guard)');
select is_empty($$ update public.students set notes = 'x' where id = '7e570000-0000-4000-8000-000000000022' returning id $$,
  'profesor: no puede tocar alumnos ajenos');

select lives_ok($$ update public.class_sessions set status = 'impartida' where id = '7e570000-0000-4000-8000-000000000041' $$,
  'profesor: puede marcar su sesión como impartida');
select throws_ok($$ update public.class_sessions set session_date = current_date + 1 where id = '7e570000-0000-4000-8000-000000000041' $$,
  'P0001', null, 'profesor: no puede mover la fecha de la sesión (guard)');

select lives_ok($$ insert into public.attendance (class_session_id, student_id, recorded_by)
                   values ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000023', '7e570000-0000-4000-8000-000000000002') $$,
  'profesor: pasa lista a un alumno matriculado');
select lives_ok($$ insert into public.attendance (class_session_id, student_id, recorded_by)
                   values ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000024', '7e570000-0000-4000-8000-000000000002') $$,
  'profesor: apunta a un socio fundador de clase suelta');
select throws_ok($$ insert into public.attendance (class_session_id, student_id, recorded_by)
                    values ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000022', '7e570000-0000-4000-8000-000000000002') $$,
  '42501', null, 'profesor: no apunta a quien no está matriculado ni es fundador');
select throws_ok($$ insert into public.attendance (class_session_id, student_id, recorded_by)
                    values ('7e570000-0000-4000-8000-000000000042', '7e570000-0000-4000-8000-000000000022', '7e570000-0000-4000-8000-000000000002') $$,
  '42501', null, 'profesor: no pasa lista en una sesión ajena');
select throws_ok($$ insert into public.attendance (class_session_id, student_id, recorded_by)
                    values ('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000021', '7e570000-0000-4000-8000-000000000003') $$,
  '42501', null, 'profesor: no firma la asistencia a nombre de otro profe');

select is(public.can_drop_in_session('7e570000-0000-4000-8000-000000000041', '7e570000-0000-4000-8000-000000000024'),
  true, 'profesor: can_drop_in_session responde en su sesión');
select is(public.can_drop_in_session('7e570000-0000-4000-8000-000000000042', '7e570000-0000-4000-8000-000000000024'),
  false, 'profesor: can_drop_in_session no responde en sesión ajena');

reset role;

-- Los candidatos se miran antes de apuntar a la fundadora: se deshace ese insert.
delete from public.attendance
 where class_session_id = '7e570000-0000-4000-8000-000000000041'
   and student_id = '7e570000-0000-4000-8000-000000000024';

select set_config('request.jwt.claims', '{"sub":"7e570000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

select is(array(select id from public.founding_drop_in_candidates('7e570000-0000-4000-8000-000000000041') where id::text like '7e570000-%'),
  array['7e570000-0000-4000-8000-000000000024']::uuid[], 'profesor: ve a la fundadora como candidata a clase suelta');

reset role;


-- ═══ ADMIN ═════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"7e570000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select is((select count(*) from public.modalidades where id::text like '7e570000-%'), 2::bigint, 'admin: ve también modalidades inactivas');
select is((select count(*) from public.eventos where id::text like '7e570000-%'), 2::bigint, 'admin: ve también eventos privados');
select is((select count(*) from public.students where id::text like '7e570000-%'), 4::bigint, 'admin: ve todos los alumnos');
select is((select count(*) from public.profiles where id::text like '7e570000-%'), 5::bigint, 'admin: ve todos los perfiles');
select is((select count(*) from public.leads where id = '7e570000-0000-4000-8000-000000000071'), 1::bigint, 'admin: ve los leads');
select is((select count(*) from public.whatsapp_events where id = '7e570000-0000-4000-8000-000000000072'), 1::bigint, 'admin: ve la cola de WhatsApp');
select is(public.is_admin(), true, 'admin: is_admin() es true');
select lives_ok($$ update public.profiles set role = 'profesor' where id = '7e570000-0000-4000-8000-000000000005' $$,
  'admin: puede cambiar el rol de otro usuario');

reset role;

select * from finish();
rollback;
