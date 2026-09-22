/**
 * Enlaces de navegación del sitio público.
 * Fuente única para la cabecera de la landing, la de las páginas de soporte y
 * el menú móvil: una sola lista para que no se desincronicen (hasta el
 * 22-09-2026 la landing enseñaba «Horarios» y las de soporte «Intensivos»).
 */
import type { Locale } from "@/i18n/locales";

export type NavLink = { href: string; label: string };

/**
 * Nav del sitio en castellano. `/intensivos` NO va aquí: la edición de agosto
 * terminó y la página se queda solo como histórico (la enlazan las páginas SEO
 * y el sitemap), no como una oferta activa.
 */
export const NAV_ES: readonly NavLink[] = [
  { href: "/clases", label: "Clases" },
  { href: "/socio-fundador", label: "Socio fundador" },
  { href: "/profesores", label: "Profesores" },
  { href: "/eventos", label: "Eventos" },
  { href: "/horarios", label: "Horarios" },
  { href: "/faq", label: "FAQ" },
];

/**
 * Nav de las páginas en catalán. Solo las páginas que existen en catalán:
 * el resto se enlaza desde el pie, marcado como «en castellà».
 */
export const NAV_CA: readonly NavLink[] = [
  { href: "/ca/classes", label: "Classes" },
  { href: "/ca/horaris", label: "Horaris" },
  { href: "/ca/contacte", label: "Contacte" },
];

export function navEn(locale: Locale): readonly NavLink[] {
  return locale === "ca" ? NAV_CA : NAV_ES;
}
