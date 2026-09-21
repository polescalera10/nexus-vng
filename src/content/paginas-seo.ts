/**
 * Páginas de entrada SEO — URLs de nivel raíz con intención propia.
 *
 * QUÉ SON Y QUÉ NO SON
 *
 * No son fichas de disciplina. `/clases/[modalidad]` responde "qué es este
 * baile y cómo es su clase"; estas responden a una consulta distinta que hoy
 * no tiene página: el estilo genérico ("clases de salsa", sin saber que hay
 * cubana y en línea), una objeción ("sin pareja", "desde cero"), el precio o
 * un municipio del Garraf.
 *
 * POR QUÉ NO SON LAS `/l/` OTRA VEZ
 *
 * Las 30 landings de campaña se sacaron del índice el 14-08-2026 por el mismo
 * patrón que castiga el sistema de contenido útil: 94 % de similitud de texto
 * entre ellas, misma plantilla rellenada con variables y cero enlaces
 * internos. La diferencia aquí es de fondo, no de plantilla:
 *
 *   1. Cada página tiene un `cuerpo` escrito entero, distinto del de las
 *      demás. Nada se genera combinando variables.
 *   2. Cada una tiene su propio bloque de preguntas, sin repetir ninguna.
 *   3. Todas enlazan hacia la ficha o la guía que profundiza, y reciben
 *      enlaces desde ella. Ninguna queda huérfana.
 *   4. `keywordPrincipal` es única en todo el sitio: dos páginas no pueden
 *      declarar la misma consulta. Lo comprueba `tests/unit/paginas-seo.test.ts`.
 *
 * REGLA DE CANIBALIZACIÓN
 *
 * Si una consulta ya tiene dueño (la home tiene "clases de baile en Vilanova i
 * la Geltrú", `/clases/bachata` tiene "clases de bachata en Vilanova"), aquí
 * NO se abre página. Se enlaza a la que ya existe. El campo `noCanibaliza`
 * documenta, página a página, de quién se diferencia y por qué.
 *
 * SCHEMA
 *
 * Estas páginas NO emiten `Course`: ese nodo vive en la ficha de disciplina y
 * duplicarlo mandaría a Google dos candidatos para el mismo resultado
 * enriquecido. Emiten `FAQPage` y `BreadcrumbList`, y heredan el
 * `DanceSchool` del layout raíz.
 */

import { salsaVilanova } from "@/content/paginas-seo/clases-de-salsa-en-vilanova";
import { sinPareja } from "@/content/paginas-seo/clases-de-baile-sin-pareja";
import { desdeCero } from "@/content/paginas-seo/aprender-a-bailar-desde-cero";
import { preciosBaile } from "@/content/paginas-seo/precios-clases-de-baile-vilanova";
import { santPereDeRibes } from "@/content/paginas-seo/clases-de-baile-sant-pere-de-ribes";
import { sitges } from "@/content/paginas-seo/clases-de-baile-sitges";
import { enTacones } from "@/content/paginas-seo/clases-de-baile-en-tacones";

export type EnlaceSeo = {
  /** Ruta interna ("/clases/salsa-cubana"). */
  href: string;
  /** Texto del enlace. Es el ancla: descriptiva, nunca "haz clic aquí". */
  label: string;
  /** Por qué ir ahí. Sale bajo el enlace en el bloque "Sigue por aquí". */
  texto: string;
};

export type PaginaSeo = {
  /** Slug de primer nivel: la URL es `/${slug}`. */
  slug: string;
  /**
   * Consulta que ataca la página. ÚNICA en todo el registro: si otra página ya
   * la tiene, esta no existe (ver regla de canibalización arriba).
   */
  keywordPrincipal: string;
  /** Consultas secundarias que la página cubre de verdad en el cuerpo. */
  keywordsSecundarias: string[];
  /** De qué página del sitio se diferencia y en qué. Para revisiones futuras. */
  noCanibaliza: string;
  /** Title SEO sin el sufijo " · NEXUS VNG" de la plantilla: ≤48 caracteres. */
  metaTitle: string;
  /** Meta description: 120–155 caracteres, con ciudad y llamada a la acción. */
  description: string;
  /** Antetítulo de la banda de cabecera. */
  eyebrow: string;
  /** H1 visible. Lleva la keyword principal. */
  h1: string;
  /** Entradilla bajo el H1. */
  lead: string;
  /** Cuerpo en Markdown (lo pinta `MarkdownRenderer`). Escrito entero, no generado. */
  cuerpo: string;
  /**
   * Estilos del cartel semanal que se pintan como horario real, sin número de
   * nivel ("Salsa 1" → "Salsa"). Vacío = la página no muestra horario.
   */
  estilosHorario: string[];
  /** Preguntas propias de esta página. No se repiten entre páginas ni con /faq. */
  faq: { q: string; a: string }[];
  /** Bloque "Sigue por aquí": el enlace de ida del enlazado interno. */
  enlaces: EnlaceSeo[];
  /**
   * Primer mensaje que se prerrellena en el chat desde CUALQUIER CTA de esta
   * página (sticky, cabecera, pie). Sin esto, los leads de estas URLs llegan
   * con el texto genérico y no se sabe de qué venían (ver `lib/wa-page-context`).
   */
  waMensaje: string;
  /** Imagen de cabecera, de `public/media/` (material real). */
  imagen: { src: string; alt: string; ancho: number; alto: number };
  /** `lastmod` del sitemap. YYYY-MM-DD. */
  actualizado: string;
};

export const paginasSeo: PaginaSeo[] = [
  salsaVilanova,
  sinPareja,
  desdeCero,
  preciosBaile,
  santPereDeRibes,
  sitges,
  enTacones,
];

export function getPaginaSeo(slug: string): PaginaSeo | undefined {
  return paginasSeo.find((p) => p.slug === slug);
}

export function listPaginaSeoSlugs(): string[] {
  return paginasSeo.map((p) => p.slug);
}

/**
 * Páginas de entrada que enlazan a una ruta dada: el enlace de VUELTA.
 *
 * Una ficha de disciplina lo usa para enlazar a las páginas que hablan de ella
 * sin tener que mantener la lista a mano en los dos sitios. Mismo mecanismo
 * que `articulosDeDisciplina` en el blog.
 */
export function paginasQueEnlazanA(href: string): PaginaSeo[] {
  return paginasSeo.filter((p) => p.enlaces.some((e) => e.href === href));
}
