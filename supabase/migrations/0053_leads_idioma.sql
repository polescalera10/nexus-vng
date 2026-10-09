-- ════════════════════════════════════════════════════════════════════════════
-- 0053 · idioma del lead
--
-- Desde el piloto en catalán (/ca, 09-10-2026) un lead puede llegar desde un
-- formulario en catalán. Se guarda para contestar en el mismo idioma. Los
-- leads anteriores son todos de la web en castellano: el default los cubre.
--
-- Columna nueva, sin políticas nuevas: la escritura sigue siendo solo de
-- servidor (0023) y la lectura, solo de admin.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.leads
  add column idioma text not null default 'es'
  constraint leads_idioma_valido check (idioma in ('es', 'ca'));
