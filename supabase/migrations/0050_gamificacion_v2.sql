-- ════════════════════════════════════════════════════════════════════════════
-- 0050 · gamificación v2: reglas y catálogo nuevos, topes en la BD
--
-- Decisión de Pol (05-10-2026, ver MEMORY.md):
--   · Ya no se dan puntos por venir a clase ni a fiestas, ni por actuar. Las
--     reglas se DESACTIVAN, no se borran: hay apuntes que las referencian.
--   · Escala: 1 € de valor = 10 puntos ganados. Todo múltiplo de 5.
--   · Story y reel en Instagram suman, con tope mensual (4 y 2).
--   · Catálogo de 9 premios. Los de cuota (descuento y meses gratis) se pueden
--     canjear una vez cada 3 meses CADA UNO; el año gratis, una vez cada 12.
--
-- Los topes viven en triggers, no en la app (convención del repo): el admin da
-- los puntos a mano y el alumno canjea por REST con la clave publicable.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Columnas nuevas ─────────────────────────────────────────────────────────
-- Un solo juego de iconos para reglas y premios: el front pinta un SVG por
-- nombre (`components/alumno/IconoPuntos.tsx`). Lista cerrada para que un
-- texto libre no acabe en el `switch` de la interfaz.
alter table public.point_rules
  add column description   text,
  add column icon          text,
  add column monthly_limit integer;

alter table public.point_rules
  add constraint point_rules_desc_len check (description is null or char_length(description) <= 300),
  add constraint point_rules_icon_valid check (icon is null or icon in (
    'masterclass', 'congreso', 'amigo', 'perfil', 'story', 'reel', 'estrella',
    'invitado', 'descuento', 'entrada', 'mes', 'hoodie', 'pase', 'corona', 'regalo')),
  add constraint point_rules_monthly_limit_range check (monthly_limit is null or monthly_limit between 1 and 100);

comment on column public.point_rules.monthly_limit is
  'Máximo de apuntes positivos de esta regla por alumno y mes natural (por occurred_on). null = sin tope. Lo hace cumplir point_events_check_monthly_limit.';

alter table public.rewards
  add column icon         text,
  add column redeem_limit text;

alter table public.rewards
  add constraint rewards_icon_valid check (icon is null or icon in (
    'masterclass', 'congreso', 'amigo', 'perfil', 'story', 'reel', 'estrella',
    'invitado', 'descuento', 'entrada', 'mes', 'hoodie', 'pase', 'corona', 'regalo')),
  add constraint rewards_redeem_limit_valid check (redeem_limit is null or redeem_limit in ('trimestre', 'anual'));

comment on column public.rewards.redeem_limit is
  'Tope por alumno: trimestre = una vez cada 3 meses, anual = una vez cada 12 (ventana móvil desde el último canje no cancelado). null = sin tope.';

-- El año gratis cuesta 12.000 y el canje escribe un apunte de -12.000: el
-- rango antiguo (±10.000) lo rechazaría.
alter table public.point_events drop constraint point_events_points_range;
alter table public.point_events
  add constraint point_events_points_range check (points between -100000 and 100000 and points <> 0);


-- ── Tope mensual de apuntes por regla ───────────────────────────────────────
create or replace function public.point_events_check_monthly_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
begin
  if new.rule_code is null or new.points <= 0 then
    return new;
  end if;

  select monthly_limit into v_limit
  from public.point_rules
  where code = new.rule_code;

  if v_limit is null then
    return new;
  end if;

  -- Dos apuntes simultáneos al mismo alumno y regla no pueden colarse los dos.
  perform pg_advisory_xact_lock(hashtext('point_events_monthly:' || new.student_id::text || ':' || new.rule_code));

  select count(*) into v_count
  from public.point_events
  where student_id = new.student_id
    and rule_code = new.rule_code
    and points > 0
    and id <> new.id
    and date_trunc('month', occurred_on) = date_trunc('month', new.occurred_on);

  if v_count >= v_limit then
    raise exception 'point_events: límite mensual alcanzado (% de % este mes)', v_count, v_limit;
  end if;

  return new;
end;
$$;

revoke all on function public.point_events_check_monthly_limit() from public, anon, authenticated;

create trigger point_events_check_monthly_limit
  before insert or update of student_id, rule_code, points, occurred_on on public.point_events
  for each row execute function public.point_events_check_monthly_limit();


-- ── Canje: saldo, stock y ahora también tope por premio ─────────────────────
create or replace function public.reward_redemptions_apply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock   integer;
  v_limit   text;
  v_balance integer;
begin
  if tg_op = 'INSERT' then
    -- El FOR UPDATE serializa los canjes del mismo premio: el segundo espera
    -- al commit del primero y ya lo ve al contar.
    select stock, redeem_limit into v_stock, v_limit
    from public.rewards where id = new.reward_id for update;

    if v_stock is not null and v_stock < 1 then
      raise exception 'rewards: no quedan unidades de este premio';
    end if;

    if v_limit is not null and exists (
      select 1 from public.reward_redemptions
      where student_id = new.student_id
        and reward_id = new.reward_id
        and id <> new.id
        and status <> 'cancelado'
        and requested_at > now() - case v_limit when 'anual' then interval '12 months'
                                                else interval '3 months' end
    ) then
      raise exception 'reward_redemptions: límite de canje alcanzado (%)', v_limit;
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

