-- ════════════════════════════════════════════════════════════════════════════
-- 0027 · gamificación (puntos y premios)
--
-- Modelo:
--   · `point_rules`      catálogo editable de motivos que dan puntos
--                        (asistir a clase, ir a una fiesta, un congreso…).
--   · `point_events`     LIBRO MAYOR. Única fuente de verdad del saldo: cada
--                        fila suma o resta. Nunca se guarda un saldo
--                        materializado que pueda desincronizarse.
--   · `rewards`          catálogo de premios canjeables.
--   · `reward_redemptions`  solicitud de canje. Un trigger escribe el apunte
--                        negativo en `point_events` y valida saldo y stock,
--                        para que la regla se cumpla también por REST.
--   · `point_milestones` hitos que disparan una felicitación por WhatsApp.
--
-- `student_point_balances` es una vista `security_invoker`: hereda la RLS de
-- `point_events`, así que el alumno solo ve su propio saldo.
-- ════════════════════════════════════════════════════════════════════════════

-- Tipos de mensaje nuevos para las automatizaciones (0018 definió el enum).
alter type public.whatsapp_event_type add value if not exists 'cumpleanos';
alter type public.whatsapp_event_type add value if not exists 'puntos_hito';
alter type public.whatsapp_event_type add value if not exists 'premio_canjeado';

create type public.point_source as enum (
  'asistencia',   -- pasar lista en una sesión
  'evento',       -- fiesta, congreso, intensivo…
  'manual',       -- alta a dedo del admin
  'canje',        -- descuento por canjear un premio
  'ajuste'        -- corrección
);

create type public.redemption_status as enum ('solicitado', 'entregado', 'cancelado');

-- ── point_rules ──────────────────────────────────────────────────────────────
create table public.point_rules (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  label      text not null,
  points     integer not null,
  source     public.point_source not null default 'manual',
  active     boolean not null default true,
  orden      integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint point_rules_code_format check (code ~ '^[a-z0-9]+(_[a-z0-9]+)*$' and char_length(code) between 2 and 40),
  constraint point_rules_label_len   check (char_length(label) between 2 and 80),
  constraint point_rules_points_range check (points between -1000 and 1000)
);

create index point_rules_active_idx on public.point_rules (active, orden);

create trigger point_rules_set_updated_at
  before update on public.point_rules
  for each row execute function public.set_updated_at();

-- ── point_events (libro mayor) ───────────────────────────────────────────────
create table public.point_events (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  points      integer not null,
  concept     text not null,
  source      public.point_source not null default 'manual',
  rule_code   text references public.point_rules (code) on delete set null,
  /** Fila que originó el apunte (class_session, evento, canje…). Sin FK: el
      origen cambia de tabla según `source`. */
  source_id   uuid,
  occurred_on date not null default current_date,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint point_events_points_range check (points between -10000 and 10000 and points <> 0),
  constraint point_events_concept_len  check (char_length(concept) between 2 and 160)
);

create index point_events_student_idx on public.point_events (student_id, occurred_on desc);
create index point_events_source_idx  on public.point_events (source, source_id);

-- Idempotencia: un mismo origen no puede puntuar dos veces al mismo alumno.
create unique index point_events_source_unique
  on public.point_events (student_id, source, source_id)
  where source_id is not null;

-- ── rewards ──────────────────────────────────────────────────────────────────
create table public.rewards (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  cost_points integer not null,
  /** null = sin límite de unidades. */
  stock       integer,
  active      boolean not null default true,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint rewards_name_len    check (char_length(name) between 2 and 80),
  constraint rewards_desc_len    check (description is null or char_length(description) <= 400),
  constraint rewards_cost_range  check (cost_points between 1 and 100000),
  constraint rewards_stock_range check (stock is null or stock >= 0)
);

create index rewards_active_idx on public.rewards (active, orden);

create trigger rewards_set_updated_at
  before update on public.rewards
  for each row execute function public.set_updated_at();

-- ── reward_redemptions ───────────────────────────────────────────────────────
create table public.reward_redemptions (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id) on delete cascade,
  reward_id    uuid not null references public.rewards (id) on delete restrict,
  /** Coste congelado: subir el precio del premio no reescribe el histórico. */
  cost_points  integer not null,
  status       public.redemption_status not null default 'solicitado',
  notes        text,
  requested_at timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references public.profiles (id) on delete set null,
  constraint reward_redemptions_cost_range check (cost_points between 1 and 100000),
  constraint reward_redemptions_notes_len  check (notes is null or char_length(notes) <= 500)
);

create index reward_redemptions_student_idx on public.reward_redemptions (student_id, requested_at desc);
create index reward_redemptions_status_idx  on public.reward_redemptions (status, requested_at desc);

-- ── point_milestones ─────────────────────────────────────────────────────────
create table public.point_milestones (
  id         uuid primary key default gen_random_uuid(),
  points     integer not null unique,
  label      text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  constraint point_milestones_points_range check (points between 1 and 100000),
  constraint point_milestones_label_len    check (char_length(label) between 2 and 80)
);

-- ── Saldo ────────────────────────────────────────────────────────────────────
create view public.student_point_balances
with (security_invoker = on) as
  select student_id, coalesce(sum(points), 0)::integer as balance
  from public.point_events
  group by student_id;

comment on view public.student_point_balances is
  'Saldo por alumno = suma del libro mayor. security_invoker: hereda la RLS de point_events.';

-- Saldo de un alumno concreto, sin depender de la vista (para triggers y RLS).
create or replace function public.student_point_balance(p_student_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(points), 0)::integer
  from public.point_events
  where student_id = p_student_id;
$$;

revoke execute on function public.student_point_balance(uuid) from anon;

