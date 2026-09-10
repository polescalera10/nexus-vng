-- ════════════════════════════════════════════════════════════════════════════
-- 0045b · `onboarding_seen_at` entra en la lista blanca del alumno
--
-- Sin esto, cerrar la bienvenida moría con el error del guard: el alumno es
-- quien la marca como vista, desde su propia sesión.
--
-- Reescribe entera la función de 0044b (no hay forma de "añadir" a una lista
-- blanca desde otra migración sin dejar dos versiones compitiendo).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.students_guard_teacher_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if old.profile_id is not null and old.profile_id = auth.uid() then
    if (to_jsonb(new) - 'full_name' - 'phone' - 'birthday' - 'dance_role'
                      - 'avatar_path' - 'show_in_leaderboard'
                      - 'onboarding_seen_at' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'full_name' - 'phone' - 'birthday' - 'dance_role'
                      - 'avatar_path' - 'show_in_leaderboard'
                      - 'onboarding_seen_at' - 'updated_at')
    then
      raise exception 'students: el alumno solo puede editar los datos de su perfil';
    end if;
    return new;
  end if;

  if (to_jsonb(new) - 'notes' - 'payment_status' - 'updated_at')
     is distinct from
     (to_jsonb(old) - 'notes' - 'payment_status' - 'updated_at')
  then
    raise exception 'students: el profesor solo puede modificar notas y estado de cuota';
  end if;
  return new;
end;
$$;

revoke all on function public.students_guard_teacher_update() from public, anon, authenticated;
