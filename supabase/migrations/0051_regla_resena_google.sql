-- ════════════════════════════════════════════════════════════════════════════
-- 0051 · regla de puntos: reseña en Google
--
-- 50 puntos por dejar una reseña en la ficha de Google de NEXUS.
--
-- Se premia dejar la reseña, NO que sea positiva: pagar solo por las buenas es
-- práctica desleal (Directiva Omnibus / Ley 3/1991) y la política de Google lo
-- prohíbe. Por eso la regla no habla de nota y el texto pide contar la
-- experiencia tal y como fue.
--
-- Una sola vez por alumno: una cuenta de Google solo tiene una reseña por
-- local, así que repetir el apunte sería pagar dos veces lo mismo. Lo hace
-- cumplir un índice único parcial (convención del repo: reglas duras en la BD).
-- ════════════════════════════════════════════════════════════════════════════

insert into public.point_rules (code, label, points, source, active, orden, icon, description)
values (
  'resena_google', 'Reseña en Google', 50, 'manual', true, 7, 'estrella',
  'Deja tu opinión sobre NEXUS en Google, con la nota que de verdad pienses. Una sola vez.'
)
on conflict (code) do nothing;

create unique index point_events_resena_google_una_vez
  on public.point_events (student_id)
  where rule_code = 'resena_google' and points > 0;
