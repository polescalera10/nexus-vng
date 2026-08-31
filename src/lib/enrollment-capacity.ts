import type { EnrollmentRole } from "@/types/database";

/**
 * Qué significa el aforo de un curso.
 *
 * `capacity_leaders` / `capacity_followers` nacieron en 0013 con default 0 y,
 * mientras el catálogo estuvo entero a 0/0, el código leyó ese 0 como "no se
 * controla". Al declarar los aforos reales (30-08-2026) esa lectura dejó de
 * servir: las clases de estilo lady —Bachata Lady, Cía Lady Bachata, Heels,
 * Sexy Style, Lady Salsa— van a 0 leaders y 20 followers, y "0 leaders" ahí
 * significa que no entra ningún leader, no que entren todos los que quieran.
 *
 * Así que **0 = ese rol no se admite en la clase**, y el aforo se declara
 * siempre. Es la lectura que ya hacía la UI, que lleva desde el principio
 * pintando "3/10 leaders".
 */

export type RoleCapacity =
  /** El curso no admite ese rol. No es lista de espera: es que no va. */
  | { kind: "closed" }
  /** Quedan plazas. */
  | { kind: "open"; free: number }
  /** Aforo completo: cabe en lista de espera. */
  | { kind: "full" };

export type CourseCapacity = Pick<
  { capacity_leaders: number; capacity_followers: number },
  "capacity_leaders" | "capacity_followers"
>;

export function capacityFor(course: CourseCapacity, role: EnrollmentRole): number {
  return role === "leader" ? course.capacity_leaders : course.capacity_followers;
}

export function roleCapacity(
  course: CourseCapacity,
  role: EnrollmentRole,
  activeCount: number,
): RoleCapacity {
  const capacity = capacityFor(course, role);
  if (capacity <= 0) return { kind: "closed" };
  if (activeCount >= capacity) return { kind: "full" };
  return { kind: "open", free: capacity - activeCount };
}

const ROLE_LABEL: Record<EnrollmentRole, string> = {
  leader: "leaders",
  follower: "followers",
};

/** Por qué no se puede matricular a alguien con ese rol en ese curso. */
export function closedRoleMessage(courseName: string, role: EnrollmentRole): string {
  return `${courseName} no admite ${ROLE_LABEL[role]}.`;
}

// ── Plaza fundadora ─────────────────────────────────────────────────────────

/**
 * ¿La plaza de socio fundador se salta el aforo?
 *
 * Decisión de Pol (31-08-2026): **sí, avisa pero no bloquea**. La plaza se
 * vendió como acceso a todas las disciplinas del nivel, y mandar a lista de
 * espera a quien paga la tarifa alta es justo lo contrario de lo prometido.
 * El aviso queda para que el admin sepa que esa clase va sobre aforo.
 *
 * Para endurecerlo (fundador a lista de espera como cualquiera) basta con
 * poner esto en false: `effectiveCapacity` vuelve a devolver `full`.
 */
export const FOUNDING_BYPASSES_CAPACITY = true;

export type EffectiveCapacity =
  | RoleCapacity
  /** Cabe porque es fundador, pero la clase queda por encima de su aforo. */
  | { kind: "overbooked"; over: number };

/**
 * Aforo tal y como aplica a un alumno concreto.
 *
 * `closed` no se levanta nunca: que una clase no admita leaders no es una
 * cuestión de cupo, es que la plaza no existe (0033). Ni la tarifa fundadora
 * mete a un leader en Heels.
 */
export function effectiveCapacity(
  course: CourseCapacity,
  role: EnrollmentRole,
  activeCount: number,
  isFoundingMember: boolean,
): EffectiveCapacity {
  const base = roleCapacity(course, role, activeCount);
  if (base.kind !== "full") return base;
  if (!isFoundingMember || !FOUNDING_BYPASSES_CAPACITY) return base;
  return { kind: "overbooked", over: activeCount + 1 - capacityFor(course, role) };
}

/** Aviso para el admin cuando un fundador entra en una clase llena. */
export function overbookedMessage(
  courseName: string,
  role: EnrollmentRole,
  over: number,
): string {
  return `${courseName} estaba al completo de ${ROLE_LABEL[role]}: entra por plaza fundadora y la clase queda ${over} por encima del aforo.`;
}
