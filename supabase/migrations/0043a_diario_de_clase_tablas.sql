-- ════════════════════════════════════════════════════════════════════════════
-- 0043a · Diario de clase: qué se dio y el vídeo de la sesión
--
--   El alumno que falta una semana a salsa se queda descolgado, y el que vino
--   quiere repasar la secuencia en casa. Esto cuelga de cada SESIÓN (la clase
--   del martes 9, no "el curso de los martes") lo que se dio y los vídeos.
--
--   Ya existía `contenido` (0006) con un `clase_id` que apunta a `courses`, sin
--   una sola línea de código que la use. No sirve: el vídeo es de una fecha
--   concreta, no del curso entero. Se deja intacta para no romper nada y el
--   diario vive en tablas nuevas.
--
--   Dos tablas y no una: el resumen es uno por sesión (1:1, de ahí el unique)
--   y los vídeos son varios (el paso lento, el paso a tiempo, la vuelta).
--
--   Los vídeos son SIEMPRE una URL externa. Supabase Storage no da la talla
--   en el plan Free: 50 MB por archivo y 1 GB en total — un clip de móvil de
--   un minuto ya pasa del límite por archivo.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.session_notes (
  id               uuid primary key default gen_random_uuid(),
  class_session_id uuid not null unique
                     references public.class_sessions (id) on delete cascade,
  resumen          text not null,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.session_notes drop constraint if exists session_notes_resumen_len;
alter table public.session_notes
  add constraint session_notes_resumen_len
    check (char_length(resumen) between 1 and 4000);

comment on table public.session_notes is
  'Qué se dio en una sesión concreta. Lo escribe el profe, lo lee el alumno matriculado.';

create table if not exists public.session_videos (
  id               uuid primary key default gen_random_uuid(),
  class_session_id uuid not null
                     references public.class_sessions (id) on delete cascade,
  url              text not null,
  titulo           text,
  orden            integer not null default 0,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- La URL se valida de verdad en `lib/video.ts` (lista blanca de orígenes). Aquí
-- solo el mínimo que impide guardar basura: https y una longitud sensata.
alter table public.session_videos drop constraint if exists session_videos_url_https;
alter table public.session_videos
  add constraint session_videos_url_https
    check (url ~ '^https://' and char_length(url) between 12 and 2048);

alter table public.session_videos drop constraint if exists session_videos_titulo_len;
alter table public.session_videos
  add constraint session_videos_titulo_len
    check (titulo is null or char_length(titulo) between 1 and 200);

comment on table public.session_videos is
  'Vídeos de una sesión. Siempre URL externa: el plan Free de Storage no admite vídeo.';

create index if not exists session_videos_session_idx
  on public.session_videos (class_session_id, orden);

drop trigger if exists session_notes_set_updated_at on public.session_notes;
create trigger session_notes_set_updated_at
  before update on public.session_notes
  for each row execute function public.set_updated_at();

drop trigger if exists session_videos_set_updated_at on public.session_videos;
create trigger session_videos_set_updated_at
  before update on public.session_videos
  for each row execute function public.set_updated_at();

alter table public.session_notes  enable row level security;
alter table public.session_videos enable row level security;
