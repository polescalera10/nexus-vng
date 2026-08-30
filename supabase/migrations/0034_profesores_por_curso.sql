-- ════════════════════════════════════════════════════════════════════════════
-- 0034 · Reparto de profesores del curso 26·27
--
--   Las clases de lunes ya venían asignadas del backfill de 0032a (Davide y
--   Martina). Aquí entran las once restantes, según el reparto que dio Pol el
--   30-08-2026.
--
--   Los cursos se identifican por nombre + día + hora, nunca por nombre solo:
--   hay dos "Bachata 1" en el horario (lunes 18:30 y miércoles 21:30) y el
--   nombre a secas cogería el que no es.
--
--   `on conflict do nothing`: la tabla es idempotente por clave primaria, así
--   que reaplicar no duplica ni pisa una asignación posterior.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.course_teachers (course_id, teacher_id)
select c.id, t.id
from (values
  ('Heels',      2, '20:30'::time, 'Yuri'),
  ('Sexy Style', 2, '21:30'::time, 'Yuri'),

  ('Reggaetón',  3, '18:30'::time, 'Ana Aylén'),
  ('Reparto',    3, '19:30'::time, 'Ana Aylén'),
  ('Salsa 1',    3, '20:30'::time, 'Ana Aylén'),
  ('Salsa 1',    3, '20:30'::time, 'Pol Escalera'),
  ('Bachata 1',  3, '21:30'::time, 'Ana Aylén'),
  ('Bachata 1',  3, '21:30'::time, 'Pol Escalera'),

  ('Salsa 0',    4, '20:30'::time, 'Martina'),
  ('Salsa 0',    4, '20:30'::time, 'Pol Escalera'),
  ('Bachata 0',  4, '21:30'::time, 'Martina'),
  ('Bachata 0',  4, '21:30'::time, 'Pol Escalera'),

  ('Lady Salsa', 5, '19:30'::time, 'Ana Aylén'),
  ('Salsa 2',    5, '20:30'::time, 'Ana Aylén'),
  ('Salsa 2',    5, '20:30'::time, 'Pol Escalera'),
  ('Cía Salsa',  5, '21:30'::time, 'Ana Aylén'),
  ('Cía Salsa',  5, '21:30'::time, 'Pol Escalera')
) as reparto(curso, weekday, start_time, profe)
join public.courses  c on c.name = reparto.curso
                      and c.weekday = reparto.weekday
                      and c.start_time = reparto.start_time
join public.teachers t on t.full_name = reparto.profe
on conflict do nothing;
