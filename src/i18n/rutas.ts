import type { Locale } from "@/i18n/locales";

/**
 * Parejas de URLs castellano ↔ catalán.
 *
 * Solo las páginas del piloto en catalán (decisión de Pol, 17-09-2026). Una
 * página sin pareja no lleva hreflang ni selector de idioma en la cabecera, y
 * los enlaces desde la versión catalana van a su URL en castellano.
 *
 * Para añadir una página: su pareja aquí, su ruta en `app/(ca)/ca/`, su fila en
 * `content/actualizaciones.ts` y sus textos en los dos idiomas.
 */
export const PAREJAS: ReadonlyArray<readonly [es: string, ca: string]> = [
  ["/", "/ca"],
  ["/clases", "/ca/classes"],
  ["/clases/salsa-cubana", "/ca/classes/salsa-cubana"],
  ["/clases/bachata", "/ca/classes/bachata"],
  ["/horarios", "/ca/horaris"],
  ["/contacto", "/ca/contacte"],
];

/** Disciplinas con ficha en catalán. */
export const MODALIDADES_CA: readonly string[] = ["salsa-cubana", "bachata"];

const A_CA = new Map(PAREJAS.map(([es, ca]) => [es, ca]));
const A_ES = new Map(PAREJAS.map(([es, ca]) => [ca, es]));

/** Quita query, hash y barra final. */
function limpia(path: string): string {
  const sin = path.split(/[?#]/)[0] || "/";
  return sin.length > 1 ? sin.replace(/\/+$/, "") : sin;
}

export function idiomaDeRuta(path: string | null | undefined): Locale {
  const p = limpia(path ?? "/");
  return p === "/ca" || p.startsWith("/ca/") ? "ca" : "es";
}

/**
 * La misma página en el otro idioma, o `null` si no tiene pareja.
 * Con el idioma de la propia ruta devuelve la ruta tal cual.
 */
export function rutaEn(path: string, locale: Locale): string | null {
  const p = limpia(path);
  if (idiomaDeRuta(p) === locale) return p;
  return (locale === "ca" ? A_CA.get(p) : A_ES.get(p)) ?? null;
}

/**
 * Enlace interno desde una página en `locale`. Recibe la ruta en castellano
 * (con ancla si hace falta) y devuelve la catalana cuando existe; si no, la
 * castellana. Para saber si el destino cambia de idioma, `tieneVersion`.
 */
export function enlace(pathEs: string, locale: Locale): string {
  if (locale === "es") return pathEs;
  const [ruta = "/", ancla] = pathEs.split("#");
  const ca = A_CA.get(limpia(ruta));
  if (!ca) return pathEs;
  return ancla ? `${ca}#${ancla}` : ca;
}

export function tieneVersion(pathEs: string, locale: Locale): boolean {
  return locale === "es" || A_CA.has(limpia(pathEs.split("#")[0] ?? "/"));
}

/**
 * `alternates` de `generateMetadata` para una página con pareja: canonical a
 * sí misma y hreflang recíproco, con el castellano como `x-default`. Sin
 * pareja, solo el canonical.
 */
export function alternatesDe(path: string) {
  const p = limpia(path);
  const es = rutaEn(p, "es");
  const ca = rutaEn(p, "ca");
  if (!es || !ca) return { canonical: p };
  return { canonical: p, languages: { es, ca, "x-default": es } };
}
