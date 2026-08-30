-- ════════════════════════════════════════════════════════════════════════════
-- SEED · datos base (modalidades + niveles)
--   Las modalidades alimentan /clases/[modalidad] vía generateStaticParams.
-- ════════════════════════════════════════════════════════════════════════════

-- El catálogo real (niveles + modalidades, incluidas Lady Style Salsa/Bachata,
-- Sexy Style y los grupos de compañía) se aplica en la migración
-- `0025_catalogo_modalidades.sql`, que es idempotente. Aquí ya no se duplica:
-- tenerlo en dos sitios garantizaba que tarde o temprano divergieran.

-- ════════════════════════════════════════════════════════════════════════════
-- SEED · datos de prueba del panel interno (solo desarrollo local)
--   UUIDs fijos para idempotencia. En producción no aplicar este bloque
--   o vaciarlo antes del primer deploy.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.teachers (id, profile_id, full_name, email, phone, disciplines, weekly_availability, active) values
  ('a0000000-0000-4000-8000-000000000001', null, 'Yunaisy Pérez', 'yunaisy@example.com', '+34600000001', '{salsa-cubana,reparto}',
   '{"tue":[{"start":"18:00","end":"22:00"}],"thu":[{"start":"18:00","end":"22:00"}]}', true),
  ('a0000000-0000-4000-8000-000000000002', null, 'Marc Soler', 'marc@example.com', '+34600000002', '{bachata,lady-style-bachata}',
   '{"mon":[{"start":"19:00","end":"22:00"}],"wed":[{"start":"19:00","end":"22:00"}]}', true)
on conflict (id) do nothing;

insert into public.students (id, full_name, phone, email, birthday, dance_role, nivel_id, payment_status, is_founding_member, active) values
  ('b0000000-0000-4000-8000-000000000001', 'Laura Gómez',   '+34611000001', 'laura@example.com', '1994-03-12', 'follower', (select id from public.niveles where nombre = 'Empiezo'),      'al_dia',    true,  true),
  ('b0000000-0000-4000-8000-000000000002', 'Dani Ferrer',   '+34611000002', 'dani@example.com',  '1988-07-30', 'leader',   (select id from public.niveles where nombre = 'Empiezo'),      'pendiente', false, true),
  ('b0000000-0000-4000-8000-000000000003', 'Anna Puig',     '+34611000003', 'anna@example.com',  null,         'follower', (select id from public.niveles where nombre = 'Intermedio'),   'al_dia',    false, true),
  ('b0000000-0000-4000-8000-000000000004', 'Jordi Vidal',   '+34611000004', 'jordi@example.com', null,         'leader',   (select id from public.niveles where nombre = 'Intermedio'),   'al_dia',    false, true),
  ('b0000000-0000-4000-8000-000000000005', 'Marta Roca',    '+34611000005', 'marta@example.com', null,         'both',     (select id from public.niveles where nombre = 'Nunca he bailado'), 'pendiente', false, true),
  ('b0000000-0000-4000-8000-000000000006', 'Pau Serra',     '+34611000006', 'pau@example.com',   null,         'leader',   (select id from public.niveles where nombre = 'Empiezo'),      'al_dia',    false, false)
on conflict (id) do nothing;

-- Pareja vinculada (ambos lados).
update public.students set partner_id = 'b0000000-0000-4000-8000-000000000002' where id = 'b0000000-0000-4000-8000-000000000001' and partner_id is null;
update public.students set partner_id = 'b0000000-0000-4000-8000-000000000001' where id = 'b0000000-0000-4000-8000-000000000002' and partner_id is null;

insert into public.courses (id, name, modalidad_id, nivel_id, weekday, start_time, duration_min, capacity_leaders, capacity_followers, cycle_type, start_date, active) values
  ('c0000000-0000-4000-8000-000000000001', 'Salsa Empiezo — Martes 20h',
   (select id from public.modalidades where slug = 'salsa-cubana'),
   (select id from public.niveles where nombre = 'Empiezo'),
   2, '20:00', 60, 8, 8, 'curso', date_trunc('month', current_date)::date, true),
  ('c0000000-0000-4000-8000-000000000002', 'Bachata Intermedio — Miércoles 21h',
   (select id from public.modalidades where slug = 'bachata'),
   (select id from public.niveles where nombre = 'Intermedio'),
   3, '21:00', 60, 6, 6, 'curso', date_trunc('month', current_date)::date, true)
on conflict (id) do nothing;

-- Los profes van en `course_teachers` desde 0032. El segundo curso lo dan dos.
insert into public.course_teachers (course_id, teacher_id) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into public.enrollments (id, student_id, course_id, role_in_course, status) values
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'follower', 'activa'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'leader',   'activa'),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000001', 'follower', 'activa'),
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', 'follower', 'activa'),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'leader',   'activa')
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════════════
-- SEED · gamificación y eventos de prueba (solo desarrollo local)
--   Las reglas y los hitos ya vienen en la migración 0027; aquí solo hay
--   premios y algún apunte para que el panel no se vea vacío en local.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.rewards (id, name, description, cost_points, stock, active, orden) values
  ('e0000000-0000-4000-8000-000000000001', 'Camiseta NEXUS', 'Camiseta de la escuela, talla a elegir.', 300, 20, true, 1),
  ('e0000000-0000-4000-8000-000000000002', 'Entrada a la fiesta', 'Una entrada para la próxima fiesta social.', 150, null, true, 2),
  ('e0000000-0000-4000-8000-000000000003', 'Clase particular (30 min)', 'Media hora con el profe que elijas.', 800, 4, true, 3)
on conflict (id) do nothing;

insert into public.point_events (id, student_id, points, concept, source, rule_code, occurred_on) values
  ('f0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 10, 'Asistir a una clase', 'asistencia', 'asistencia_clase', current_date - 7),
  ('f0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 25, 'Fiesta social', 'evento', 'asistencia_fiesta', current_date - 3),
  ('f0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 10, 'Asistir a una clase', 'asistencia', 'asistencia_clase', current_date - 2)
on conflict (id) do nothing;

insert into public.eventos (id, titulo, slug, tipo, fecha, fecha_fin, ubicacion, precio, capacidad, puntos, publico, descripcion) values
  ('a1000000-0000-4000-8000-000000000001', 'Fiesta social de prueba', 'fiesta-social-de-prueba', 'social',
   now() + interval '14 days', now() + interval '14 days 4 hours',
   'Gimnasio Aranha (Vilanova i la Geltrú)', 5, 120, 25, false,
   'Evento de PRUEBA para desarrollo local. No publicar.')
on conflict (id) do nothing;
