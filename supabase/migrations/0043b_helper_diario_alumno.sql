-- 0043b · Helper del diario para el alumno.
--
-- El alcance depende de `class_sessions`, que está protegida por RLS. La regla
-- del proyecto (ver 0031) es que ninguna política consulte una tabla que pueda
-- apuntar de vuelta: eso es lo que produjo el `42P17 infinite recursion` del
-- 30-08-2026. Así que va por SECURITY DEFINER, igual que sus hermanas.
create or replace function public.student_can_see_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sessions cs
    where cs.id = p_session_id
      and cs.course_id in (select public.current_student_course_ids())
  );
$$;

revoke execute on function public.student_can_see_session(uuid) from anon;
