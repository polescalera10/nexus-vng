-- ════════════════════════════════════════════════════════════════════════════
-- 0052 · aclarar qué cuenta como story y reel
--
-- Los textos de 0050 ("Sube una story de NEXUS…") se leían como "comparte lo
-- que publica la cuenta de NEXUS". No es eso: el alumno crea su propio
-- contenido y etiqueta a @nexusvng (o, en el reel, nos invita como colaborador).
-- Solo cambia el texto de las dos reglas; puntos y topes quedan igual.
-- ════════════════════════════════════════════════════════════════════════════

update public.point_rules
set description = 'Crea tu propia story sobre NEXUS (una clase, un baile, tu rato aquí) y etiqueta a @nexusvng. No vale compartir una publicación de la cuenta de NEXUS.'
where code = 'story_instagram';

update public.point_rules
set description = 'Graba y publica tu propio reel sobre NEXUS y etiqueta a @nexusvng o invítanos como colaborador. No vale compartir un reel de la cuenta de NEXUS.'
where code = 'reel_instagram';
