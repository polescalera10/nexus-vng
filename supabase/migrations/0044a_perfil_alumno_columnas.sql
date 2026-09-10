-- ════════════════════════════════════════════════════════════════════════════
-- 0044a · el alumno edita su perfil y aparece en el ranking (10-09-2026)
--
--   · `avatar_path` — ruta DENTRO del bucket privado `avatars`, nunca una URL.
--     Guardar la URL firmada sería guardar algo que caduca en una hora; la URL
--     se firma al pintar (ver `lib/avatars.ts`).
--   · `show_in_leaderboard` — el ranking enseña nombre, apellidos y foto de
--     una persona al resto de alumnos. Eso es un tratamiento de datos
--     personales: hace falta que quien no quiera salir pueda irse. Por defecto
--     true para que la sección no nazca vacía, y con salida en un clic desde
--     su perfil.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.students add column if not exists avatar_path text;
alter table public.students
  add column if not exists show_in_leaderboard boolean not null default true;

-- La forma de la ruta no es cosmética: las políticas del bucket autorizan la
-- escritura comparando la PRIMERA carpeta con el id del alumno. Si la ruta
-- pudiera tener cualquier forma, esa comparación dejaría de significar nada.
alter table public.students drop constraint if exists students_avatar_path_shape;
alter table public.students
  add constraint students_avatar_path_shape
    check (
      avatar_path is null
      or avatar_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9._-]{1,80}$'
    );

comment on column public.students.avatar_path is
  'Ruta en el bucket privado `avatars`, con forma <student_id>/<fichero>. Null = avatar de iniciales.';
comment on column public.students.show_in_leaderboard is
  'false = el alumno ha pedido no salir en el ranking. Lo respeta leaderboard_alumno().';
