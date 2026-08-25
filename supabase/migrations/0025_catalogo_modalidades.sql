-- ════════════════════════════════════════════════════════════════════════════
-- 0025 · catálogo de modalidades al día + categoría
--
-- El catálogo vivía solo en el seed de desarrollo: en producción `modalidades`
-- y `niveles` estaban VACÍAS, así que la web caía siempre al fallback estático
-- de `content/landing.ts` y los formularios del panel (disciplinas del profe,
-- modalidad del curso) se quedaban sin opciones.
--
-- Cambios:
--   1. `categoria` — separa las clases abiertas de los grupos de compañía
--      (Cía Salsa, Cía Bachata Lady), que no se venden como clase suelta.
--   2. Alta idempotente del catálogo real, incluidas las que faltaban:
--      Lady Style Salsa, Lady Style Bachata, Sexy Style, Cía Salsa y
--      Cía Bachata Lady.
--   3. `lady-style` (genérica) queda inactiva: la sustituyen las dos variantes.
--      La URL antigua se redirige con 301 desde `next.config.ts`.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.modalidades
  add column if not exists categoria text not null default 'clase';

alter table public.modalidades
  drop constraint if exists modalidades_categoria_check;
alter table public.modalidades
  add constraint modalidades_categoria_check
    check (categoria in ('clase', 'compania'));

comment on column public.modalidades.categoria is
  'clase = abierta a matrícula regular · compania = grupo de compañía (acceso por audición).';

-- Réplica en BD de los límites de Zod (validation/modalidad.ts): el catálogo
-- se puede crear al vuelo desde el panel y también por REST con rol admin.
alter table public.modalidades
  drop constraint if exists modalidades_slug_format;
alter table public.modalidades
  add constraint modalidades_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60);

alter table public.modalidades
  drop constraint if exists modalidades_nombre_len;
alter table public.modalidades
  add constraint modalidades_nombre_len
    check (char_length(nombre) between 2 and 80);

alter table public.modalidades
  drop constraint if exists modalidades_descripcion_len;
alter table public.modalidades
  add constraint modalidades_descripcion_len
    check (descripcion is null or char_length(descripcion) <= 400);

-- ── Niveles (catálogo mínimo, idempotente por nombre) ────────────────────────
create unique index if not exists niveles_nombre_key on public.niveles (nombre);

insert into public.niveles (nombre, orden) values
  ('Nunca he bailado', 0),
  ('Empiezo', 1),
  ('Intermedio', 2),
  ('Avanzado', 3)
on conflict (nombre) do nothing;

-- ── Modalidades ──────────────────────────────────────────────────────────────
insert into public.modalidades (slug, nombre, descripcion, orden, activo, categoria) values
  ('salsa-cubana',        'Salsa cubana',        'El sabor del son y la rueda de casino. Energía, giros y mucha risa en grupo.', 1,  true, 'clase'),
  ('bachata',             'Bachata',             'Sensibilidad, musicalidad y conexión. La que engancha desde el primer día.',   2,  true, 'clase'),
  ('reparto',             'Reparto',             'El género urbano que arrasa en La Habana. Movimiento, actitud y mucha calle.', 3,  true, 'clase'),
  ('reggaeton',           'Reggaeton',           'Perreo con técnica y estilo. Suena fuerte, se siente más fuerte.',             4,  true, 'clase'),
  ('lady-style-salsa',    'Lady Style Salsa',    'Estilo femenino aplicado a la salsa cubana: brazos, cadera y presencia propia.', 5, true, 'clase'),
  ('lady-style-bachata',  'Lady Style Bachata',  'El lenguaje corporal de la bachata en solitario: ondas, giros y musicalidad.',  6, true, 'clase'),
  ('sexy-style',          'Sexy Style',          'Sensualidad trabajada con técnica: control, respiración y actitud.',           7,  true, 'clase'),
  ('heels',               'Heels',               'Potencia, actitud y glamour. Con o sin tacones, la energía es la misma.',      8,  true, 'clase'),
  ('cia-salsa',           'Cía Salsa',           'Grupo de compañía de salsa: coreografía, ensayo continuo y actuaciones.',      9,  true, 'compania'),
  ('cia-bachata-lady',    'Cía Bachata Lady',    'Grupo de compañía de bachata lady: montaje coreográfico y shows.',            10,  true, 'compania')
on conflict (slug) do update set
  nombre      = excluded.nombre,
  descripcion = coalesce(public.modalidades.descripcion, excluded.descripcion),
  orden       = excluded.orden,
  activo      = excluded.activo,
  categoria   = excluded.categoria;

-- La genérica se retira en favor de las dos variantes (301 en next.config.ts).
update public.modalidades set activo = false, orden = 99 where slug = 'lady-style';
