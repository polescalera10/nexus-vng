import { todayInMadrid } from "@/lib/format";

/**
 * Fechas de las sesiones de un curso dentro de UN MES natural.
 *
 * Antes se generaban "las próximas N semanas desde hoy", y eso fallaba en el
 * caso normal: un mes ya empezado. El 08-09-2026 (martes), Bachata 1 de los
 * lunes generó el 14, 21, 28 de septiembre y el 5 de octubre — se saltó el
 * lunes 7, que ya había pasado, y se metió en el mes siguiente. Por mes
 * natural sale lo que se espera: 7, 14, 21 y 28.
 *
 * Se incluyen las fechas ya pasadas del mes a propósito: hacen falta para
 * pasar lista con retraso y para colgar el diario de una clase de la semana
 * anterior.
 */

/** Fecha local → "YYYY-MM-DD", sin sorpresas de zona horaria. */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** "YYYY-MM" del mes en curso en la zona de la escuela. */
export function currentMonthInMadrid(now: Date = new Date()): string {
  return todayInMadrid(now).slice(0, 7);
}

/** "2026-09" → "septiembre de 2026", para los mensajes de la UI. */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Todas las fechas del mes `month` ("YYYY-MM") que caen en `weekday`
 * (1=Lunes … 7=Domingo, convención del proyecto), acotadas por el rango del
 * curso si lo tiene.
 *
 * `startDate` es lo que evita inventar clases: los cursos arrancaron el lunes
 * 7 de septiembre de 2026, así que un curso de los martes no tuvo sesión el
 * martes 1 aunque caiga dentro del mes.
 */
export function sessionDatesForMonth(
  weekday: number,
  month: string,
  startDate?: string | null,
  endDate?: string | null,
): string[] {
  if (weekday < 1 || weekday > 7) return [];
  if (!/^\d{4}-\d{2}$/.test(month)) return [];

  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum || monthNum < 1 || monthNum > 12) return [];

  // weekday 1=Lun…7=Dom → getDay() 0=Dom…6=Sáb.
  const targetDay = weekday % 7;

  const cursor = new Date(year, monthNum - 1, 1);
  while (cursor.getDay() !== targetDay) cursor.setDate(cursor.getDate() + 1);

  const dates: string[] = [];
  while (cursor.getMonth() === monthNum - 1) {
    const iso = toISODate(cursor);
    const antesDeEmpezar = startDate ? iso < startDate : false;
    const despuesDeAcabar = endDate ? iso > endDate : false;
    if (!antesDeEmpezar && !despuesDeAcabar) dates.push(iso);
    cursor.setDate(cursor.getDate() + 7);
  }

  return dates;
}
