/**
 * Normalización de teléfonos.
 *
 * Los leads llegan de un formulario libre ("600 11 22 33", "+34 600112233",
 * "0034600112233") mientras que `students.phone` tiene un CHECK de E.164
 * (`students_phone_e164`, migración 0020) y el módulo de WhatsApp necesita
 * solo dígitos. Aquí está la única conversión entre ambos mundos.
 */

/**
 * Solo dígitos, con prefijo de país y SIN "+". Los de 9 dígitos se asumen
 * españoles (+34), que es de donde llegan todos los leads de la escuela; el
 * `00` internacional se recorta. Devuelve null si no queda un número usable.
 */
export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 9) return `34${digits}`;
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/**
 * Formato E.164 (`+34600112233`), que es lo que exige `students.phone`.
 * Devuelve null si el número de partida no es convertible.
 */
export function toE164(phone: string): string | null {
  const digits = normalizePhone(phone);
  return digits ? `+${digits}` : null;
}
