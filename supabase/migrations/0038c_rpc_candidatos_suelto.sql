-- ════════════════════════════════════════════════════════════════════════════
-- 0038c · Candidatos a clase suelta (buscador del profe)
--
--   Para añadir a un fundador a una sesión, el profe tiene que poder buscarlo
--   antes de que exista ningún apunte suyo. Pero 0032l solo le deja leer
--   `students` de sus matriculados, y ampliar esa política le abriría la ficha
--   entera (teléfono, email, notas privadas) de gente que no es suya.
--
--   Mismo criterio que 0036: SECURITY DEFINER que devuelve el mínimo — id y
--   nombre, nada más—, y solo a quien puede dar clase en esa sesión.
-- ════════════════════════════════════════════════════════════════════════════

create index if not exists students_founding_idx
  on public.students (full_name)
  where is_founding_member and active;

create or replace function public.founding_drop_in_candidates(p_session_id uuid)
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.full_name
  from public.students s
  where (public.is_admin() or public.can_teach_session(p_session_id))
    and public.can_drop_in_session(p_session_id, s.id)
    -- Ya matriculado: sale por la lista normal, no como suelto.
    and not exists (
      select 1
      from public.enrollments e
      join public.class_sessions cs on cs.course_id = e.course_id
      where cs.id = p_session_id
        and e.student_id = s.id
        and e.status <> 'baja'::inscripcion_estado
    )
    -- Ya añadido a esta sesión.
    and not exists (
      select 1 from public.attendance a
      where a.class_session_id = p_session_id and a.student_id = s.id
    )
  order by s.full_name;
$$;

comment on function public.founding_drop_in_candidates(uuid) is
  'Socios fundadores que el profe puede añadir de suelto a una sesión. Devuelve solo id y nombre: el buscador no necesita PII de contacto.';

revoke all on function public.founding_drop_in_candidates(uuid) from public, anon;
grant execute on function public.founding_drop_in_candidates(uuid) to authenticated;
