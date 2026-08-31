-- ════════════════════════════════════════════════════════════════════════════
-- 0041 — Las compañías cuentan como una clase regular más (Pol, 31-08-2026)
--
-- Hasta ahora los grupos de compañía (Cía Salsa, Cía Lady Bachata) quedaban
-- FUERA de la tarifa plana y de la plaza de socio fundador, y la web lo decía
-- en varios sitios. Pol elimina esa excepción: en cuota, una compañía es una
-- clase más. Lo que la distingue sigue siendo la puerta de entrada (audición o
-- invitación) y el compromiso con los ensayos, no el precio.
--
-- `modalidades.categoria` NO se toca: sigue siendo la etiqueta de formato que
-- usa el panel ('clase' vs 'compania'). Lo que cambia es que deja de decidir
-- quién puede caer de suelto.
--
-- Efecto real: un socio fundador activo ya puede asistir de suelto también a
-- las sesiones de compañía, así que `can_record_attendance` (que se apoya en
-- esta función) deja de rechazarlo y el profe lo ve en el roster.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.can_drop_in_session(
  p_session_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sessions cs
    join public.courses c  on c.id = cs.course_id
    join public.students s on s.id = p_student_id
    where cs.id = p_session_id
      and s.is_founding_member
      and s.active
  );
$$;

comment on function public.can_drop_in_session(uuid, uuid) is
  'Socio fundador activo que puede asistir de suelto a una sesión. Desde 0041 las compañías entran igual que el resto de clases.';
