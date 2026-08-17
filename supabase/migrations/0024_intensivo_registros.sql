-- ════════════════════════════════════════════════════════════════════════════
-- 0024 · intensivo_registros — asistencia y cobro de los intensivos
--
-- Los intensivos son clases sueltas de pago en puerta (20 € por persona y
-- sesión), así que NO reutilizan courses/class_sessions/enrollments: no hay
-- matrícula ni ciclo, solo "quién vino a esta sesión y si pagó".
--
-- La lista de cada sesión se compone en JS: leads cuyo `intereses` contiene el
-- slug de la sesión (src/content/intensivos.ts) + los que se apuntan en puerta.
-- Aquí solo viven las MARCAS, no el catálogo:
--   · lead_id no nulo  → persona que se apuntó por el formulario de la web.
--   · lead_id nulo     → alta en puerta (nombre y teléfono tecleados a mano).
--
-- `sesion` es el slug de texto libre del contenido (p. ej. intensivo-salsa-lun17).
-- Sin FK a propósito: el catálogo de sesiones vive en el repo, no en la BD, y
-- un cambio de cartel no debe borrar la caja de una noche ya cobrada.
--
-- `importe` se guarda por fila (no se calcula) para que una futura subida de
-- precio no reescriba la recaudación histórica.
-- ════════════════════════════════════════════════════════════════════════════

create table public.intensivo_registros (
  id uuid primary key default gen_random_uuid(),
  sesion text not null check (char_length(sesion) between 3 and 80),
  lead_id uuid references public.leads(id) on delete set null,
  nombre text not null check (char_length(nombre) between 2 and 120),
  telefono text check (telefono is null or char_length(telefono) between 6 and 20),
  email text check (email is null or char_length(email) <= 254),
  asistio boolean not null default false,
  pagado boolean not null default false,
  importe numeric(6, 2) not null default 20 check (importe >= 0 and importe <= 999),
  metodo_pago text check (
    metodo_pago is null or metodo_pago in ('efectivo', 'bizum', 'tarjeta', 'otro')
  ),
  nota text check (nota is null or char_length(nota) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un lead no puede tener dos filas en la misma sesión. Los NULL son
  -- distintos entre sí en Postgres, así que las altas en puerta (lead_id null)
  -- no chocan nunca. Índice NO parcial: hace falta para el upsert por
  -- ON CONFLICT (sesion, lead_id) desde PostgREST.
  constraint intensivo_registros_sesion_lead_unico unique (sesion, lead_id)
);

create index intensivo_registros_sesion_idx on public.intensivo_registros (sesion);

create trigger intensivo_registros_set_updated_at
  before update on public.intensivo_registros
  for each row execute function public.set_updated_at();

comment on table public.intensivo_registros is
  'Asistencia y cobro por sesión de intensivo. lead_id nulo = alta en puerta.';
comment on column public.intensivo_registros.sesion is
  'Slug de la sesión en src/content/intensivos.ts (p. ej. intensivo-salsa-lun17).';
comment on column public.intensivo_registros.importe is
  'Importe cobrado en euros. Se guarda por fila para no reescribir el histórico.';

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Datos personales de asistentes: solo personal de la escuela.
-- admin → todo. profesor → pasar lista y cobrar (sin borrar).
alter table public.intensivo_registros enable row level security;

create policy "intensivo_registros: lectura staff"
  on public.intensivo_registros for select
  using (public.current_role() in ('admin', 'profesor'));

create policy "intensivo_registros: alta staff"
  on public.intensivo_registros for insert
  with check (public.current_role() in ('admin', 'profesor'));

create policy "intensivo_registros: actualización staff"
  on public.intensivo_registros for update
  using (public.current_role() in ('admin', 'profesor'))
  with check (public.current_role() in ('admin', 'profesor'));

create policy "intensivo_registros: borrado admin"
  on public.intensivo_registros for delete
  using (public.is_admin());
