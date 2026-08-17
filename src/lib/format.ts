/**
 * Helpers de formato compartidos por el panel interno.
 * Convención weekday: 1=Lunes … 7=Domingo (heredada de la tabla `clases`).
 */

export const WEEKDAYS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export const WEEKDAYS_SHORT: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

/** "20:00:00" → "20:00" */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** ISO date → "17 jul 2026" */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** 40 → "40 €" (sin decimales salvo que los haya). */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/**
 * Fecha de hoy (YYYY-MM-DD) en la zona horaria de la escuela.
 * En Vercel el servidor corre en UTC: a partir de las 02:00 de Madrid en
 * verano, `new Date().toISOString()` ya daría el día anterior/siguiente.
 */
export function todayInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Timestamp ISO → tiempo relativo corto ("hace 5 min", "ayer", "hace 3 d").
 * A partir de 7 días cae a fecha absoluta. `now` es inyectable para tests.
 */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return "";
  if (diffMs < 0) return "ahora";

  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} d`;

  return then.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Etiquetas de UI para enums del panel. */
export const DANCE_ROLE_LABELS: Record<string, string> = {
  leader: "Leader",
  follower: "Follower",
  both: "Ambos",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  al_dia: "Al día",
  pendiente: "Pendiente",
};

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  activa: "Activa",
  pausada: "Pausada",
  baja: "Baja",
  lista_espera: "Lista de espera",
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  programada: "Programada",
  impartida: "Impartida",
  cancelada: "Cancelada",
};

export const LEAD_ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  prueba_agendada: "Prueba agendada",
  convertido: "Convertido",
  descartado: "Descartado",
};

export const LEAD_ORIGEN_LABELS: Record<string, string> = {
  "clase-prueba": "Clase de prueba",
  founding: "Founding",
  contacto: "Contacto",
  modalidad: "Modalidad",
  campana: "Campaña",
  intensivos: "Intensivos",
  "curso-regular": "Curso regular",
};

export const CYCLE_TYPE_LABELS: Record<string, string> = {
  curso: "Curso (ciclo cerrado)",
  suelta: "Clase suelta",
};