revoke all on function public.reward_redemptions_apply() from public, anon, authenticated;


-- ── Reglas de puntos ────────────────────────────────────────────────────────
update public.point_rules
set active = false, orden = 90
where code in ('asistencia_clase', 'asistencia_fiesta', 'actuacion');

update public.point_rules set
  label = 'Masterclass, taller o intensivo', points = 200, icon = 'masterclass', orden = 1,
  description = 'Por cada masterclass, taller o intensivo de NEXUS al que vengas.'
where code = 'taller';

update public.point_rules set
  label = 'Congreso con full pass', points = 800, icon = 'congreso', orden = 2,
  description = 'Por cada congreso al que vayas con full pass.'
where code = 'congreso';

update public.point_rules set
  label = 'Un amigo se apunta', points = 200, icon = 'amigo', orden = 3,
  description = 'Cuando un amigo que traes se apunta y paga su primera cuota. Venir solo a probar no cuenta.'
where code = 'trae_amigo';

update public.point_rules set
  icon = 'perfil', orden = 6,
  description = 'Una sola vez, cuando tu perfil tiene foto, apellidos y cumpleaños.'
where code = 'perfil_completo';

insert into public.point_rules (code, label, points, source, active, orden, icon, monthly_limit, description) values
  ('story_instagram', 'Story en Instagram', 5, 'manual', true, 4, 'story', 4,
   'Sube una story de NEXUS desde una cuenta pública etiquetando a @nexusvng.'),
  ('reel_instagram', 'Reel en Instagram', 15, 'manual', true, 5, 'reel', 2,
   'Publica un reel de NEXUS desde una cuenta pública etiquetando a @nexusvng.')
on conflict (code) do nothing;


-- ── Catálogo de premios ─────────────────────────────────────────────────────
-- El premio de prueba deja de verse; no se borra porque tiene un canje.
update public.rewards set active = false where name like '[PRUEBA]%';

insert into public.rewards (name, description, cost_points, stock, active, orden, icon, redeem_limit)
select v.name, v.description, v.cost_points, null, true, v.orden, v.icon, v.redeem_limit
from (values
  ('Pase de invitado para un amigo',
   'Tu amigo prueba una clase gratis contigo. Te escribimos para elegir el día.',
   500, 1, 'invitado', null::text),
  ('Descuento de 20 € en tu cuota',
   'Se descuenta de tu próxima cuota.',
   1000, 2, 'descuento', 'trimestre'),
  ('Entrada a una masterclass',
   'Una entrada para la masterclass de NEXUS que elijas.',
   1000, 3, 'entrada', null),
  ('Mes gratis · 1 disciplina',
   'Un mes de una disciplina sin pagar cuota. Se aplica en tu próxima cuota.',
   1750, 4, 'mes', 'trimestre'),
  ('Hoodie NEXUS',
   'La sudadera oficial de NEXUS. Te escribimos para la talla y te la damos en clase.',
   2500, 5, 'hoodie', null),
  ('Mes gratis · 2 disciplinas',
   'Un mes de dos disciplinas sin pagar cuota. Se aplica en tu próxima cuota.',
   2750, 6, 'mes', 'trimestre'),
  ('Full pass de congreso',
   'El full pass de un congreso al que vaya NEXUS. Te escribimos para concretar cuál.',
   4000, 7, 'pase', null),
  ('Mes gratis · tarifa plana',
   'Un mes de tarifa plana, con todas las disciplinas, sin pagar cuota. Se aplica en tu próxima cuota.',
   4250, 8, 'mes', 'trimestre'),
  ('Un año de clases gratis',
   'Doce meses de tarifa plana sin pagar cuota. El premio de leyenda.',
   12000, 9, 'corona', 'anual')
) as v(name, description, cost_points, orden, icon, redeem_limit)
where not exists (select 1 from public.rewards r where r.name = v.name);


-- ── Hitos de WhatsApp a la nueva escala ─────────────────────────────────────
delete from public.point_milestones where points in (100, 500);
update public.point_milestones set label = '1.000 puntos' where points = 1000;
insert into public.point_milestones (points, label) values
  (1000, '1.000 puntos'),
  (5000, '5.000 puntos'),
  (12000, '12.000 puntos')
on conflict (points) do nothing;


-- ── Secciones nuevas del área del alumno en el registro de visitas ──────────
create or replace function public.registrar_visita_alumno(p_seccion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := public.current_student_id();
  v_dia     date := (now() at time zone 'Europe/Madrid')::date;
begin
  -- Lista blanca: la sección acaba en un correo, no se guarda texto libre.
  if v_student is null or p_seccion is null
     or p_seccion not in ('inicio', 'ranking', 'perfil', 'clase', 'premios', 'historial') then
    return;
  end if;

  insert into public.student_activity_days as a
    (student_id, day, first_seen_at, last_seen_at, views, sections)
  values (v_student, v_dia, now(), now(), 1, array[p_seccion])
  on conflict (student_id, day) do update
    set last_seen_at = now(),
        views        = a.views + 1,
        sections     = case when p_seccion = any (a.sections) then a.sections
                            else a.sections || p_seccion end;
end;
$$;

revoke all on function public.registrar_visita_alumno(text) from public, anon;
grant execute on function public.registrar_visita_alumno(text) to authenticated;
