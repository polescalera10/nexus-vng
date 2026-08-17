/**
 * INTENSIVOS AGOSTO 2026 — datos de las 8 sesiones (2 semanas).
 * Fuente: cartel oficial "Intensivos Agosto" (NEXUS VNG, Vilanova i la Geltrú).
 * Todas las sesiones son de 19:30 a 21:30.
 *
 * `value` = etiqueta que viaja al formulario (tag de interés) y al CRM.
 */

export type IntensivoSesion = {
  /** Etiqueta de interés para el form (única). */
  value: string;
  dia: string; // "Lun 17"
  fecha: string; // "17 agosto"
  /** Fecha real de la sesión (YYYY-MM-DD). Ordena el panel de asistencia. */
  fechaIso: string;
  estilo: string; // "Salsa"
  nivel?: string; // "Nivel 2"
  profes: string; // "Ana y Pol"
  hora: string; // "19:30 – 21:30"
  /** Descripción corta del estilo, para vender cada sesión. */
  desc: string;
};

export type IntensivoSemana = {
  label: string; // "Semana 1"
  rango: string; // "17 – 20 agosto"
  sesiones: IntensivoSesion[];
};

const HORA = "19:30 – 21:30";

export const intensivos: IntensivoSemana[] = [
  {
    label: "Semana 1",
    rango: "17 – 20 agosto",
    sesiones: [
      {
        value: "intensivo-salsa-lun17",
        dia: "Lun 17",
        fechaIso: "2026-08-17",
        fecha: "17 agosto",
        estilo: "Salsa",
        nivel: "Nivel 2",
        profes: "Ana y Pol",
        hora: HORA,
        desc: "Salsa cubana de nivel intermedio: figuras encadenadas, rueda de casino y musicalidad para soltarte en cualquier social.",
      },
      {
        value: "intensivo-bachata-lady-mar18",
        dia: "Mar 18",
        fechaIso: "2026-08-18",
        fecha: "18 agosto",
        estilo: "Bachata Lady",
        profes: "Martina",
        hora: HORA,
        desc: "Estilo femenino aplicado a la bachata: brazos, ondas, actitud y ese punto de elegancia que se ve desde lejos.",
      },
      {
        value: "intensivo-reparto-mie19",
        dia: "Mié 19",
        fechaIso: "2026-08-19",
        fecha: "19 agosto",
        estilo: "Reparto",
        profes: "Ana",
        hora: HORA,
        desc: "El género urbano cubano del momento: flow, disociación y actitud de barrio, explicado paso a paso desde cero.",
      },
      {
        value: "intensivo-bachata-jue20",
        dia: "Jue 20",
        fechaIso: "2026-08-20",
        fecha: "20 agosto",
        estilo: "Bachata",
        nivel: "Nivel 0",
        profes: "Martina y Pol",
        hora: HORA,
        desc: "Bachata desde cero absoluto: el paso básico, la conexión en pareja y tus primeros giros. Sin experiencia previa.",
      },
    ],
  },
  {
    label: "Semana 2",
    rango: "24 – 27 agosto",
    sesiones: [
      {
        value: "intensivo-heels-lun24",
        dia: "Lun 24",
        fechaIso: "2026-08-24",
        fecha: "24 agosto",
        estilo: "Heels",
        profes: "Yuri",
        hora: HORA,
        desc: "Potencia, líneas y actitud escénica sobre tacones (o sin ellos). Técnica de danza y un chute de confianza.",
      },
      {
        value: "intensivo-salsa-mar25",
        dia: "Mar 25",
        fechaIso: "2026-08-25",
        fecha: "25 agosto",
        estilo: "Salsa",
        nivel: "Nivel 0",
        profes: "Martina y Pol",
        hora: HORA,
        desc: "Salsa cubana desde cero: paso básico, primeras figuras y la energía de la rueda. La puerta de entrada perfecta.",
      },
      {
        value: "intensivo-lady-salsa-mie26",
        dia: "Mié 26",
        fechaIso: "2026-08-26",
        fecha: "26 agosto",
        estilo: "Lady Salsa",
        profes: "Ana",
        hora: HORA,
        desc: "Técnica y estilo femenino para la salsa: postura, giros, líneas de brazos y presencia. Sube de nivel tu baile social.",
      },
      {
        value: "intensivo-bachata-jue27",
        dia: "Jue 27",
        fechaIso: "2026-08-27",
        fecha: "27 agosto",
        estilo: "Bachata",
        nivel: "Nivel 2",
        profes: "Martina y Davide",
        hora: HORA,
        desc: "Bachata intermedia: musicalidad, recursos modernos y sensuales, y conexión avanzada con la pareja.",
      },
    ],
  },
];

/** Precio por persona y sesión, en euros. Pago en puerta. */
export const INTENSIVO_PRECIO = 20;

/**
 * Las 8 sesiones en una sola lista, ordenadas por fecha.
 * La usa el panel de asistencia (`/area-privada/admin/intensivos`).
 */
export const intensivoSesiones: (IntensivoSesion & { semana: string })[] = intensivos
  .flatMap((semana) => semana.sesiones.map((s) => ({ ...s, semana: semana.label })))
  .sort((a, b) => a.fechaIso.localeCompare(b.fechaIso));

/** Sesión por slug, o `undefined` si el slug no existe en el cartel. */
export function getIntensivoSesion(value: string) {
  return intensivoSesiones.find((s) => s.value === value);
}

/** Nombre legible de una sesión: "Salsa (Nivel 2)". */
export function intensivoTitulo(s: IntensivoSesion): string {
  return `${s.estilo}${s.nivel ? ` (${s.nivel})` : ""}`;
}

/** Opciones para el formulario de intereses (agrupadas por semana). */
export const intensivosGrupos = intensivos.map((semana) => ({
  label: `${semana.label} · ${semana.rango}`,
  options: semana.sesiones.map((s) => ({
    value: s.value,
    label: `${s.estilo}${s.nivel ? ` (${s.nivel})` : ""}`,
    hint: `${s.dia} · ${s.hora}`,
  })),
}));
