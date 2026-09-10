-- ════════════════════════════════════════════════════════════════════════════
-- 0045d · los 10 puntos los da un trigger, no la Server Action
--
-- Convención del repo: las reglas de negocio duras viven en Postgres. Con la
-- clave publicable se puede escribir en `students` por REST saltándose la app
-- entera, así que si el premio lo concediera la acción, bastaría con guardar
-- el perfil por otra vía para... no cobrarlo nunca. Y al revés: si el premio
-- lo concediera el cliente, se cobraría sin completar nada.
--
-- SECURITY DEFINER porque el alumno no tiene INSERT sobre `point_events` —ni
-- debe tenerlo— y es su propio update el que dispara el apunte.
--
-- Se dispara también en INSERT y en los updates del admin: si es el admin
-- quien acaba rellenando el cumpleaños, el alumno cobra igual. El premio es
-- por tener la ficha completa, no por quién la escribió.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.students_award_perfil_completo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points integer;
begin
  if not public.perfil_alumno_completo(new.full_name, new.birthday, new.avatar_path) then
    return null;
  end if;

  -- Regla apagada desde el panel = no se conceden puntos nuevos. Los ya
  -- concedidos se quedan: son apuntes del libro mayor, no un cálculo.
  select points into v_points
  from public.point_rules
  where code = 'perfil_completo' and active;

  if v_points is null then
    return null;
  end if;

  insert into public.point_events (student_id, points, concept, source, rule_code)
  values (new.id, v_points, 'Perfil completado', 'manual', 'perfil_completo')
  on conflict do nothing;

  return null;
end;
$$;

revoke all on function public.students_award_perfil_completo() from public, anon, authenticated;

drop trigger if exists students_award_perfil_completo on public.students;
create trigger students_award_perfil_completo
  after insert or update of full_name, birthday, avatar_path on public.students
  for each row execute function public.students_award_perfil_completo();
