-- ════════════════════════════════════════════════════════════════════════════
-- 0037 · el contador de plazas fundadoras cuenta PERSONAS, no filas
--
-- `founding_spots_taken()` (0036) contaba filas de `leads`. Nada impide que
-- alguien envíe el formulario dos veces —no hay bloqueo, por decisión de Pol
-- (31-08-2026): el volumen es bajo y los duplicados se revisan a mano— así que
-- un doble envío se comía dos plazas y la web anunciaba una escasez inexistente
-- hasta que Pol lo viera.
--
-- Clave de identidad: teléfono normalizado + nombre normalizado.
--
--   · Solo teléfono NO sirve: en esta base hay dos parejas que comparten móvil
--     Y email (Fran/Maria Jose, Jonatan/Elisabeth). Son personas distintas, cada
--     una con derecho a su plaza; solo las separa el nombre.
--   · Solo email tampoco: es opcional en `leads` y esas parejas lo comparten.
--
-- Esto solo afecta al número que se pinta en la web. El panel de admin sigue
-- viendo todas las filas: la deduplicación no le esconde nada a Pol.
-- ════════════════════════════════════════════════════════════════════════════

-- Se normaliza con `translate` en vez de la extensión `unaccent`: son cuatro
-- letras las que importan en castellano y catalán, y así el recuento no depende
-- de una extensión instalada a mano en el proyecto.
--
-- Del teléfono se guardan los ÚLTIMOS 9 dígitos. `leads.telefono` es texto libre
-- y la misma persona aparece como `676830228`, `676 830 228` o `+34676830228`
-- según por dónde entrara (en la base hay ya un `34722263862`): sin recortar el
-- prefijo, un reenvío con y sin `+34` contaría dos veces. Nueve dígitos es la
-- longitud de un móvil español; por debajo se deja tal cual.
create or replace function public.lead_identity_key(p_telefono text, p_nombre text)
returns text
language sql
immutable
parallel safe
as $$
  select right(regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g'), 9)
      || '|'
      || regexp_replace(
           btrim(
             translate(
               lower(coalesce(p_nombre, '')),
               'áàäâãéèëêíìïîóòöôõúùüûñç',
               'aaaaaeeeeiiiiooooouuuunc'
             )
           ),
           '\s+', ' ', 'g'
         );
$$;

comment on function public.lead_identity_key(text, text) is
  'Últimos 9 dígitos del teléfono + nombre en minúsculas, sin acentos y sin espacios de más. Dedupe de leads: separa a las parejas que comparten móvil y email, y une los reenvíos de la misma persona con o sin prefijo +34.';

create or replace function public.founding_spots_taken()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct public.lead_identity_key(telefono, nombre))::integer
  from public.leads
  where origen = 'socio-fundador'
    and estado <> 'descartado';
$$;

comment on function public.founding_spots_taken() is
  'Plazas fundadoras ocupadas = PERSONAS distintas con lead socio-fundador no descartado (dedupe por teléfono + nombre). Agregado sin PII: se expone a anon para pintar el contador público.';

-- `lead_identity_key` es una utilidad interna del recuento: no se publica en la
-- API REST (PUBLIC tiene EXECUTE por defecto, ver 0030). `founding_spots_taken`
-- la ejecuta igual, como SECURITY DEFINER que es.
revoke all on function public.lead_identity_key(text, text) from public, anon, authenticated;

revoke all on function public.founding_spots_taken() from public;
grant execute on function public.founding_spots_taken() to anon, authenticated;
