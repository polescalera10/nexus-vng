-- ════════════════════════════════════════════════════════════════════════════
-- 0029 · conversión lead → alumno y automatizaciones
--
--   1. `leads.student_id` — un lead que se acepta en clase deja de ser un
--      formulario suelto y apunta a su ficha de alumno. Sin duplicar datos:
--      el lead se conserva tal cual (histórico y trazabilidad de campaña).
--   2. Idempotencia de la felicitación de cumpleaños: el cron puede correr
--      varias veces al día (reintentos de Vercel) y no debe encolar dos
--      mensajes al mismo alumno el mismo año.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists student_id uuid references public.students (id) on delete set null,
  add column if not exists converted_at timestamptz;

create index if not exists leads_student_idx on public.leads (student_id);

comment on column public.leads.student_id is
  'Ficha de alumno creada a partir de este lead. Null = todavía sin convertir.';

-- Un alumno no puede provenir de dos leads a la vez.
create unique index if not exists leads_student_unique
  on public.leads (student_id) where student_id is not null;

-- ── Automatizaciones: una felicitación por alumno y año ──────────────────────
create unique index if not exists whatsapp_events_cumpleanos_unique
  on public.whatsapp_events (student_id, ((payload ->> 'anio')))
  where type = 'cumpleanos';

-- Un aviso por hito y alumno (el trigger de 0027 solo dispara al cruzarlo,
-- pero un rebobinado de puntos podría repetirlo).
create unique index if not exists whatsapp_events_hito_unique
  on public.whatsapp_events (student_id, ((payload ->> 'hito')))
  where type = 'puntos_hito';

-- El trigger de hitos debe tolerar el índice de arriba: si el aviso ya existe
-- no puede reventar el INSERT de puntos que lo disparó.
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
    )
    on conflict (student_id, ((payload ->> 'hito'))) where type = 'puntos_hito'
    do nothing;
  end loop;

  return new;
end;
$$;
