/**
 * Enlaces de navegación del sitio público.
 * Fuente única para la cabecera de escritorio y el menú móvil, de modo que
 * ambos no se desincronicen.
 */
import type { Locale } from "@/i18n/locales";

export type NavLink = { href: string; label: string };

/** Nav de la landing (cabecera transparente sobre el hero). */
export const NAV_LANDING: readonly NavLink[] = [
  { href: "/clases", label: "Clases" },
  { href: "/socio-fundador", label: "Socio fundador" },
  { href: "/profesores", label: "Profesores" },
  { href: "/eventos", label: "Eventos" },
  { href: "/horarios", label: "Horarios" },
  { href: "/faq", label: "FAQ" },
];

/** Nav de las páginas de soporte (cabecera sólida). */
export const NAV_SITE: readonly NavLink[] = [
  { href: "/clases", label: "Clases" },
  { href: "/socio-fundador", label: "Socio fundador" },
  { href: "/intensivos", label: "Intensivos" },
  { href: "/profesores", label: "Profesores" },
  { href: "/eventos", label: "Eventos" },
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

export function navEn(locale: Locale, variante: "landing" | "site"): readonly NavLink[] {
  if (locale === "ca") return NAV_CA;
  return variante === "landing" ? NAV_LANDING : NAV_SITE;
}
