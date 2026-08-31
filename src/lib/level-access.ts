/**
 * Regla de nivel de la plaza fundadora.
 *
 * "Todas las disciplinas de tu nivel o inferior": se puede bajar, no saltar
 * (posicionamiento confirmado por Pol el 01-08-2026, `/socio-fundador`).
 *
 * Es un **aviso, no un bloqueo**: quien decide si alguien está listo para
 * subir de nivel es el profe, no el panel. Lógica pura, sin cliente de
 * Supabase, igual que `enrollment-capacity.ts`.
 */

export type LevelCheck =
  /** El nivel del curso es el suyo o inferior. */
  | { kind: "ok" }
  /** Falta el nivel del alumno o el del curso: no hay nada que comparar. */
  | { kind: "unknown" }
  /** El curso va por encima de su nivel. */
  | { kind: "above"; studentLevel: string; courseLevel: string };

/**
 * `orden` de `niveles` (0003): cero absoluto → avanzado, de menor a mayor.
 * Un curso sin nivel (`nivel_id` null) es abierto a todos: no hay salto.
 */
export function checkLevel(
  student: { orden: number; nombre: string } | null,
  course: { orden: number; nombre: string } | null,
): LevelCheck {
  if (!course) return { kind: "ok" };
  if (!student) return { kind: "unknown" };
  if (course.orden <= student.orden) return { kind: "ok" };
  return { kind: "above", studentLevel: student.nombre, courseLevel: course.nombre };
}

export function aboveLevelMessage(check: Extract<LevelCheck, { kind: "above" }>): string {
  return `Ojo: ${check.courseLevel} está por encima de su nivel (${check.studentLevel}). Se puede bajar de nivel, no saltar.`;
}
