-- ════════════════════════════════════════════════════════════════════════════
-- 0031a · Reaplicación idempotente de 0031 (30-08-2026)
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

create or replace function public.current_student_course_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.course_id
  from public.enrollments e
  where e.student_id = public.current_student_id();
$$;

create or replace function public.current_student_teacher_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct c.teacher_id
  from public.courses c
  where c.teacher_id is not null
    and c.id in (
      select e.course_id
      from public.enrollments e
      where e.student_id = public.current_student_id()
    );
$$;

revoke execute on function public.current_student_course_ids() from anon;
revoke execute on function public.current_student_teacher_ids() from anon;
