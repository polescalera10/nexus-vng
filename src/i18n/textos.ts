import type { Locale } from "@/i18n/locales";

/**
 * Declara un bloque de textos en los dos idiomas.
 *
 * El tipo sale SOLO del castellano (`NoInfer` en el catalán): si al catalán le
 * falta una clave, o una función recibe otros argumentos, `tsc` falla. Así no
 * se puede publicar una página a medio traducir sin enterarse.
 */
export function pares<T>(es: T, ca: NoInfer<T>): Record<Locale, T> {
  return { es, ca };
}
