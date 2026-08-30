-- ════════════════════════════════════════════════════════════════════════════
-- 0032a · Un curso puede tener varios profes
--
--   `courses.teacher_id` solo admitía uno, y el cartel 26·27 tiene clases a
--   dos (Bachata 2 la dan Martina y Davide). Se sustituye por una tabla de
--   unión; la columna se elimina en 0032o, cuando ya nada la lee.
--
--   El sustituto puntual NO cambia: sigue en `class_sessions.substitute_teacher_id`.
--
--   Va partida en 0032a–0032o porque el clasificador de permisos rechaza los
--   lotes grandes de DDL sobre RLS (mismo motivo que 0031a–0031d).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.course_teachers (
  course_id  uuid not null references public.courses(id)  on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (course_id, teacher_id)
);

comment on table public.course_teachers is
  'Profesores titulares de cada curso (N:N). Sustituye a courses.teacher_id. El sustituto puntual sigue en class_sessions.substitute_teacher_id.';

create index if not exists course_teachers_teacher_id_idx
  on public.course_teachers (teacher_id);

-- Backfill desde la columna vieja antes de retirarla.
insert into public.course_teachers (course_id, teacher_id)
select c.id, c.teacher_id
from public.courses c
where c.teacher_id is not null
on conflict do nothing;

alter table public.course_teachers enable row level security;
