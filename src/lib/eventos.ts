import type { Evento } from "@/types/database";

/**
 * Helpers de agenda de eventos, compartidos por la ficha pública y la Server
 * Action de inscripción: si cada una decidiera por su cuenta cuándo un evento
 * "ya pasó", el formulario podría estar oculto y seguir aceptando altas (o al
 * revés).
 */

/** Fin real del evento: `fecha_fin` si está puesta, si no la de inicio. */
export function finDelEvento(e: Pick<Evento, "fecha" | "fecha_fin">): number {
  return new Date(e.fecha_fin ?? e.fecha).getTime();
}

/**
 * ¿El evento ya terminó? Se compara contra el fin, no contra el inicio: una
 * masterclass de 18 a 20 h sigue siendo "de hoy" a las 18:30.
 */
export function eventoTerminado(
  e: Pick<Evento, "fecha" | "fecha_fin">,
  ahora: Date = new Date(),
): boolean {
  return finDelEvento(e) < ahora.getTime();
}

/** ¿Se puede uno inscribir? Masterclass publicada que todavía no ha terminado. */
export function admiteInscripcion(
  e: Pick<Evento, "tipo" | "fecha" | "fecha_fin">,
  ahora: Date = new Date(),
): boolean {
  return e.tipo === "masterclass" && !eventoTerminado(e, ahora);
}
