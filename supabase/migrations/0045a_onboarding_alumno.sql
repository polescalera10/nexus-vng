-- ════════════════════════════════════════════════════════════════════════════
-- 0045a · onboarding del alumno (10-09-2026)
--
-- `onboarding_seen_at` marca que ya se le ha explicado el área. Va en la ficha
-- y no en el navegador: con localStorage, el alumno que entra desde el móvil y
-- desde el portátil recibe la bienvenida dos veces, y quien limpia la caché la
-- recibe para siempre.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.students add column if not exists onboarding_seen_at timestamptz;

comment on column public.students.onboarding_seen_at is
  'Cuándo vio el alumno la bienvenida del área privada. Null = todavía no la ha visto.';
