-- ════════════════════════════════════════════════════════════════════════════
-- 0028 · eventos gestionables desde el panel
--
-- `eventos` existía desde 0006 pero nadie la escribía: la web leía la tabla y,
-- al estar vacía, caía siempre al fallback estático de `queries/eventos.ts`.
-- No había ninguna pantalla para crear un evento. Esta migración la deja lista
-- para el CRUD de admin y para lo que la ficha pública necesita enseñar.
--
--   · `slug` pasa a obligatorio y único (es la URL /eventos/[slug]).
--   · Datos que la ficha ya pintaba a mano: fecha de fin, ubicación, precio,
--     imagen de portada, aforo y enlace de inscripción.
--   · `puntos` conecta el evento con la gamificación (0027).
--   · Tipos nuevos: congreso, taller, intensivo.
-- ════════════════════════════════════════════════════════════════════════════

alter type public.evento_tipo add value if not exists 'congreso';
alter type public.evento_tipo add value if not exists 'taller';
alter type public.evento_tipo add value if not exists 'intensivo';

-- Backfill defensivo antes del NOT NULL (en producción la tabla está vacía).
update public.eventos
set slug = regexp_replace(lower(trim(titulo)), '[^a-z0-9]+', '-', 'g')
where slug is null or char_length(trim(slug)) = 0;

alter table public.eventos alter column slug set not null;

create unique index if not exists eventos_slug_key on public.eventos (slug);
create index if not exists eventos_fecha_idx on public.eventos (fecha desc);

alter table public.eventos
  add column if not exists fecha_fin       timestamptz,
  add column if not exists ubicacion       text,
  add column if not exists precio          numeric(8, 2),
  add column if not exists cover_image_url text,
  add column if not exists capacidad       integer,
  add column if not exists cta_url         text,
  add column if not exists puntos          integer not null default 0,
  add column if not exists created_by      uuid references public.profiles (id) on delete set null;

comment on column public.eventos.puntos is
  'Puntos de gamificación que otorga asistir a este evento (0027). 0 = no puntúa.';
comment on column public.eventos.cta_url is
  'Destino del botón de inscripción de la ficha pública (WhatsApp, formulario…).';

-- Réplica en BD de los límites de Zod (validation/evento.ts).
alter table public.eventos
  drop constraint if exists eventos_slug_format;
alter table public.eventos
  add constraint eventos_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 80);

alter table public.eventos
  drop constraint if exists eventos_titulo_len;
alter table public.eventos
  add constraint eventos_titulo_len check (char_length(titulo) between 2 and 120);

alter table public.eventos
  drop constraint if exists eventos_descripcion_len;
alter table public.eventos
  add constraint eventos_descripcion_len
    check (descripcion is null or char_length(descripcion) <= 20000);

alter table public.eventos
  drop constraint if exists eventos_ubicacion_len;
alter table public.eventos
  add constraint eventos_ubicacion_len
    check (ubicacion is null or char_length(ubicacion) between 2 and 200);

alter table public.eventos
  drop constraint if exists eventos_fechas_order;
alter table public.eventos
  add constraint eventos_fechas_order
    check (fecha_fin is null or fecha_fin >= fecha);

alter table public.eventos
  drop constraint if exists eventos_precio_range;
alter table public.eventos
  add constraint eventos_precio_range
    check (precio is null or (precio >= 0 and precio <= 10000));

alter table public.eventos
  drop constraint if exists eventos_capacidad_range;
alter table public.eventos
  add constraint eventos_capacidad_range
    check (capacidad is null or (capacidad > 0 and capacidad <= 100000));

alter table public.eventos
  drop constraint if exists eventos_puntos_range;
alter table public.eventos
  add constraint eventos_puntos_range check (puntos between 0 and 10000);

-- Solo http(s): evita `javascript:` en un href que se pinta en la web pública.
alter table public.eventos
  drop constraint if exists eventos_urls_http;
alter table public.eventos
  add constraint eventos_urls_http
    check (
      (cta_url is null or cta_url ~ '^https?://' and char_length(cta_url) <= 2000)
      and (cover_image_url is null or cover_image_url ~ '^(https?://|/)' and char_length(cover_image_url) <= 2000)
    );