-- ── Canje: apunte negativo + validación de saldo y stock ─────────────────────
create or replace function public.reward_redemptions_apply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock   integer;
  v_balance integer;
begin
  if tg_op = 'INSERT' then
    -- Se bloquea la fila del premio para que dos canjes simultáneos no se
    -- lleven la última unidad.
    select stock into v_stock from public.rewards where id = new.reward_id for update;

    if v_stock is not null and v_stock < 1 then
      raise exception 'rewards: no quedan unidades de este premio';
    end if;

    v_balance := public.student_point_balance(new.student_id);
    if v_balance < new.cost_points then
      raise exception 'point_events: saldo insuficiente (% puntos, hacen falta %)',
        v_balance, new.cost_points;
    end if;

    if v_stock is not null then
      update public.rewards set stock = stock - 1 where id = new.reward_id;
    end if;

    insert into public.point_events (student_id, points, concept, source, source_id, created_by)
    select new.student_id,
           -new.cost_points,
           'Canje: ' || r.name,
           'canje',
           new.id,
           auth.uid()
    from public.rewards r
    where r.id = new.reward_id;

    return new;
  end if;

  -- Cancelar devuelve puntos y unidad; volver a activarlo no se contempla.
  if tg_op = 'UPDATE'
     and new.status = 'cancelado'
     and old.status <> 'cancelado'
  then
    delete from public.point_events
    where source = 'canje' and source_id = new.id;

    update public.rewards
    set stock = stock + 1
    where id = new.reward_id and stock is not null;
  end if;

  return new;
end;
$$;

create trigger reward_redemptions_apply
  after insert or update on public.reward_redemptions
  for each row execute function public.reward_redemptions_apply();

-- ── Hitos de puntos → cola de WhatsApp ───────────────────────────────────────
create or replace function public.point_events_check_milestones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before integer;
  v_after  integer;
  v_hito   record;
begin
  if new.points <= 0 then
    return new;
  end if;

  v_after  := public.student_point_balance(new.student_id);
  v_before := v_after - new.points;

  for v_hito in
    select points, label from public.point_milestones
    where active and points > v_before and points <= v_after
  loop
    insert into public.whatsapp_events (student_id, type, payload)
    values (
      new.student_id,
      'puntos_hito',
      jsonb_build_object('hito', v_hito.points, 'label', v_hito.label, 'saldo', v_after)
    );
  end loop;

  return new;
end;
$$;

create trigger point_events_check_milestones
  after insert on public.point_events
  for each row execute function public.point_events_check_milestones();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.point_rules        enable row level security;
alter table public.point_events       enable row level security;
alter table public.rewards            enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.point_milestones   enable row level security;

-- Catálogos: los lee todo el equipo y el alumno con login; los gestiona admin.
create policy "point_rules: lectura autenticados"
  on public.point_rules for select to authenticated using (true);
create policy "point_rules: gestión admin"
  on public.point_rules for all using (public.is_admin()) with check (public.is_admin());

create policy "rewards: lectura autenticados"
  on public.rewards for select to authenticated using (true);
create policy "rewards: gestión admin"
  on public.rewards for all using (public.is_admin()) with check (public.is_admin());

create policy "point_milestones: lectura autenticados"
  on public.point_milestones for select to authenticated using (true);
create policy "point_milestones: gestión admin"
  on public.point_milestones for all using (public.is_admin()) with check (public.is_admin());

-- Libro mayor: el alumno ve el suyo; el profesor, el de sus alumnos.
create policy "point_events: alumno lee los suyos"
  on public.point_events for select to authenticated
  using (student_id = public.current_student_id());

create policy "point_events: profesor lee los de sus alumnos"
  on public.point_events for select to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      join public.courses c on c.id = e.course_id
      join public.teachers t on t.id = c.teacher_id
      where e.student_id = point_events.student_id and t.profile_id = auth.uid()
    )
  );

create policy "point_events: gestión admin"
  on public.point_events for all using (public.is_admin()) with check (public.is_admin());

-- Canjes: el alumno ve y solicita los suyos; resolverlos es cosa del admin.
create policy "reward_redemptions: alumno lee los suyos"
  on public.reward_redemptions for select to authenticated
  using (student_id = public.current_student_id());

create policy "reward_redemptions: alumno solicita el suyo"
  on public.reward_redemptions for insert to authenticated
  with check (
    student_id = public.current_student_id()
    and status = 'solicitado'
    and resolved_at is null
    and resolved_by is null
    and exists (
      select 1 from public.rewards r
      where r.id = reward_redemptions.reward_id
        and r.active
        and r.cost_points = reward_redemptions.cost_points
    )
  );

create policy "reward_redemptions: gestión admin"
  on public.reward_redemptions for all using (public.is_admin()) with check (public.is_admin());

-- ── Semilla del catálogo (editable después desde el panel) ───────────────────
insert into public.point_rules (code, label, points, source, orden) values
  ('asistencia_clase',  'Asistir a una clase',        10, 'asistencia', 1),
  ('asistencia_fiesta', 'Asistir a una fiesta',       25, 'evento',     2),
  ('congreso',          'Asistir a un congreso',      75, 'evento',     3),
  ('taller',            'Asistir a un taller o intensivo', 30, 'evento', 4),
  ('trae_amigo',        'Traer a un amigo a probar',  50, 'manual',     5),
  ('actuacion',         'Actuar con la compañía',    100, 'evento',     6)
on conflict (code) do nothing;

insert into public.point_milestones (points, label) values
  (100,  'Primeros 100 puntos'),
  (500,  '500 puntos'),
  (1000, '1.000 puntos')
on conflict (points) do nothing;
