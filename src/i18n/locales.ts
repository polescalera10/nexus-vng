/**
 * Idiomas de la web pública.
 *
 * El castellano es el idioma por defecto y el de todas las URLs sin prefijo.
 * El catalán vive bajo `/ca` y, de momento, solo en las páginas del piloto
 * (ver `rutas.ts`). El área privada y las landings de campaña siguen solo en
 * castellano.
 */
export type Locale = "es" | "ca";

export const LOCALES: readonly Locale[] = ["es", "ca"];

/** Etiqueta BCP 47: `inLanguage` del schema y `Intl`. */
export const BCP47: Record<Locale, string> = { es: "es-ES", ca: "ca-ES" };

/** `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { es: "es_ES", ca: "ca_ES" };

export function esLocale(valor: unknown): valor is Locale {
  return valor === "es" || valor === "ca";
}
