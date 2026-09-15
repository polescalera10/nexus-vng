-- 0046e · `search_path` fijo en `lead_identity_key`.
--
-- Solo usa funciones de pg_catalog (regexp_replace, translate, lower…), que se
-- resuelven siempre aunque el search_path esté vacío. Fijarlo impide que un rol
-- con CREATE en algún schema del path la secuestre con una función homónima.
-- Lint 0011_function_search_path_mutable.

alter function public.lead_identity_key(text, text) set search_path = '';
