-- ════════════════════════════════════════════════════════════════════════════
-- 0044b · el guard de `students` aprende a distinguir alumno de profesor
--
-- Hasta ahora el guard solo contemplaba dos casos: admin (pasa) y cualquier
-- otro (solo `notes` y `payment_status`). Con el perfil editable hay un tercer
-- caso — el alumno sobre SU PROPIA fila — y sin esta rama el formulario de
-- perfil moría en el primer guardado con el error del profesor.
--
-- La rama del alumno va primero a propósito. Si una persona fuera profesora y
-- alumna a la vez, editando su propia ficha manda la lista más estrecha de las
-- dos, que es esta. Sobre la ficha de OTRO sigue cayendo en la del profesor.
--
-- Lista blanca, nunca lista negra (convención del repo): lo que no se enumera
-- aquí queda prohibido solo por existir, así que una columna nueva no abre un
-- agujero en silencio.
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
                      - 'avatar_path' - 'show_in_leaderboard' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'full_name' - 'phone' - 'birthday' - 'dance_role'
                      - 'avatar_path' - 'show_in_leaderboard' - 'updated_at')
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

-- `create or replace` vuelve a conceder EXECUTE a PUBLIC: hay que revocarlo
-- otra vez o la función de trigger reaparece en /rest/v1/rpc (ver 0030).
revoke all on function public.students_guard_teacher_update() from public, anon, authenticated;
