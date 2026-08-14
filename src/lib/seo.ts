import { site } from "@/lib/site";

/**
 * Imagen de Open Graph compartida por todas las páginas.
 *
 * Next NO fusiona el campo `openGraph`: en cuanto una página declara el suyo
 * en `generateMetadata`, sustituye entero al del layout raíz y se pierde la
 * imagen que genera `app/opengraph-image.tsx`. Por eso toda página con
 * `openGraph` propio tiene que incluir `images: ogImages` explícitamente —
 * si no, el enlace se comparte por WhatsApp sin miniatura.
 */
/**
 * Descripción para el SERP a partir de un texto en Markdown.
 *
 * Las fichas de evento cortaban el cuerpo a 150 caracteres a pelo y pegaban
 * "...": salían descripciones partidas a mitad de palabra ("…compartir risas
 * con la comunid...") y con saltos de línea del Markdown dentro. Aquí se
 * limpia el marcado y se corta por la última palabra entera antes del límite.
 */
export function metaDescripcion(markdown: string | null | undefined, max = 155): string {
  if (!markdown) return "";
  const limpio = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // enlaces → su texto
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const recortado = corte.slice(0, corte.lastIndexOf(" ")).replace(/[,;:]$/, "");
  // Si el corte cae justo al final de una frase, se queda como frase entera:
  // "…con la comunidad.…" es exactamente el defecto que veníamos a arreglar.
  return /[.!?]$/.test(recortado) ? recortado : `${recortado}…`;
}

/** Primera imagen de un texto en Markdown, si la hay (para OG y schema). */
export function primeraImagenMarkdown(markdown: string | null | undefined): string | null {
  const m = markdown?.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m?.[1] ?? null;
}

export const ogImages = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: `${site.name} — Escuela de baile en ${site.locality}`,
  },
];
