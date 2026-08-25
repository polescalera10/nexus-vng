-- ════════════════════════════════════════════════════════════════════════════
-- 0026 · área privada con los tres perfiles (admin · profesor · alumno)
--
--   1. Email en `teachers` y unicidad en `students`: es la identidad con la
--      que se entra al panel (magic link de Supabase Auth).
--   2. `students.profile_id` — enlaza la ficha CRM con el usuario de Auth.
--      Nullable: un alumno puede existir sin login (alta a mano en clase).
--   3. `students.birthday` — base de la felicitación automática.
--   4. RLS del rol `alumno`: solo su ficha, sus matrículas, los cursos donde
--      está matriculado, los profesores de esos cursos y su asistencia.
--   5. Los guards de columnas (0020) pasan de lista negra a lista blanca:
--      enumerar las columnas prohibidas se rompe en silencio cada vez que se
--      añade una nueva (`birthday`, `profile_id`…). Ahora se compara la fila
--      entera menos lo que sí se permite tocar.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1 · Email ────────────────────────────────────────────────────────────────
alter table public.teachers add column if not exists email public.citext;

alter table public.teachers
  drop constraint if exists teachers_email_len;
alter table public.teachers
  add constraint teachers_email_len
    check (email is null or char_length(email::text) between 3 and 254);

create unique index if not exists teachers_email_key
  on public.teachers (email) where email is not null;

-- `students.email` era text: a citext para que el login no dependa de mayúsculas.
alter table public.students alter column email type public.citext;

create unique index if not exists students_email_key
  on public.students (email) where email is not null;

-- ── 2 · Enlace ficha ↔ usuario de Auth ───────────────────────────────────────
alter table public.students
  add column if not exists profile_id uuid references public.profiles (id) on delete set null;

create unique index if not exists students_profile_id_key
  on public.students (profile_id) where profile_id is not null;

comment on column public.students.profile_id is
  'Usuario de Auth con el que este alumno entra al área privada. Null = alumno sin login.';

-- ── 3 · Cumpleaños ───────────────────────────────────────────────────────────
alter table public.students add column if not exists birthday date;

alter table public.students
  drop constraint if exists students_birthday_range;
alter table public.students
  add constraint students_birthday_range
    check (birthday is null or (birthday > date '1900-01-01' and birthday < current_date));

comment on column public.students.birthday is
  'Fecha de nacimiento. Alimenta la felicitación automática (cron/cumpleanos).';

-- ── 4 · RLS del rol alumno ───────────────────────────────────────────────────
-- Helper: id de la ficha de alumno del usuario de la sesión. SECURITY DEFINER
-- para poder leer `students` sin recursión con las políticas de la propia tabla.
create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.students where profile_id = auth.uid();
$$;

revoke execute on function public.current_student_id() from anon;

create policy "students: alumno lee su ficha"
  on public.students for select
  to authenticated
  using (profile_id = auth.uid());

create policy "enrollments: alumno lee las suyas"
  on public.enrollments for select
  to authenticated
  using (student_id = public.current_student_id());

create policy "courses: alumno lee los suyos"
  on public.courses for select
  to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = courses.id
        and e.student_id = public.current_student_id()
    )
  );

create policy "teachers: alumno lee los de sus cursos"
  on public.teachers for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      join public.courses c on c.id = e.course_id
      where e.student_id = public.current_student_id()
        and c.teacher_id = teachers.id
    )
  );

create policy "class_sessions: alumno lee las de sus cursos"
  on public.class_sessions for select
  to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = class_sessions.course_id
        and e.student_id = public.current_student_id()
    )
  );

create policy "attendance: alumno lee la suya"
  on public.attendance for select
  to authenticated
  using (student_id = public.current_student_id());

-- ── 5 · Guards por lista blanca ──────────────────────────────────────────────
-- `to_jsonb(fila) - 'col'` quita la clave; si lo que queda difiere, se ha
-- tocado algo que no se puede tocar. Añadir columnas nuevas ya no abre agujeros.
create or replace function public.students_guard_teacher_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
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

create or replace function public.class_sessions_guard_teacher_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if (to_jsonb(new) - 'status' - 'updated_at')
     is distinct from
     (to_jsonb(old) - 'status' - 'updated_at')
  then
    raise exception 'class_sessions: el profesor solo puede cambiar el estado de la sesión';
  end if;
  if new.status is distinct from old.status
    and not (old.status = 'programada' and new.status = 'impartida')
  then
    raise exception 'class_sessions: el profesor solo puede marcar una sesión programada como impartida';
  end if;
  return new;
end;
$$;

-- ── 6 · Higiene: funciones de trigger fuera de la API REST ───────────────────
-- El linter de Supabase avisa de que `handle_new_user` y `rls_auto_enable` son
-- SECURITY DEFINER invocables por `anon` vía /rest/v1/rpc. Son funciones de
-- trigger: nadie debe llamarlas a mano.
revoke execute on function public.handle_new_user() from anon, authenticated;
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from anon, authenticated';
  end if;
end
$$;
