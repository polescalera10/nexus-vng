-- ════════════════════════════════════════════════════════════════════════════
-- 0013 · clases → courses
--   La tabla `clases` (sin uso en la app hasta ahora) se convierte en el
--   `courses` del panel interno: aforo separado por rol de baile
--   (leaders/followers), ciclo (curso cerrado vs clase suelta) y profesor
--   vía la nueva tabla `teachers` en lugar de `profiles`.
--   `modalidad_id` y `nivel_id` se conservan tal cual (catálogos vivos).
--   Convención heredada: weekday 1=Lun … 7=Dom (check existente se mantiene).
-- ════════════════════════════════════════════════════════════════════════════

-- Las políticas de 0008 referencian profesor_id: fuera antes de tocar columnas.
-- (0019 crea las nuevas políticas del panel.)
drop policy if exists "clases: lectura autenticados" on public.clases;
drop policy if exists "clases: profesor gestiona las suyas" on public.clases;

-- Las de `inscripciones` y `asistencia` también leen clases.profesor_id (un
-- EXISTS contra la tabla), así que Postgres las cuenta como dependientes de la
-- columna y bloquea el DROP COLUMN. Se retiran aquí aunque 0015/0016 vuelvan a
-- intentarlo (son `drop ... if exists`); sus sustitutas llegan en 0019.
drop policy if exists "inscripciones: alumno ve lo suyo / profesor de su clase / admin" on public.inscripciones;
drop policy if exists "inscripciones: alumno gestiona la suya" on public.inscripciones;
drop policy if exists "asistencia: alumno ve la suya / profesor de su clase / admin" on public.asistencia;
drop policy if exists "asistencia: profesor de la clase registra / admin" on public.asistencia;

alter table public.clases rename to courses;
alter table public.courses rename column dia_semana to weekday;
alter table public.courses rename column hora to start_time;

alter table public.courses add column name text not null default '';
alter table public.courses add column teacher_id uuid references public.teachers (id) on delete set null;

-- Backfill teacher_id desde el antiguo FK a profiles.
update public.courses c
set teacher_id = t.id
from public.teachers t
where t.profile_id = c.profesor_id;

alter table public.courses drop column profesor_id;
alter table public.courses drop column plazas_total;

alter table public.courses add column duration_min int not null default 60 check (duration_min > 0);
alter table public.courses add column capacity_leaders int not null default 0 check (capacity_leaders >= 0);
alter table public.courses add column capacity_followers int not null default 0 check (capacity_followers >= 0);

create type public.cycle_type as enum ('curso', 'suelta');
alter table public.courses add column cycle_type public.cycle_type not null default 'suelta';
alter table public.courses add column start_date date;
alter table public.courses add column end_date date;
alter table public.courses add column active boolean not null default true;

-- Índices y trigger renombrados a la nueva identidad.
alter index clases_modalidad_idx rename to courses_modalidad_idx;
drop index if exists clases_profesor_idx;
create index courses_teacher_idx on public.courses (teacher_id);
create index courses_active_idx on public.courses (active);
alter trigger clases_set_updated_at on public.courses rename to courses_set_updated_at;
