-- ════════════════════════════════════════════════════════════════════════════
-- 0030 · funciones internas fuera de la API REST
--
-- PostgREST publica como `/rest/v1/rpc/<fn>` toda función del esquema `public`
-- sobre la que el rol tenga EXECUTE, y en Postgres **PUBLIC tiene EXECUTE por
-- defecto**: revocar solo de `anon`/`authenticated` (como hacía 0026) no quita
-- nada, porque el permiso venía del grant a PUBLIC. Aquí se revoca de PUBLIC y
-- se vuelve a conceder solo donde hace falta.
--
--   · Funciones de trigger y de evento (handle_new_user, rls_auto_enable,
--     set_updated_at, los guards, reward_redemptions_apply,
--     point_events_check_milestones): nadie debe poder llamarlas a mano. El
--     permiso de un trigger se comprueba al CREARLO, no al dispararse, así que
--     revocar no los rompe.
--   · `student_point_balance()`: solo la usan triggers SECURITY DEFINER.
--   · `current_student_id()`: la evalúan las políticas RLS con el rol del que
--     consulta → `authenticated` la necesita.
--   · `is_admin()` / `current_role()`: las evalúan políticas que alcanzan a
--     `anon` (modalidades y eventos públicos), así que su EXECUTE se queda.
--     Devuelven false/null sin sesión: no filtran nada.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare
  fn text;
  internas text[] := array[
    'public.handle_new_user()',
    'public.rls_auto_enable()',
    'public.set_updated_at()',
    'public.profiles_guard_role_change()',
    'public.students_guard_teacher_update()',
    'public.class_sessions_guard_teacher_update()',
    'public.reward_redemptions_apply()',
    'public.point_events_check_milestones()',
    'public.student_point_balance(uuid)'
  ];
begin
  foreach fn in array internas loop
    if to_regprocedure(fn) is not null then
      execute format('revoke all on function %s from public, anon, authenticated', fn);
    end if;
  end loop;
end
$$;

revoke all on function public.current_student_id() from public, anon;
grant execute on function public.current_student_id() to authenticated;
