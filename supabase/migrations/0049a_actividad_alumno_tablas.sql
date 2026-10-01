-- ════════════════════════════════════════════════════════════════════════════
-- 0049a · actividad del alumno en su área: tablas
--
-- Para el informe diario de Pol (lo manda /api/cron/informe-alumnos a las 9).
-- Antes de esto la app no sabía quién entraba: `auth.users.last_sign_in_at`
-- solo cambia al canjear un enlace, y la sesión dura semanas, así que un
-- alumno que entra cada día parecía no haber vuelto desde el primero.
--
-- Minimización (RGPD): se guarda lo justo para saber si el área se usa.
--   · Visitas: UNA fila por alumno y día (hora de la primera y la última,
--     cuántas páginas, qué secciones). Ni IP, ni navegador, ni ruta exacta.
--   · Cambios de perfil: QUÉ campo tocó y si lo dejó relleno o vacío. El valor
--     nuevo no se copia aquí: ya está en `students`.
--   · Vídeos: qué vídeo del diario abrió y cuántas veces ese día.
-- Las tres se borran a los 12 meses (tarea de 0049d) y lo cuenta /privacidad.
--
-- Nadie escribe en ellas directamente: las visitas y los vídeos entran por
-- RPC SECURITY DEFINER (0049b) que resuelven el alumno desde la sesión, y los
-- cambios de perfil, por trigger (0049c). Solo el admin las lee.
-- ════════════════════════════════════════════════════════════════════════════

create table public.student_activity_days (
  student_id    uuid not null references public.students (id) on delete cascade,
  -- Día de Vilanova, no de UTC: entre las 00:00 y las 02:00 no son el mismo.
  day           date not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  views         integer not null default 1 check (views > 0),
  sections      text[] not null default '{}',
  primary key (student_id, day)
);

create index student_activity_days_day_idx on public.student_activity_days (day);

comment on table public.student_activity_days is
  'Una fila por alumno y día con visita a su área privada. Se borra a los 12 meses.';

create table public.student_profile_changes (
  id         bigint generated always as identity primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  field      text not null check (field in (
               'full_name', 'phone', 'birthday', 'dance_role',
               'avatar_path', 'show_in_leaderboard')),
  -- true = el campo quedó con valor (o, en show_in_leaderboard, que sale en
  -- el ranking); false = lo vació o se salió.
  filled     boolean not null,
  changed_at timestamptz not null default now()
);

create index student_profile_changes_student_idx on public.student_profile_changes (student_id);
create index student_profile_changes_changed_at_idx on public.student_profile_changes (changed_at);

comment on table public.student_profile_changes is
  'Qué campo de su perfil cambió el propio alumno, sin el valor. Se borra a los 12 meses.';

create table public.student_video_plays (
  student_id       uuid not null references public.students (id) on delete cascade,
  session_video_id uuid not null references public.session_videos (id) on delete cascade,
  played_on        date not null,
  first_played_at  timestamptz not null default now(),
  plays            integer not null default 1 check (plays > 0),
  primary key (student_id, session_video_id, played_on)
);

create index student_video_plays_video_idx on public.student_video_plays (session_video_id);
create index student_video_plays_played_on_idx on public.student_video_plays (played_on);

comment on table public.student_video_plays is
  'Vídeos del diario que el alumno abrió (clic en la fachada), por día. Se borra a los 12 meses.';

-- Registro de informes enviados: evita mandar dos veces el del mismo día si
-- el disparador se reintenta, y deja rastro de cuándo salió cada uno.
create table public.informes_enviados (
  tipo       text not null check (tipo in ('alumnos_diario')),
  fecha      date not null,
  enviado_at timestamptz not null default now(),
  proveedor_id text,
  primary key (tipo, fecha)
);

-- Resumen por alumno para el informe: primer y último día con visita y días
-- distintos. Sin esto, saber quién lleva semanas sin entrar obligaría a bajar
-- todas las filas del año (PostgREST corta en 1.000).
create view public.student_activity_summary
with (security_invoker = true) as
select student_id,
       min(day)  as first_day,
       max(day)  as last_day,
       count(*)::integer as days
from public.student_activity_days
group by student_id;

alter table public.student_activity_days   enable row level security;
alter table public.student_profile_changes enable row level security;
alter table public.student_video_plays     enable row level security;
alter table public.informes_enviados       enable row level security;

-- Una política por tabla y acción (0047). Solo lectura del admin: las
-- escrituras van por funciones SECURITY DEFINER o por service role.
create policy "student_activity_days: lectura" on public.student_activity_days
  for select to authenticated using ((select public.is_admin()));

create policy "student_profile_changes: lectura" on public.student_profile_changes
  for select to authenticated using ((select public.is_admin()));

create policy "student_video_plays: lectura" on public.student_video_plays
  for select to authenticated using ((select public.is_admin()));

create policy "informes_enviados: lectura" on public.informes_enviados
  for select to authenticated using ((select public.is_admin()));

revoke all on public.student_activity_summary from anon;
