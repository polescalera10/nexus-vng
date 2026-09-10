-- ════════════════════════════════════════════════════════════════════════════
-- 0044d · el ranking, por función SECURITY DEFINER
--
-- El alumno solo ve su propia ficha (0026) y ese límite se queda como está: la
-- alternativa era abrir `students` en SELECT a todos los autenticados, que le
-- daría de paso el teléfono, el email, las notas del profe y el estado de la
-- cuota de sus compañeros. Aquí la función devuelve las tres columnas que el
-- ranking pinta y nada más.
--
-- El `where public.current_student_id() is not null` no es decorativo: un
-- usuario puede registrarse por su cuenta y quedarse con rol `alumno` sin
-- ficha (ya lo contempla la propia página del alumno). Sin esta condición, ese
-- usuario tendría el listado de nombres de la escuela con una sola llamada.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.leaderboard_alumno(p_limit integer default 200)
returns table (student_id uuid, full_name text, avatar_path text, balance integer)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.full_name, s.avatar_path, coalesce(b.balance, 0)
  from public.students s
  left join public.student_point_balances b on b.student_id = s.id
  where public.current_student_id() is not null
    and s.active
    and s.show_in_leaderboard
    and coalesce(b.balance, 0) > 0
  order by coalesce(b.balance, 0) desc, s.full_name
  limit greatest(1, least(coalesce(p_limit, 200), 500));
$$;

revoke all on function public.leaderboard_alumno(integer) from public, anon;
grant execute on function public.leaderboard_alumno(integer) to authenticated;
