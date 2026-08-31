-- ════════════════════════════════════════════════════════════════════════════
-- 0039 · socio fundador y curso regular son la MISMA solicitud
--
--   Regla de negocio (Pol, 31-08-2026): las dos landings venden lo mismo, así
--   que una persona no puede estar en los dos embudos a la vez. **Prioridad al
--   socio fundador.** Matiza la decisión del 31-08 (2), que dejaba convivir las
--   filas de landings distintas como histórico de campaña: eso sigue valiendo
--   para `intensivos` —producto aparte, agosto— pero no para este par.
--
--   Va en un trigger y no solo en la Server Action porque con la clave
--   publicable se puede escribir en `leads` por REST saltándose la validación
--   de la app (misma razón que `reward_redemptions_apply` en 0027).
--
--   DOS CAUTELAS que no son evidentes:
--
--   1. `convertido` NO se toca nunca. Ahí ya hay ficha de alumno y
--      `converted_at`: es una venta cerrada, no un duplicado. Alguien que entró
--      por curso regular y luego pide la plaza fundadora está pidiendo una
--      MEJORA de tarifa, y las dos filas cuentan una historia real.
--
--   2. Los intereses se arrastran a la fila que sobrevive. El formulario de
--      curso regular pide las clases concretas ("Reparto · Miércoles 19:30");
--      el de fundador no pregunta ninguna, porque la plaza las incluye todas
--      (01-08-2026). Descartar la fila de regular a secas borraría el único
--      registro de a qué clases va esa persona — justo el dato que hace falta
--      para matricularla en su rutina real (0038a-c).
--
--   El contador público no cambia: `founding_spots_taken()` ya contaba solo
--   filas `socio-fundador`, y esas no se tocan.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.leads_socio_fundador_prioridad()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  k          text := public.lead_identity_key(new.telefono, new.nombre);
  arrastrado text[];
begin
  if new.origen = 'socio-fundador' then
    -- Guardamos las clases de las filas de curso regular que van a caer.
    select array_agg(distinct i) into arrastrado
    from public.leads l, unnest(coalesce(l.intereses, '{}'::text[])) as i
    where l.origen = 'curso-regular'
      and l.estado in ('nuevo', 'contactado', 'prueba_agendada')
      and public.lead_identity_key(l.telefono, l.nombre) = k;

    if arrastrado is not null then
      new.intereses := (
        select array_agg(distinct x)
        from unnest(coalesce(new.intereses, '{}'::text[]) || arrastrado) as x
      );
    end if;

    update public.leads l
    set estado = 'descartado'::lead_estado,
        modalidad_interes = 'Curso regular → Socio fundador'
    where l.origen = 'curso-regular'
      and l.estado in ('nuevo', 'contactado', 'prueba_agendada')
      and public.lead_identity_key(l.telefono, l.nombre) = k;

  elsif new.origen = 'curso-regular' then
    -- Ya está en el embudo de fundador: esta solicitud no lo degrada. Se
    -- guarda igual (queda el rastro de qué landing rellenó) pero nace
    -- descartada, y sus clases se suman a la fila de fundador.
    if exists (
      select 1 from public.leads l
      where l.origen = 'socio-fundador'
        and l.estado <> 'descartado'::lead_estado
        and public.lead_identity_key(l.telefono, l.nombre) = k
    ) then
      update public.leads l
      set intereses = (
        select array_agg(distinct x)
        from unnest(
          coalesce(l.intereses, '{}'::text[]) || coalesce(new.intereses, '{}'::text[])
        ) as x
      )
      where l.origen = 'socio-fundador'
        and l.estado <> 'descartado'::lead_estado
        and public.lead_identity_key(l.telefono, l.nombre) = k;

      new.estado := 'descartado'::lead_estado;
      new.modalidad_interes := 'Curso regular → Socio fundador';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.leads_socio_fundador_prioridad() is
  'Curso regular y socio fundador son la misma solicitud: gana socio fundador. Arrastra los intereses (las clases concretas) a la fila que sobrevive y nunca toca un lead convertido.';

-- Solo INSERT: reactivar a mano un lead descartado desde el panel es una
-- decisión consciente de Pol y el trigger no debe deshacérsela.
drop trigger if exists leads_socio_fundador_prioridad on public.leads;
create trigger leads_socio_fundador_prioridad
  before insert on public.leads
  for each row execute function public.leads_socio_fundador_prioridad();

-- Función de trigger: nadie debe poder llamarla a mano por REST (ver 0030).
revoke all on function public.leads_socio_fundador_prioridad() from public, anon, authenticated;

-- La misma regla aplicada a las filas que YA existen va aparte, en 0040:
-- tocar datos reales de `leads` es una operación distinta de instalar la
-- regla, y conviene poder revisarla y revertirla por separado.
