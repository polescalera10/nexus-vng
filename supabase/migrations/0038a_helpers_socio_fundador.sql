-- ════════════════════════════════════════════════════════════════════════════
-- 0038a · Helpers de la clase suelta del socio fundador
--
--   La plaza fundadora da acceso a todas las disciplinas regulares del nivel
--   del alumno o inferior. Hasta ahora `students.is_founding_member` era solo
--   una etiqueta: no tocaba matrículas ni asistencia.
--
--   Decisión de Pol (31-08-2026): el fundador NO se matricula en las 15 clases
--   —eso falsearía el aforo de todo el catálogo—. Se matricula en su rutina
--   real (esas sí ocupan plaza) y el día que cae en otra clase el profe le
--   añade a esa sesión concreta, sin matrícula. La asistencia suelta vive en
--   `attendance` sin fila en `enrollments`.
--
--   La RLS de 0032j/0032k exigía matrícula para escribir asistencia, así que
--   esto no era solo UI. Aquí van los helpers; las políticas, en 0038b.
--
--   Todo por función SECURITY DEFINER, como 0031a y 0032e: una política que
--   consulte directamente una tabla protegida que apunte de vuelta cierra el
--   ciclo y Postgres aborta con 42P17 (ver CLAUDE.md).
--
--   Las compañías (Cía Salsa, Cía Lady Bachata) quedan fuera de la tarifa
--   fundadora, así que también quedan fuera del suelto: se filtra por
--   `modalidades.categoria = 'clase'` (0025).
-- ════════════════════════════════════════════════════════════════════════════

-- ¿Puede este alumno caer de suelto en esta sesión?
-- Socio fundador activo + la sesión es de una clase regular (no compañía).
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
    join public.courses c     on c.id = cs.course_id
    join public.modalidades m on m.id = c.modalidad_id
    join public.students s    on s.id = p_student_id
    where cs.id = p_session_id
      and m.categoria = 'clase'
      and s.is_founding_member
      and s.active
  );
$$;

comment on function public.can_drop_in_session(uuid, uuid) is
  'Socio fundador activo que puede asistir de suelto a una sesión de clase regular (las compañías quedan fuera de la tarifa fundadora).';

-- ¿Se le puede apuntar la asistencia en esta sesión?
-- Matriculado (no de baja) o fundador de suelto.
create or replace function public.can_record_attendance(
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
    from public.enrollments e
    join public.class_sessions cs on cs.course_id = e.course_id
    where cs.id = p_session_id
      and e.student_id = p_student_id
      and e.status <> 'baja'::inscripcion_estado
  ) or public.can_drop_in_session(p_session_id, p_student_id);
$$;

comment on function public.can_record_attendance(uuid, uuid) is
  'Alumno al que el profe puede pasar lista en la sesión: matriculado no de baja, o socio fundador de suelto.';

-- Reescrita: el profe también ve al fundador que ya tiene asistencia apuntada
-- en una de sus sesiones. Sin esto, en cuanto se guarda la lista el nombre del
-- suelto desaparece del roster (0032l solo alcanza a los matriculados) y el
-- profe se encuentra una fila fantasma al recargar.
create or replace function public.teaches_or_substitutes_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id
      and (
        e.course_id in (select public.current_teacher_course_ids())
        or exists (
          select 1
          from public.class_sessions cs
          join public.teachers t on t.id = cs.substitute_teacher_id
          where cs.course_id = e.course_id and t.profile_id = auth.uid()
        )
      )
  )
  or exists (
    select 1
    from public.attendance a
    join public.class_sessions cs on cs.id = a.class_session_id
    where a.student_id = p_student_id
      and (
        cs.course_id in (select public.current_teacher_course_ids())
        or exists (
          select 1 from public.teachers t
          where t.id = cs.substitute_teacher_id and t.profile_id = auth.uid()
        )
      )
  );
$$;

revoke all on function public.can_drop_in_session(uuid, uuid) from public, anon;
revoke all on function public.can_record_attendance(uuid, uuid) from public, anon;
grant execute on function public.can_drop_in_session(uuid, uuid) to authenticated;
grant execute on function public.can_record_attendance(uuid, uuid) to authenticated;
