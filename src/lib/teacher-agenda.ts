import { todayInMadrid } from "@/lib/format";

/**
 * Lógica pura de la agenda del profesor, separada de la query para poder
 * probarla sin Supabase.
 *
 * "Hoy" es siempre el día de Madrid: Vercel corre en UTC y entre las 00:00 y
 * las 02:00 de Madrid (verano) el reloj del servidor aún va por el día anterior.
 * La cabecera de la página y las listas salen de este mismo `todayIso`, así que
 * no pueden discrepar.
 */

/** Días que abarca «Próximas» después de hoy. */
export const AGENDA_HORIZON_DAYS = 7;

/** "YYYY-MM-DD" + n días → "YYYY-MM-DD". Aritmética en UTC: sin cambios de hora. */
export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Rango de fechas de la agenda (ambos extremos incluidos). */
export function teacherAgendaWindow(now: Date = new Date()): {
  todayIso: string;
  horizonIso: string;
} {
  const todayIso = todayInMadrid(now);
  return { todayIso, horizonIso: addDaysIso(todayIso, AGENDA_HORIZON_DAYS) };
}

/** Reparte sesiones ya ordenadas entre hoy y próximas. Las pasadas se descartan. */
export function splitTeacherAgenda<T extends { session: { session_date: string } }>(
  items: T[],
  todayIso: string,
): { today: T[]; upcoming: T[] } {
  return {
    today: items.filter((i) => i.session.session_date === todayIso),
    upcoming: items.filter((i) => i.session.session_date > todayIso),
  };
}
