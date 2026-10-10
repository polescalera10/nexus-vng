import type { ResenaGoogle, ResenasGoogle } from "@/lib/google-reviews";

/**
 * Qué reseñas de Google se enseñan en la ficha de cada clase
 * (`/clases/[modalidad]`, que es también la landing de los anuncios).
 *
 * Regla de Pol (10-10-2026): en la ficha de una clase sale una reseña que hable
 * de ESA clase o una que hable de las clases en general. Nunca una que nombre
 * otra disciplina: en bachata no puede salir un comentario de salsa.
 *
 * La clasificación es por texto, sin etiquetar a mano, para que las reseñas
 * nuevas se coloquen solas. Una reseña es:
 *   · general: no nombra ninguna disciplina → vale para todas las fichas;
 *   · de clase: nombra disciplinas y TODAS son de esta ficha → vale aquí;
 *   · ajena: nombra alguna disciplina que no es de esta ficha → no sale. Una
 *     reseña de "salsa y bachata" no sale en ninguna de las dos, por la misma
 *     razón por la que no sale la de reparto en la de bachata.
 *
 * Directiva Ómnibus: la selección es por TEMA, nunca por nota, y la ficha lo
 * dice en el aviso. Se enseña el texto literal, sin retocar.
 */

type Disciplina = "salsa" | "bachata" | "reparto" | "reggaeton" | "heels" | "sexy" | "lady";

/** Cómo se nombra cada disciplina en una reseña (castellano y catalán). */
const PATRONES: Record<Disciplina, RegExp> = {
  salsa: /\bsalsa/i,
  bachata: /\bbachata/i,
  reparto: /\breparto/i,
  reggaeton: /\breggaet[oó]n/i,
  heels: /\bheels?\b|\btac[oó]n(?:es)?\b|\btalons\b/i,
  sexy: /\bsexy\b/i,
  lady: /\blady\b/i,
};

/**
 * Disciplinas que cuentan como "de esta ficha", por slug. Las de lady y las de
 * compañía comparten familia con su estilo base (una reseña de "salsa" vale en
 * Lady Salsa). Una ficha que no esté aquí solo recibe reseñas generales.
 */
const DE_LA_FICHA: Record<string, readonly Disciplina[]> = {
  "salsa-cubana": ["salsa"],
  bachata: ["bachata"],
  reparto: ["reparto"],
  reggaeton: ["reggaeton"],
  "lady-style-salsa": ["salsa", "lady"],
  "lady-style-bachata": ["bachata", "lady"],
  heels: ["heels"],
  "sexy-style": ["sexy"],
  "cia-salsa": ["salsa"],
  "cia-bachata-lady": ["bachata", "lady"],
};

/** Disciplinas que nombra el texto de una reseña. */
export function disciplinasMencionadas(texto: string): Disciplina[] {
  return (Object.keys(PATRONES) as Disciplina[]).filter((d) => PATRONES[d].test(texto));
}

/**
 * Reseñas que pueden salir en la ficha `slug`: primero las que hablan de esa
 * clase y después las generales, cada grupo de la más reciente a la más
 * antigua. Pura, para probarla sin red.
 */
export function resenasParaClase(resenas: ResenaGoogle[], slug: string, max: number): ResenaGoogle[] {
  const propias = DE_LA_FICHA[slug] ?? [];
  const deClase: ResenaGoogle[] = [];
  const generales: ResenaGoogle[] = [];

  for (const r of resenas) {
    const nombradas = disciplinasMencionadas(r.texto);
    if (nombradas.length === 0) generales.push(r);
    else if (nombradas.every((d) => propias.includes(d))) deClase.push(r);
  }

  const masReciente = (a: ResenaGoogle, b: ResenaGoogle) => (b.publicada ?? "").localeCompare(a.publicada ?? "");
  return [...deClase.sort(masReciente), ...generales.sort(masReciente)].slice(0, max);
}

/**
 * La ficha de Google con solo las reseñas que caben en `slug`. La nota y el
 * total siguen siendo los de la escuela entera (el aviso lo dice). Sin reseñas
 * aplicables, `null`: la ficha no pinta el bloque y no hay hueco que rellenar.
 */
export function fichaParaClase(datos: ResenasGoogle | null, slug: string, max: number): ResenasGoogle | null {
  if (!datos) return null;
  const resenas = resenasParaClase(datos.resenas, slug, max);
  return resenas.length === 0 ? null : { ...datos, resenas };
}
