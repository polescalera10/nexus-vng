-- ════════════════════════════════════════════════════════════════════════════
-- 0033 · Aforos reales del curso 26·27
--
--   El catálogo se cargó el 30-08-2026 con 0/0 en las 15 clases, que hasta
--   ahora el código leía como "no se controla el aforo". Al declarar los
--   números de verdad ese 0 cambia de significado: en los estilos lady
--   —Bachata Lady, Cía Lady Bachata, Heels, Sexy Style, Lady Salsa— hay
--   0 leaders porque **no entra ningún leader**, no porque entren todos.
--
--   La lectura nueva vive en `src/lib/enrollment-capacity.ts`: 0 = ese rol no
--   se admite. Es la que ya hacía la UI, que lleva desde el principio pintando
--   "3/10 leaders".
--
--   Se filtra por nombre y no por id: los ids son generados y el nombre es lo
--   que distingue un estilo lady del resto.
-- ════════════════════════════════════════════════════════════════════════════

-- Estilos lady: solo followers.
update public.courses
set capacity_leaders = 0,
    capacity_followers = 20
where name in ('Bachata Lady', 'Cía Lady Bachata', 'Heels', 'Sexy Style', 'Lady Salsa');

-- El resto (salsa, bachata, cía salsa, reparto, reggaetón): parejas 10/10.
update public.courses
set capacity_leaders = 10,
    capacity_followers = 10
where name not in ('Bachata Lady', 'Cía Lady Bachata', 'Heels', 'Sexy Style', 'Lady Salsa');
