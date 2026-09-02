-- 0042 — El teléfono del alumno pasa a ser texto libre.
--
-- Motivo: la escuela apunta gente con números de aquí y de fuera, escritos de
-- mil formas. El CHECK estricto de E.164 (`students_phone_e164`, migración
-- 0020) rechazaba altas legítimas y obligaba a "arreglar" el número a mano
-- antes de poder crear la ficha. Ahora se replica el check laxo de
-- `teachers_phone_chars`: solo dígitos y símbolos de teléfono.
--
-- La app sigue intentando normalizar a E.164 al guardar (lib/phone.ts) para
-- que el módulo de WhatsApp reciba el formato de siempre en los números que sí
-- se dejan deducir; lo que no encaje se guarda tal cual.

alter table public.students
  drop constraint if exists students_phone_e164;

alter table public.students
  add constraint students_phone_chars
    check (char_length(phone) between 6 and 25 and phone ~ '^[+0-9\s().-]+$');

comment on constraint students_phone_chars on public.students is
  'Teléfono en texto libre (réplica de phoneSchema en validation/student.ts). Sustituye al E.164 estricto de 0020: los alumnos de fuera traen formatos de todo tipo.';
