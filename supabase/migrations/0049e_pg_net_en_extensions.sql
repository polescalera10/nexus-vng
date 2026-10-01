-- ════════════════════════════════════════════════════════════════════════════
-- 0049e · pg_net fuera del esquema `public`
--
-- La primera versión de 0049d lo creó sin esquema y cayó en `public`, que es
-- el que expone PostgREST (asesor de Supabase `extension_in_public`). 0049d ya
-- lo crea en `extensions`; esta migración corrige las BD donde se aplicó la
-- versión anterior (producción, 01-10-2026).
--
-- pg_net no se puede mover con `alter extension … set schema`: se borra y se
-- vuelve a crear. Sus funciones viven siempre en el esquema `net`, así que el
-- job `informe-alumnos-diario` (que llama a `net.http_get`) no cambia.
-- ════════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
    select 1 from pg_extension e join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_net' and n.nspname = 'public'
  ) then
    drop extension pg_net;
    create extension pg_net with schema extensions;
  end if;
end;
$$;
