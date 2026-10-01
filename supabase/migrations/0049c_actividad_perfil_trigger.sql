-- ════════════════════════════════════════════════════════════════════════════
-- 0049c · qué campos de su perfil rellena el alumno
--
-- Trigger y no Server Action: el alumno puede escribir en `students` por REST
-- con la clave publicable, y ese cambio tiene que contar igual.
--
-- Solo apunta los cambios que hace el propio alumno sobre SU ficha. Lo que
-- corrige el admin o el profe desde el panel no es "el alumno rellenó su
-- perfil", y meterlo en el informe lo falsearía.
--
-- La lista de campos es la misma lista blanca del guard (0045b) menos
-- `onboarding_seen_at`, que no es un dato del perfil: la primera visita ya la
-- registra `student_activity_days`.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.students_log_cambios_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or old.profile_id is distinct from auth.uid() then
    return null;
  end if;

  insert into public.student_profile_changes (student_id, field, filled)
  select new.id, c.field, c.filled
  from (values
    ('full_name',           new.full_name   is distinct from old.full_name,   nullif(btrim(new.full_name), '') is not null),
    ('phone',               new.phone       is distinct from old.phone,       nullif(btrim(new.phone), '') is not null),
    ('birthday',            new.birthday    is distinct from old.birthday,    new.birthday is not null),
    ('dance_role',          new.dance_role  is distinct from old.dance_role,  true),
    ('avatar_path',         new.avatar_path is distinct from old.avatar_path, new.avatar_path is not null),
    ('show_in_leaderboard', new.show_in_leaderboard is distinct from old.show_in_leaderboard, new.show_in_leaderboard)
  ) as c (field, changed, filled)
  where c.changed;

  return null;
end;
$$;

revoke all on function public.students_log_cambios_perfil() from public, anon, authenticated;

drop trigger if exists students_log_cambios_perfil on public.students;
create trigger students_log_cambios_perfil
  after update of full_name, phone, birthday, dance_role, avatar_path, show_in_leaderboard
  on public.students
  for each row execute function public.students_log_cambios_perfil();
