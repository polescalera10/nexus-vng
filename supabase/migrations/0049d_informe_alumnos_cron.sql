-- ════════════════════════════════════════════════════════════════════════════
-- 0049d · tareas programadas en Postgres: informe de las 9 y retención
--
-- Por qué pg_cron y no un cron de Vercel: en el plan Hobby, Vercel dispara
-- "en algún momento de esa hora" y siempre en UTC. pg_cron llega al minuto.
--
-- La hora de Madrid cambia dos veces al año y pg_cron solo entiende UTC, así
-- que el informe se dispara a las 07:00 Y a las 08:00 UTC: la ruta mira la
-- hora de Madrid y solo envía en la llamada que cae a las 9. La otra
-- responde "fuera de hora" y no hace nada.
--
-- El secreto NO está en este fichero. Vive en Supabase Vault con el nombre
-- `informe_alumnos_secret` (el mismo valor que INFORME_ALUMNOS_SECRET en
-- Vercel) y se lee al ejecutar. Si el secreto no existe —la BD local, la CI—
-- el job del informe no se programa: no hay a quién llamar.
--
-- Cambiar la URL o el horario: volver a aplicar este bloque con los valores
-- nuevos. `cron.schedule` con el mismo nombre sustituye al anterior.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $do$
begin
  -- 12 meses de actividad y ni un día más (lo promete /privacidad).
  perform cron.schedule(
    'actividad-alumnos-retencion',
    '30 3 * * *',
    $job$
      delete from public.student_activity_days   where day        < current_date - 365;
      delete from public.student_video_plays     where played_on  < current_date - 365;
      delete from public.student_profile_changes where changed_at < now() - interval '365 days';
    $job$
  );

  if exists (select 1 from vault.secrets where name = 'informe_alumnos_secret') then
    perform cron.schedule(
      'informe-alumnos-diario',
      '0 7,8 * * *',
      $job$
        select net.http_get(
          url := 'https://nexusvng.es/api/cron/informe-alumnos',
          headers := jsonb_build_object(
            'x-cron-secret',
            (select decrypted_secret from vault.decrypted_secrets
              where name = 'informe_alumnos_secret')
          ),
          timeout_milliseconds := 60000
        );
      $job$
    );
  else
    raise notice '0049d: sin secreto informe_alumnos_secret en Vault, no se programa el informe.';
  end if;
end;
$do$;
