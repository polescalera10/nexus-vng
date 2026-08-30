-- ════════════════════════════════════════════════════════════════════════════
-- 0035 · El profesor pasa a llamarse "Pol", sin apellido
--
--   La web pública lleva desde el principio diciendo "Pol"
--   (`src/content/profesores.ts`, `/profesores/pol`) y el cartel de horarios
--   también. El panel era el único sitio con "Pol Escalera", así que profesor
--   y persona pública parecían dos.
--
--   `course_teachers` referencia por id, no por nombre: el reparto de 0034 no
--   se toca. La 0034 se deja tal cual — casaba por el nombre que había cuando
--   se aplicó, y reescribirla borraría el rastro de por qué existe esta.
-- ════════════════════════════════════════════════════════════════════════════

update public.teachers
set full_name = 'Pol'
where full_name = 'Pol Escalera';
