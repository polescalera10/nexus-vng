/**
 * HORARIO CURSO REGULAR — temporada 26·27 (NEXUS VNG, Vilanova i la Geltrú).
 * Fuente: cartel oficial "Horario de baile 26·27".
 *
 * Rejilla por franja horaria × día (Lunes → Viernes). Cada celda es una clase
 * o `null` (hueco). El color es semántico por familia de estilo, siempre vía
 * token de marca (nada de colores sueltos).
 *
 * IMPORTANTE (01-08-2026): las opciones del formulario de inscripción se
 * derivan por SESIÓN (estilo + día + hora), no por estilo. Antes, un lead que
 * marcaba "Salsa" no decía ni el día ni el nivel — y hay tres salsas y cuatro
 * bachatas repartidas por la semana. Ahora cada casilla identifica una clase
 * concreta y el valor que viaja al CRM ya es legible ("Salsa 1 · Miércoles
 * 20:30"), sin necesidad de tabla de traducción. Los grupos del formulario van
 * POR DÍA, con la misma forma que el cartel del horario.
 */

export type Familia = "salsa" | "bachata" | "urbano";

export type ClaseRegular = {
  estilo: string; // "Salsa 1"
  profes: string; // "Ana y Pol"
  familia: Familia;
  /**
   * Nivel legible del grupo. Si se omite, se deriva del número del estilo
   * (0 = desde cero, 1 = iniciación, 2 = intermedio). Los estilos sin número
   * no muestran nivel: no inventamos requisitos que no están en el cartel.
   */
  nivel?: string;
  /**
   * Grupo de COMPAÑÍA: etiqueta descriptiva del formato (proyecto coreográfico
   * de temporada, acceso por audición). A efectos de tarifa cuenta como una
   * clase regular más — entra en la tarifa plana y en la plaza de socio
   * fundador igual que el resto (Pol, 31-08-2026).
   */
  compania?: boolean;
};

export type FranjaHoraria = {
  hora: string; // "18:30"
  /** Una entrada por día (Lun, Mar, Mié, Jue, Vie). `null` = hueco. */
  clases: (ClaseRegular | null)[];
};

export const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

/** Texto de color por familia (token de marca). */
export const familiaColor: Record<Familia, string> = {
  salsa: "text-neon",
  bachata: "text-neon-mint",
  urbano: "text-neon-lime",
};

export const horarioRegular: FranjaHoraria[] = [
  {
    hora: "18:30",
    clases: [
      { estilo: "Bachata 1", profes: "Martina y Davide", familia: "bachata" },
      null,
      { estilo: "Reggaetón", profes: "Ana Aylén", familia: "urbano" },
      null,
      null,
    ],
  },
  {
    hora: "19:30",
    clases: [
      { estilo: "Bachata 2", profes: "Martina y Davide", familia: "bachata" },
      null,
      { estilo: "Reparto", profes: "Ana Aylén", familia: "urbano" },
      null,
      { estilo: "Lady Salsa", profes: "Ana Aylén", familia: "salsa" },
    ],
  },
  {
    hora: "20:30",
    clases: [
      { estilo: "Bachata Lady", profes: "Martina", familia: "bachata" },
      { estilo: "Heels", profes: "Yuri", familia: "urbano" },
      { estilo: "Salsa 1", profes: "Ana Aylén y Pol", familia: "salsa" },
      { estilo: "Salsa 0", profes: "Martina y Pol", familia: "salsa" },
      { estilo: "Salsa 2", profes: "Ana Aylén y Pol", familia: "salsa" },
    ],
  },
  {
    hora: "21:30",
    clases: [
      { estilo: "Cía Lady Bachata", profes: "Martina", familia: "bachata", compania: true },
      { estilo: "Sexy Style", profes: "Yuri", familia: "urbano" },
      { estilo: "Bachata 1", profes: "Ana Aylén y Pol", familia: "bachata" },
      { estilo: "Bachata 0", profes: "Martina y Pol", familia: "bachata" },
      { estilo: "Cía Salsa", profes: "Ana Aylén y Pol", familia: "salsa", compania: true },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Derivados para el formulario de inscripción
 * ------------------------------------------------------------------ */

/** Una clase concreta de la semana, ya aplanada (estilo + día + hora). */
export type SesionRegular = ClaseRegular & {
  dia: string; // "Miércoles"
  hora: string; // "20:30"
  /** Identificador legible que se guarda en `leads.intereses` y viaja a n8n. */
  value: string; // "Salsa 1 · Miércoles 20:30"
};

/** Nivel derivado del número del estilo. Sin número → sin nivel. */
function nivelDe(estilo: string): string | undefined {
  if (/\b0$/.test(estilo)) return "Desde cero";
  if (/\b1$/.test(estilo)) return "Iniciación";
  if (/\b2$/.test(estilo)) return "Intermedio";
  return undefined;
}

/** Todas las clases de la semana en orden de día y hora. */
export const sesionesRegulares: SesionRegular[] = diasSemana.flatMap((dia, diaIdx) =>
  horarioRegular.reduce<SesionRegular[]>((acc, franja) => {
    const clase = franja.clases[diaIdx];
    if (clase) {
      acc.push({
        ...clase,
        nivel: clase.nivel ?? nivelDe(clase.estilo),
        dia,
        hora: franja.hora,
        value: `${clase.estilo} · ${dia} ${franja.hora}`,
      });
    }
    return acc;
  }, []),
);

/**
 * Las DISCIPLINAS regulares de la escuela: el estilo sin el número de nivel
 * (Salsa 0/1/2 → "Salsa"), grupos de compañía incluidos. Son exactamente las
 * que cubre la tarifa plana y la plaza de socio fundador, así que la landing de
 * fundador cuenta desde aquí en vez de repetir la lista a mano.
 */
export const disciplinasRegulares: string[] = [
  ...new Set(sesionesRegulares.map((s) => s.estilo.replace(/\s+\d+$/, "").trim())),
];

/** Grupos de compañía. Etiqueta de formato: tarifan como el resto de clases. */
export const gruposCompania: string[] = [
  ...new Set(sesionesRegulares.filter((s) => s.compania).map((s) => s.estilo)),
];

/**
 * Opciones del formulario del curso regular: una casilla por CLASE real,
 * agrupadas POR DÍA y ordenadas por hora, igual que el cartel del horario.
 * El usuario piensa en agenda ("los jueves puedo"), no en taxonomía de estilos:
 * si el formulario tiene la misma forma que el calendario, la relación visual
 * es inmediata y elegir cuesta menos.
 *
 * Cierra con una salida honesta ("aún no lo tengo claro") para que nadie
 * abandone el formulario por no saber dónde encaja.
 */
export const cursoRegularGrupos = [
  ...diasSemana.map((dia) => ({
    label: dia,
    options: sesionesRegulares
      .filter((s) => s.dia === dia)
      .map((s) => ({
        value: s.value,
        label: s.estilo,
        meta: s.hora,
        hint: [s.nivel, s.profes].filter(Boolean).join(" · "),
      })),
  })),
  {
    label: "¿Todavía no lo tienes claro?",
    options: [
      {
        value: "Aún no sé qué clase me toca",
        label: "Ayudadme a elegir",
        meta: "No sé mi nivel o no sé qué día me va mejor",
        hint: "Te escribimos y lo decidimos contigo",
      },
    ],
  },
];
