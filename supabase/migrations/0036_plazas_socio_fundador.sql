-- ════════════════════════════════════════════════════════════════════════════
-- 0036 · plazas de socio fundador en tiempo real
--
-- Hasta ahora "Quedan 10 / 10" era una constante en src/content/landing.ts que
-- había que tocar a mano. Pasa a salir de `leads`: cada lead con
-- `origen = 'socio-fundador'` que no esté descartado ocupa una plaza.
--
-- ¿Por qué una función y no una consulta directa? `leads` es PII y su RLS solo
-- deja leer a `is_admin()` (0008). La web pública consulta con la anon key, así
-- que necesita un SECURITY DEFINER que devuelva SOLO el recuento agregado: sin
-- argumentos, sin filas, sin un dato personal que filtrar.
--
-- Criterio de conteo decidido por Pol (31-08-2026): cuenta el interés
-- registrado, no la venta cerrada. Si hay que justificarlo ante Consumo
-- (Directiva Omnibus / RDL 24/2021), la afirmación que soporta es "quedan N
-- plazas sin asignar", no "N personas ya han pagado".
-- ════════════════════════════════════════════════════════════════════════════

-- La consulta filtra siempre por el mismo origen: índice parcial, no sobre
-- `origen` entero (el resto de landings no lo necesitan).
create index if not exists leads_socio_fundador_idx
  on public.leads (estado)
  where origen = 'socio-fundador';

create or replace function public.founding_spots_taken()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.leads
  where origen = 'socio-fundador'
    and estado <> 'descartado';
$$;

comment on function public.founding_spots_taken() is
  'Plazas fundadoras ocupadas = leads con origen socio-fundador no descartados. Agregado sin PII: se expone a anon para pintar el contador público.';

-- PUBLIC tiene EXECUTE por defecto (ver 0030): revocar ahí y conceder solo
-- donde hace falta.
revoke all on function public.founding_spots_taken() from public;
grant execute on function public.founding_spots_taken() to anon, authenticated;
