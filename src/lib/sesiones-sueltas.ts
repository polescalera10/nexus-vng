import {
  INTENSIVO_PRECIO,
  intensivoSesiones,
  intensivoTitulo,
  type IntensivoSesion,
} from "@/content/intensivos";
import { isoToMadridLocal } from "@/lib/datetime-madrid";
import { site } from "@/lib/site";

/**
 * SESIONES SUELTAS: clases de pago en puerta que no pasan por matrícula (nada
 * de courses/enrollments), solo "quién vino y si pagó".
 *
 * Salen de dos sitios distintos a propósito:
 *   · intensivos  → el cartel, que vive en el repo (`content/intensivos.ts`).
 *   · masterclass → la tabla `eventos`, porque cada una es un evento con su
 *     fecha, su sala y su precio, y se crean desde el panel sin desplegar nada.
 *
 * Las dos comparten pantalla de asistencia y cobro: `intensivo_registros`
 * (0024) guarda `sesion` como texto libre y sin FK justo para esto.
 *
 * Aquí solo va la conversión a un formato común, sin tocar la base: las
 * consultas están en `lib/queries/sesiones-sueltas.ts`.
 */

export type SesionSuelta = {
  /** Lo que se guarda en `intensivo_registros.sesion`. */
  slug: string;
  tipo: "intensivo" | "masterclass";
  titulo: string;
  /** YYYY-MM-DD en hora de Madrid. Ordena el índice y marca la de hoy. */
  fechaIso: string;
  /** Segunda línea: hora y profes, o hora y sala. */
  detalle: string;
  /** Importe por persona que se propone al cobrar. */
  precio: number;
};

/** Lo mínimo de una fila de `eventos` para pintar una sesión. */
export type EventoSesion = {
  slug: string;
  titulo: string;
  fecha: string;
  fecha_fin: string | null;
  ubicacion: string | null;
  precio: number | null;
};

export function sesionDeIntensivo(s: IntensivoSesion): SesionSuelta {
  return {
    slug: s.value,
    tipo: "intensivo",
    titulo: intensivoTitulo(s),
    fechaIso: s.fechaIso,
    detalle: `${s.hora} · ${s.profes}`,
    precio: INTENSIVO_PRECIO,
  };
}

export function sesionDeEvento(e: EventoSesion): SesionSuelta {
  // `fecha` es timestamptz y el servidor corre en UTC: el día y la hora se
  // sacan siempre en hora de Madrid, o una masterclass que empiece a las 00:30
  // saldría en el día anterior.
  const inicio = isoToMadridLocal(e.fecha);
  const fin = e.fecha_fin ? isoToMadridLocal(e.fecha_fin) : null;
  const horas = fin ? `${inicio.slice(11)} – ${fin.slice(11)}` : inicio.slice(11);

  return {
    slug: e.slug,
    tipo: "masterclass",
    titulo: e.titulo,
    fechaIso: inicio.slice(0, 10),
    detalle: `${horas} · ${e.ubicacion ?? site.nap.venue}`,
    // Sin precio anunciado se cobra a mano: mejor un 0 visible que un importe
    // inventado que alguien acabe dando por bueno.
    precio: e.precio === null ? 0 : Number(e.precio),
  };
}

/** Los intensivos del cartel, ya en formato común. */
export const SESIONES_INTENSIVO = intensivoSesiones.map(sesionDeIntensivo);
