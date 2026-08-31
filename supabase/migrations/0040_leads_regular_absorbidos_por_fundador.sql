-- ════════════════════════════════════════════════════════════════════════════
-- 0040 · la regla de 0039, aplicada a lo que ya hay en `leads`
--
--   El trigger de 0039 solo actúa sobre altas nuevas. Esto arrastra las filas
--   que ya convivían en los dos embudos. Un único caso real en la tabla el
--   31-08-2026: Karen Andreu Álvarez (curso regular 12:56 → socio fundador
--   13:14 del mismo día). Backup y deshacer en
--   `backup-fusion-karen-regular-fundador-2026-08-31.sql`.
--
--   Sin ids a mano: se resuelve por clave de identidad, así que es
--   idempotente y vale para cualquier caso futuro que se cuele.
-- ════════════════════════════════════════════════════════════════════════════
-- Sin ids a mano: se resuelve por clave de identidad, así que es idempotente.

-- 1) Arrastrar las clases ANTES de descartar (el filtro de abajo usa `estado`).
update public.leads f
set intereses = sub.merged
from (
  select fu.id,
         (
           select array_agg(distinct x)
           from unnest(
             coalesce(fu.intereses, '{}'::text[]) || coalesce(re.acumulados, '{}'::text[])
           ) as x
         ) as merged
  from public.leads fu
  join lateral (
    select array_agg(distinct i) as acumulados
    from public.leads r, unnest(coalesce(r.intereses, '{}'::text[])) as i
    where r.origen = 'curso-regular'
      and r.estado in ('nuevo', 'contactado', 'prueba_agendada')
      and public.lead_identity_key(r.telefono, r.nombre)
          = public.lead_identity_key(fu.telefono, fu.nombre)
  ) re on true
  where fu.origen = 'socio-fundador'
    and fu.estado <> 'descartado'::lead_estado
    and re.acumulados is not null
) sub
where f.id = sub.id;

-- 2) Descartar las filas de curso regular superadas por una de fundador.
update public.leads r
set estado = 'descartado'::lead_estado,
    modalidad_interes = 'Curso regular → Socio fundador'
where r.origen = 'curso-regular'
  and r.estado in ('nuevo', 'contactado', 'prueba_agendada')
  and exists (
    select 1 from public.leads f
    where f.origen = 'socio-fundador'
      and f.estado <> 'descartado'::lead_estado
      and public.lead_identity_key(f.telefono, f.nombre)
          = public.lead_identity_key(r.telefono, r.nombre)
  );
