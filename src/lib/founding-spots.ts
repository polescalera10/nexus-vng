/**
 * Qué significa el aforo de la promoción fundadora, y cómo se pinta.
 *
 * El tipo vive aquí (no en `queries/founding.ts`) por el mismo motivo que
 * `enrollment-capacity.ts`: la lógica de lectura la comparten componentes que
 * no consultan nada, y así no arrastran el cliente de Supabase.
 */
export type FoundingSpots = {
  /**
   * Plazas libres. `null` = no hay dato fiable (Supabase caído, o `spotsTotal`
   * sin declarar): el contador y la barra NO se pintan. Nunca se rellena con una
   * cifra de respaldo — anunciar "quedan 10" porque la base de datos no contesta
   * es un reclamo de escasez falso (Directiva Omnibus / RDL 24/2021).
   */
  left: number | null;
  total: number | null;
};

/** No hay recuento: el bloque de plazas se oculta. */
export const SIN_DATO: FoundingSpots = { left: null, total: null };

/** ¿Hay recuento suficiente para pintar cifra y barra? */
export function tieneAforo(spots: FoundingSpots): spots is { left: number; total: number } {
  return spots.left !== null && spots.total !== null && spots.total > 0;
}

/**
 * Ancho de la barra de plazas, en porcentaje.
 *
 * El suelo del 6 % existe para que UNA sola plaza ocupada se vea en una barra de
 * 10. Con cero ocupadas devuelve 0: una barra que arranca llena sugiere
 * inscripciones que no existen.
 */
export function barraPct(ocupadas: number, total: number): number {
  if (ocupadas <= 0 || total <= 0) return 0;
  return Math.max(6, Math.round((ocupadas / total) * 100));
}
