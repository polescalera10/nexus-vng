/**
 * Cálculos del informe diario del área de alumnos.
 *
 * Funciones puras: reciben filas ya leídas y devuelven lo que se pinta. Así
 * se prueban sin base de datos (`tests/unit/informe-alumnos-calc.test.ts`) y
 * la ruta del cron solo se ocupa de leer, componer y enviar.
 *
 * Todas las fechas son días de Madrid en formato `YYYY-MM-DD`.
 */

import { madridToIso } from "@/lib/datetime-madrid";

// ─── Fechas ─────────────────────────────────────────────────────────────────

/** `fecha` + `n` días (n puede ser negativo). */
export function sumarDias(fecha: string, n: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Días de `desde` a `hasta` (positivo si `hasta` es posterior). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round(
    (Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000,
  );
}

/**
 * Inicio y fin (exclusivo) del día de Madrid en ISO UTC, para filtrar
 * columnas `timestamptz`. Vercel corre en UTC: sin esto, "ayer" acabaría a
 * las 02:00 de hoy en verano.
 */
export function ventanaDia(fecha: string): { desde: string; hasta: string } {
  return {
    desde: madridToIso(`${fecha}T00:00`),
    hasta: madridToIso(`${sumarDias(fecha, 1)}T00:00`),
  };
}

/** Día de Madrid de un instante ISO. */
export function diaMadrid(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** Hora de Madrid (0-23) de un instante. */
export function horaMadrid(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
}

/** "HH:MM" de Madrid de un instante ISO. */
export function horaMinutoMadrid(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

// ─── Uso regular ────────────────────────────────────────────────────────────

export type Segmento = "habitual" | "ocasional" | "dormido" | "nunca";

export const SEGMENTO_LABELS: Record<Segmento, string> = {
  habitual: "Habituales",
  ocasional: "Ocasionales",
  dormido: "Dormidos",
  nunca: "Nunca han entrado",
};

export const SEGMENTO_DEFINICION: Record<Segmento, string> = {
  habitual: "entran al menos 3 de las últimas 4 semanas",
  ocasional: "han entrado en los últimos 14 días, pero menos",
  dormido: "entraron alguna vez y llevan más de 14 días sin volver",
  nunca: "tienen acceso y no lo han usado",
};

/** En cuántas de las 4 semanas que acaban en `fin` hay al menos una visita. */
export function semanasActivas(dias: readonly string[], fin: string): number {
  let semanas = 0;
  for (let k = 0; k < 4; k++) {
    const hasta = sumarDias(fin, -7 * k);
    const desde = sumarDias(hasta, -6);
    if (dias.some((d) => d >= desde && d <= hasta)) semanas++;
  }
  return semanas;
}

/**
 * Segmento de uso de un alumno CON acceso.
 *
 * `ultimoDia` sale de las visitas registradas; `ultimoLogin`, de Auth. Hace
 * falta mirar los dos porque las visitas solo se registran desde el 01-10-2026:
 * quien entró en septiembre no tiene ninguna fila y no "nunca ha entrado".
 */
export function segmentoDeUso(input: {
  dias28: readonly string[];
  ultimoDia: string | null;
  ultimoLogin: string | null;
  fecha: string;
}): Segmento {
  const { dias28, ultimoDia, ultimoLogin, fecha } = input;
  if (semanasActivas(dias28, fecha) >= 3) return "habitual";
  if (ultimoDia && diasEntre(ultimoDia, fecha) <= 13) return "ocasional";
  if (ultimoDia || ultimoLogin) return "dormido";
  return "nunca";
}

// ─── Puntos ─────────────────────────────────────────────────────────────────

export type Hito = { label: string; points: number };

/** Hitos que se cruzan al pasar de `antes` a `despues` puntos (subiendo). */
export function hitosCruzados(antes: number, despues: number, hitos: readonly Hito[]): Hito[] {
  return hitos
    .filter((h) => h.points > antes && h.points <= despues)
    .sort((a, b) => a.points - b.points);
}

/**
 * Puesto de cada alumno con ranking de competición: empatados comparten
 * puesto y el siguiente salta (1, 2, 2, 4). Quien tiene 0 puntos no entra.
 */
export function puestos(saldos: ReadonlyMap<string, number>): Map<string, number> {
  const orden = [...saldos.entries()]
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1]);
  const out = new Map<string, number>();
  orden.forEach(([id, p], i) => {
    const anterior = orden[i - 1];
    out.set(id, anterior && anterior[1] === p ? out.get(anterior[0])! : i + 1);
  });
  return out;
}

export type MovimientoRanking = { id: string; antes: number | null; ahora: number };

/** Quién cambió de puesto. `antes: null` = entra en el ranking. */
export function movimientosRanking(
  antes: ReadonlyMap<string, number>,
  ahora: ReadonlyMap<string, number>,
): MovimientoRanking[] {
  const pAntes = puestos(antes);
  const pAhora = puestos(ahora);
  const out: MovimientoRanking[] = [];
  for (const [id, puesto] of pAhora) {
    const previo = pAntes.get(id) ?? null;
    if (previo !== puesto) out.push({ id, antes: previo, ahora: puesto });
  }
  return out.sort((a, b) => a.ahora - b.ahora);
}

// ─── Riesgo de baja ─────────────────────────────────────────────────────────

/**
 * Una sesión de un curso del alumno, de las que ya se dieron.
 * `listaPasada`: el profe pasó lista (hay al menos un apunte en la sesión).
 * Sin lista no se sabe si faltó, así que esas sesiones no cuentan.
 */
export type SesionAlumno = { fecha: string; listaPasada: boolean; presente: boolean };

export type Riesgo = { faltasSeguidas: number; ultimaAsistencia: string };

/**
 * Riesgo de baja: ha faltado a sus 2 últimas clases con lista (o más) y antes
 * sí venía. Quien no ha venido nunca no está "dejándolo": no ha empezado, y
 * eso ya lo cuenta el embudo.
 */
export function riesgoDeBaja(sesiones: readonly SesionAlumno[], minimo = 2): Riesgo | null {
  const conLista = sesiones
    .filter((s) => s.listaPasada)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  let faltas = 0;
  for (const s of conLista) {
    if (s.presente) {
      return faltas >= minimo ? { faltasSeguidas: faltas, ultimaAsistencia: s.fecha } : null;
    }
    faltas++;
  }
  return null;
}

// ─── Cumpleaños ─────────────────────────────────────────────────────────────

/**
 * Días que faltan para el próximo cumpleaños desde `hoy` (0 = hoy), o null si
 * no cae en los próximos `ventana` días. El 29 de febrero se celebra el 28 en
 * los años que no son bisiestos.
 */
export function diasHastaCumple(birthday: string, hoy: string, ventana: number): number | null {
  const [, mes, dia] = birthday.split("-");
  for (let n = 0; n <= ventana; n++) {
    const f = sumarDias(hoy, n);
    const [anio, m, d] = f.split("-");
    if (m === mes && d === dia) return n;
    const bisiesto = new Date(Date.UTC(Number(anio), 1, 29)).getUTCMonth() === 1;
    if (mes === "02" && dia === "29" && !bisiesto && m === "02" && d === "28") return n;
  }
  return null;
}

// ─── Resumen semanal ────────────────────────────────────────────────────────

/** Alumnos distintos con visita entre `desde` y `hasta` (incluidos). */
export function activosEntre(
  filas: readonly { student_id: string; day: string }[],
  desde: string,
  hasta: string,
): number {
  return new Set(filas.filter((f) => f.day >= desde && f.day <= hasta).map((f) => f.student_id))
    .size;
}

/** Variación para el correo: "+3", "−2", "igual" o "—" si no hay base. */
export function variacion(ahora: number, antes: number | null): string {
  if (antes === null) return "—";
  const d = ahora - antes;
  if (d === 0) return "igual";
  return d > 0 ? `+${d}` : `−${Math.abs(d)}`;
}

/** Porcentaje entero, o "—" si el total es 0. */
export function pct(parte: number, total: number): string {
  return total > 0 ? `${Math.round((parte / total) * 100)} %` : "—";
}
