import type { Metadata } from "next";

/**
 * ¿Merece estar en el índice un listado con `n` elementos?
 *
 * Un listado vacío que dice "estamos preparando el calendario" es para Google
 * una página sin contenido (soft 404): resta calidad al sitio sin traer a
 * nadie. Le pasó a /eventos, indexable con 41 palabras (auditoría 15-09-2026).
 * En cuanto hay un elemento publicado, vuelve a ser indexable solo: sin tocar
 * código ni acordarse de quitar nada.
 */
export function listadoIndexable(n: number): boolean {
  return n > 0;
}

/**
 * `robots` para la metadata de un listado. `follow` se mantiene siempre: los
 * enlaces del menú y del pie siguen repartiendo autoridad aunque la página no
 * se indexe.
 */
export function robotsListado(n: number): Metadata["robots"] {
  return listadoIndexable(n) ? undefined : { index: false, follow: true };
}
