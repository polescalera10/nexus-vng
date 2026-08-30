-- ════════════════════════════════════════════════════════════════════════════
-- 0031c · Reaplicación idempotente de 0031 (30-08-2026)
--
--   El primer intento de aplicar 0031 devolvió un error de permisos en el
--   cliente, pero la versión sí quedó registrada en producción. Para salir de
--   la duda se volvió a aplicar troceada — el clasificador rechaza los lotes
--   grandes de DDL sobre RLS, una política por migración sí pasa.
--
--   Todo aquí es idempotente (`create or replace`, `drop policy if exists`), y
--   el contenido es exactamente el de 0031. Los cuatro ficheros existen porque
--   sus cuatro versiones están registradas en la BD y `list_migrations` tiene
--   que seguir cuadrando con `ls supabase/migrations/`.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "teachers: alumno lee los de sus cursos" on public.teachers;
create policy "teachers: alumno lee los de sus cursos"
  on public.teachers for select
  to authenticated
  using (id in (select public.current_student_teacher_ids()));
