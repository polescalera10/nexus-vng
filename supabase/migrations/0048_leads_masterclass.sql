-- ════════════════════════════════════════════════════════════════════════════
-- 0048 · leads de MASTERCLASS (nuevo tipo de entrada en `leads`)
--
-- Las masterclass son eventos sueltos: cambian de estilo, de profesor, de sala
-- y de fecha. Un lead con `origen = 'masterclass'` no dice a CUÁL se apuntó la
-- persona, y en cuanto haya dos abiertas a la vez la bandeja se vuelve inútil.
--
-- `evento_slug` es esa marca interna: la escribe el servidor a partir de la
-- ficha (`eventos.slug`), nunca el visitante, y no se enseña en la web. Permite
-- filtrar "quién se apuntó a la de bachazouk del 3 de octubre" sin depender del
-- texto libre de `modalidad_interes`, que es solo para leerlo.
--
-- Sin FK a `eventos`, por el mismo motivo que `modalidad_interes` (0007): si un
-- día se borra la ficha del evento, el lead tiene que sobrevivir con su marca.
--
-- No se añade un CHECK con la lista cerrada de `origen`: desde 0023 `leads` no
-- admite INSERT anónimo (solo entra por Server Action con service role, tras
-- Zod), así que la lista enumerada en la BD ya no defiende de nada y sí crea un
-- modo de fallo caro — añadir un origen en Zod sin migración tumbaría el
-- formulario en producción y se perderían leads. La lista válida vive en
-- `leadOrigenes` (src/lib/validation/lead.ts).
-- ════════════════════════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists evento_slug text;

-- Réplica en BD de los límites de Zod (masterclassLeadSchema) y del mismo
-- formato de slug que exige `eventos_slug_format` (0028).
alter table public.leads
  add constraint leads_evento_slug_format
    check (evento_slug is null or evento_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint leads_evento_slug_len
    check (evento_slug is null or char_length(evento_slug) between 2 and 80);

-- Parcial: solo los leads de evento llevan la columna; el resto son NULL y no
-- tienen por qué engordar el índice.
create index leads_evento_slug_idx
  on public.leads (evento_slug)
  where evento_slug is not null;

comment on column public.leads.evento_slug is
  'Slug de la ficha de `eventos` desde la que entró el lead (masterclass y demás eventos). Lo pone el servidor, no el formulario. Marca interna: no se enseña en la web.';
