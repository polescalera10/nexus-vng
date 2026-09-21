/**
 * Artículos del blog — fuente única de /blog, /blog/[slug], el sitemap y el
 * bloque "Del blog" de las fichas de disciplina.
 *
 * Todo artículo pasa por la skill `blog` antes de entrar aquí (CLAUDE.md
 * global): brief, borrador, pasada anti-IA, `analyze_blog.py` con 90 o más y
 * checklist SEO. Y por la regla de honestidad del proyecto: nada de datos,
 * testimonios ni experiencias inventadas. Lo que se cuenta de la escuela lo ha
 * confirmado Pol.
 *
 * Con la lista vacía, /blog existe pero va en `noindex` y fuera del sitemap
 * (lib/indexable.ts), y el enlace del pie no se pinta.
 */

// Cada artículo vive en su fichero (`content/blog/<slug>.ts`), generado desde
// su borrador en `docs/borradores/`. Aquí solo se registran.
import { salsaCubanaOBachata } from "@/content/blog/salsa-cubana-o-bachata";
import { primeraClaseDeBaile } from "@/content/blog/primera-clase-de-baile";
import { ruedaDeCasino } from "@/content/blog/rueda-de-casino";
import { zapatosParaBailar } from "@/content/blog/zapatos-para-bailar";
import { dondeBailarGarraf } from "@/content/blog/donde-bailar-garraf";
import { cuantoSeTardaEnAprender } from "@/content/blog/cuanto-se-tarda-en-aprender";
import { tiposDeBachata } from "@/content/blog/tipos-de-bachata";
import { beneficiosDeBailar } from "@/content/blog/beneficios-de-bailar";
import { bailarAPartirDeLos40 } from "@/content/blog/bailar-a-partir-de-los-40";
import { comoElegirEscuelaDeBaile } from "@/content/blog/como-elegir-escuela-de-baile";

export type Articulo = {
  slug: string;
  /** H1 visible. */
  titulo: string;
  /** Title SEO sin el sufijo " · NEXUS VNG" de la plantilla: ≤48 caracteres. */
  metaTitle: string;
  /** Meta description: 120–155 caracteres. */
  description: string;
  /** Entradilla bajo el H1 y resumen en el listado. */
  resumen: string;
  /** Fechas en YYYY-MM-DD. `actualizado` es el `lastmod` del sitemap. */
  publicado: string;
  actualizado: string;
  /** Autoría real. Si firma un profe, su slug enlaza a su ficha. */
  autor: { nombre: string; profesorSlug?: string };
  /** Slugs de `/clases/[modalidad]` con los que se enlaza en los dos sentidos. */
  disciplinas: string[];
  /** Imagen de cabecera, de `public/media/` (material real). */
  imagen: { src: string; alt: string; ancho: number; alto: number };
  /** Cuerpo en Markdown (lo pinta `MarkdownRenderer`). */
  cuerpo: string;
};

export const articulos: Articulo[] = [
  salsaCubanaOBachata,
  primeraClaseDeBaile,
  ruedaDeCasino,
  zapatosParaBailar,
  dondeBailarGarraf,
  cuantoSeTardaEnAprender,
  tiposDeBachata,
  beneficiosDeBailar,
  bailarAPartirDeLos40,
  comoElegirEscuelaDeBaile,
];

/** Más reciente primero. */
export function articulosOrdenados(lista: readonly Articulo[] = articulos): Articulo[] {
  return [...lista].sort((a, b) => b.publicado.localeCompare(a.publicado));
}

export function getArticulo(slug: string): Articulo | undefined {
  return articulos.find((a) => a.slug === slug);
}

export function listArticuloSlugs(): string[] {
  return articulos.map((a) => a.slug);
}

/** Artículos que tratan una disciplina: el enlace de vuelta desde su ficha. */
export function articulosDeDisciplina(slug: string, lista: readonly Articulo[] = articulos): Articulo[] {
  return articulosOrdenados(lista.filter((a) => a.disciplinas.includes(slug)));
}
