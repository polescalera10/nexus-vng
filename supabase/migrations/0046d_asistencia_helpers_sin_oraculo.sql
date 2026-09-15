-- 0046d · `can_drop_in_session` y `can_record_attendance` solo responden a
-- quien imparte la sesión (o al admin).
--
-- Reciben un `p_student_id` arbitrario y, al ser SECURITY DEFINER con EXECUTE
-- para `authenticated`, cualquier alumno podía llamarlas por RPC y averiguar si
-- otro alumno es socio fundador activo o está matriculado en una sesión.
-- No se les puede quitar el EXECUTE: las usan las políticas de `attendance`,
-- que se evalúan con el rol del profesor.
--
-- La comprobación nueva no cambia nada para sus usuarios legítimos: las
-- políticas que las llaman ya exigen `can_teach_session`, y
-- `founding_drop_in_candidates` ya exige admin o profesor de la sesión.
-- `is_admin()` y `can_teach_session()` leen `auth.uid()` del JWT, así que
-- funcionan igual anidadas dentro de otra función SECURITY DEFINER.

create or replace function public.can_drop_in_session(p_session_id uuid, p_student_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select (public.is_admin() or public.can_teach_session(p_session_id))
    and exists (
      select 1
      from public.class_sessions cs
      join public.courses c  on c.id = cs.course_id
      join public.students s on s.id = p_student_id
      where cs.id = p_session_id
        and s.is_founding_member
        and s.active
    );
$function$;

create or replace function public.can_record_attendance(p_session_id uuid, p_student_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select (public.is_admin() or public.can_teach_session(p_session_id))
    and (
      exists (
        select 1
        from public.enrollments e
        join public.class_sessions cs on cs.course_id = e.course_id
        where cs.id = p_session_id
          and e.student_id = p_student_id
          and e.status <> 'baja'::inscripcion_estado
      )
      or public.can_drop_in_session(p_session_id, p_student_id)
    );
$function$;
