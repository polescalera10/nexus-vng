-- ════════════════════════════════════════════════════════════════════════════
-- 0049b · actividad del alumno: las dos puertas de escritura
--
-- Ninguna recibe el id del alumno: lo resuelven desde la sesión con
-- `current_student_id()`. Un id que viaja desde el cliente es un id que se
-- cambia en el inspector, y con él cualquiera apuntaría visitas a otro.
--
-- Si quien llama no tiene ficha de alumno (admin, profesor) no hacen nada y
-- no fallan: la página no tiene por qué romperse porque no haya qué apuntar.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.registrar_visita_alumno(p_seccion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := public.current_student_id();
  v_dia     date := (now() at time zone 'Europe/Madrid')::date;
begin
  -- Lista blanca: la sección acaba en un correo, no se guarda texto libre.
  if v_student is null or p_seccion is null
     or p_seccion not in ('inicio', 'ranking', 'perfil', 'clase') then
    return;
  end if;

  insert into public.student_activity_days as a
    (student_id, day, first_seen_at, last_seen_at, views, sections)
  values (v_student, v_dia, now(), now(), 1, array[p_seccion])
  on conflict (student_id, day) do update
    set last_seen_at = now(),
        views        = a.views + 1,
        sections     = case when p_seccion = any (a.sections) then a.sections
                            else a.sections || p_seccion end;
end;
$$;

revoke all on function public.registrar_visita_alumno(text) from public, anon;
grant execute on function public.registrar_visita_alumno(text) to authenticated;

create or replace function public.registrar_reproduccion_video(p_video_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := public.current_student_id();
  v_sesion  uuid;
begin
  if v_student is null or p_video_id is null then
    return;
  end if;

  select class_session_id into v_sesion
  from public.session_videos
  where id = p_video_id;

  -- Solo vídeos de sus propias clases: si no, la función confirmaría a
  -- cualquiera que un id de vídeo existe.
  if v_sesion is null or not public.student_can_see_session(v_sesion) then
    return;
  end if;

  insert into public.student_video_plays as p
    (student_id, session_video_id, played_on, first_played_at, plays)
  values (v_student, p_video_id, (now() at time zone 'Europe/Madrid')::date, now(), 1)
  on conflict (student_id, session_video_id, played_on) do update
    set plays = p.plays + 1;
end;
$$;

revoke all on function public.registrar_reproduccion_video(uuid) from public, anon;
grant execute on function public.registrar_reproduccion_video(uuid) to authenticated;
