import { precios } from "@/content/precios";
import { tarifaDe } from "@/lib/dashboard/tarifas";

/**
 * Cuentas del curso regular: qué entra, qué sale y qué clase se sostiene sola.
 *
 * Lógica pura, sin cliente de Supabase — mismo patrón que `enrollment-capacity.ts`
 * y `level-access.ts`. Las queries entran por parámetro; aquí solo se calcula,
 * así que se puede probar entera con Vitest.
 *
 * Los intensivos quedan fuera a propósito (Pol, 31-08-2026): esto mide el curso
 * regular, y agosto fue un producto aparte que ya terminó.
 */

/** Tarifa fundadora: plana, todas las disciplinas. Ver `content/landing.ts`. */
export const CUOTA_FUNDADOR = 85;

export type CursoNegocioInput = {
  id: string;
  name: string;
  /** 1 = lunes … 7 = domingo (convención de `courses.weekday`). */
  weekday: number;
  /** "20:30" */
  hora: string;
  capacityLeaders: number;
  capacityFollowers: number;
  modalidad: string | null;
  /** "clase" | "compania" — las compañías se marcan, pero cuentan como estilo. */
  categoria: string | null;
  nivel: string | null;
  /** Id y nombre: la tarifa se resuelve por id, el nombre solo se pinta. */
  profesores: { id: string; nombre: string }[];
};

export type AlumnoNegocioInput = {
  id: string;
  nombre: string;
  rol: "leader" | "follower";
  fundador: boolean;
  cuotaPendiente: boolean;
  /** Ids de curso con matrícula `activa`. */
  cursoIds: string[];
  enEspera: number;
};

export type Supuestos = {
  alquiler: number;
  semanas: number;
  otros: number;
};

export type ProfeEnCurso = {
  id: string;
  nombre: string;
  /** `null` = sin tarifa definida en `tarifas.ts`. */
  tarifa: number | null;
};

export type ClaseNegocio = {
  id: string;
  nombre: string;
  weekday: number;
  hora: string;
  modalidad: string | null;
  esCompania: boolean;
  nivel: string | null;
  profesores: ProfeEnCurso[];
  aforo: number;
  alumnos: number;
  leaders: number;
  followers: number;
  /** 0 a 1. Una clase sin aforo declarado da 0. */
  ocupacion: number;
  costeHora: number;
  costeMes: number;
  /** Parte de las cuotas que se imputa a esta clase. */
  ingresoMes: number;
  margenMes: number;
};

export type AlumnoNegocio = AlumnoNegocioInput & {
  /** Modalidades distintas a las que va (las compañías cuentan). */
  estilos: number;
  cuota: number;
};

export type ProfeNegocio = {
  id: string;
  nombre: string;
  clases: number;
  tarifas: number[];
  costeSemana: number;
  costeMes: number;
  /** Porcentaje del gasto total de profesorado, 0 a 100. */
  porcentaje: number;
};

export type Negocio = {
  clases: ClaseNegocio[];
  alumnos: AlumnoNegocio[];
  profesores: ProfeNegocio[];
  /** Profesores que dan clase pero no tienen tarifa en `tarifas.ts`. */
  sinTarifa: string[];
  ingresos: number;
  costeProfesorado: number;
  gastos: number;
  resultado: number;
  plazas: number;
  plazasOcupadas: number;
  ocupacion: number;
  alumnosConClase: number;
  fundadores: number;
  cuotasPendientes: number;
  /** Lo que falta para cubrir gastos. 0 si el mes se sostiene. */
  deficit: number;
  /** Fracción de los gastos que cubren las cuotas, 0 a 1. */
  cobertura: number;
};

/**
 * Cuota mensual de un alumno.
 *
 * Modelo de la web (`content/precios.ts`): 35 € el primer estilo, +20 € por
 * cada estilo adicional, con tope en la tarifa plana. El socio fundador paga
 * 85 € planos, vaya a las clases que vaya.
 *
 * Sin matrícula activa no hay cuota: cobrar a quien no va a nada sería inventar
 * ingresos.
 */
export function cuotaMensual(estilos: number, fundador: boolean): number {
  if (estilos <= 0) return 0;
  if (fundador) return CUOTA_FUNDADOR;
  return Math.min(precios.base + precios.estiloExtra * (estilos - 1), precios.flat);
}

/**
 * Cuántas modalidades distintas cursa el alumno.
 *
 * Va por modalidad, no por curso: quien está en Bachata 1 y Bachata 2 hace UN
 * estilo, y pagaría de más si se contaran las clases. Las compañías sí son
 * modalidad propia (`Cía Salsa`, `Cía Bachata Lady`) y cuentan como un estilo
 * más — decisión de Pol el 31-08-2026.
 */
function contarEstilos(cursoIds: string[], porCurso: Map<string, CursoNegocioInput>): number {
  const modalidades = new Set<string>();
  for (const id of cursoIds) {
    const curso = porCurso.get(id);
    if (curso) modalidades.add(curso.modalidad ?? curso.name);
  }
  return modalidades.size;
}

export function calcularNegocio(
  cursos: CursoNegocioInput[],
  alumnosInput: AlumnoNegocioInput[],
  supuestos: Supuestos,
): Negocio {
  const porCurso = new Map(cursos.map((c) => [c.id, c]));

  // Un curso que ya no existe no debe contar como estilo ni como matrícula.
  const alumnos: AlumnoNegocio[] = alumnosInput.map((a) => {
    const cursoIds = a.cursoIds.filter((id) => porCurso.has(id));
    const estilos = contarEstilos(cursoIds, porCurso);
    return { ...a, cursoIds, estilos, cuota: cuotaMensual(estilos, a.fundador) };
  });

  const sinTarifa = new Set<string>();

  const clases: ClaseNegocio[] = cursos.map((curso) => {
    const dentro = alumnos.filter((a) => a.cursoIds.includes(curso.id));

    let costeHora = 0;
    const profesores: ProfeEnCurso[] = curso.profesores.map(({ id, nombre }) => {
      const tarifa = tarifaDe(id, curso.id);
      // El aviso lo lee un admin dentro del panel: ahí sí va el nombre.
      if (tarifa === null) sinTarifa.add(nombre);
      costeHora += tarifa ?? 0;
      return { id, nombre, tarifa };
    });

    const aforo = curso.capacityLeaders + curso.capacityFollowers;
    const costeMes = costeHora * supuestos.semanas;
    // La cuota del alumno se reparte a partes iguales entre sus clases: es lo
    // único honesto cuando el precio es por persona y no por clase.
    const ingresoMes = dentro.reduce((suma, a) => suma + a.cuota / a.cursoIds.length, 0);

    return {
      id: curso.id,
      nombre: curso.name,
      weekday: curso.weekday,
      hora: curso.hora,
      modalidad: curso.modalidad,
      esCompania: curso.categoria === "compania",
      nivel: curso.nivel,
      profesores,
      aforo,
      alumnos: dentro.length,
      leaders: dentro.filter((a) => a.rol === "leader").length,
      followers: dentro.filter((a) => a.rol === "follower").length,
      ocupacion: aforo > 0 ? dentro.length / aforo : 0,
      costeHora,
      costeMes,
      ingresoMes,
      margenMes: ingresoMes - costeMes,
    };
  });

  const costeProfesorado = clases.reduce((s, c) => s + c.costeMes, 0);

  const acumulado = new Map<
    string,
    { nombre: string; clases: number; tarifas: Set<number>; semana: number }
  >();
  for (const clase of clases) {
    for (const profe of clase.profesores) {
      // Quien no cobra no aparece como coste: aparecería con 0 € en todo.
      if (!profe.tarifa) continue;
      const entrada = acumulado.get(profe.id) ?? {
        nombre: profe.nombre,
        clases: 0,
        tarifas: new Set<number>(),
        semana: 0,
      };
      entrada.clases += 1;
      entrada.tarifas.add(profe.tarifa);
      entrada.semana += profe.tarifa;
      acumulado.set(profe.id, entrada);
    }
  }

  const profesores: ProfeNegocio[] = [...acumulado.entries()]
    .map(([id, e]) => {
      const costeMes = e.semana * supuestos.semanas;
      return {
        id,
        nombre: e.nombre,
        clases: e.clases,
        tarifas: [...e.tarifas].sort((a, b) => a - b),
        costeSemana: e.semana,
        costeMes,
        porcentaje: costeProfesorado > 0 ? (costeMes / costeProfesorado) * 100 : 0,
      };
    })
    .sort((a, b) => b.costeMes - a.costeMes);

  const ingresos = alumnos.reduce((s, a) => s + a.cuota, 0);
  const gastos = costeProfesorado + supuestos.alquiler + supuestos.otros;
  const plazas = clases.reduce((s, c) => s + c.aforo, 0);
  const plazasOcupadas = clases.reduce((s, c) => s + c.alumnos, 0);

  return {
    clases,
    alumnos,
    profesores,
    sinTarifa: [...sinTarifa],
    ingresos,
    costeProfesorado,
    gastos,
    resultado: ingresos - gastos,
    plazas,
    plazasOcupadas,
    ocupacion: plazas > 0 ? plazasOcupadas / plazas : 0,
    alumnosConClase: alumnos.filter((a) => a.cursoIds.length > 0).length,
    fundadores: alumnos.filter((a) => a.fundador).length,
    cuotasPendientes: alumnos.filter((a) => a.cuotaPendiente).length,
    deficit: Math.max(0, gastos - ingresos),
    cobertura: gastos > 0 ? Math.min(1, ingresos / gastos) : 1,
  };
}

/* ── Avisos ───────────────────────────────────────────────────────────────── */

export type Aviso = {
  id: string;
  nivel: "critico" | "atencion" | "info";
  titulo: string;
  detalle: string;
};

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const euros = (v: number) => `${Math.round(v).toLocaleString("es-ES")} €`;

/**
 * Lo que hay que mirar hoy, ordenado por gravedad.
 *
 * Todo sale de los números: ningún aviso está escrito a mano, así que el panel
 * no miente cuando los datos cambian.
 */
export function avisosDe(negocio: Negocio): Aviso[] {
  const avisos: Aviso[] = [];

  const vacias = negocio.clases.filter((c) => c.alumnos === 0);
  if (vacias.length > 0) {
    const coste = vacias.reduce((s, c) => s + c.costeMes, 0);
    avisos.push({
      id: "clases-vacias",
      nivel: "critico",
      titulo: `${vacias.map((c) => `${c.nombre} · ${DIAS[c.weekday - 1]} ${c.hora}`).join(", ")}: sin matriculados`,
      detalle: `Se paga igual: ${euros(coste)} al mes de profesorado sin un solo alumno. O se llena o se cierra.`,
    });
  }

  if (negocio.cuotasPendientes > 0) {
    avisos.push({
      id: "cuotas-pendientes",
      nivel: "critico",
      titulo: `${negocio.cuotasPendientes} de ${negocio.alumnos.length} alumnos con la cuota pendiente`,
      detalle: `Los ${euros(negocio.ingresos)} de ingresos son lo facturable, no lo cobrado. Marca las cuotas al día en Alumnos para que este panel diga la verdad.`,
    });
  }

  if (negocio.sinTarifa.length > 0) {
    avisos.push({
      id: "sin-tarifa",
      nivel: "critico",
      titulo: `Sin tarifa definida: ${negocio.sinTarifa.join(", ")}`,
      detalle:
        "Ese profesorado cuenta como 0 € en el cálculo, así que el gasto real es mayor que el de esta pantalla. Añade su tarifa en lib/dashboard/tarifas.ts.",
    });
  }

  const perdedoras = negocio.clases
    .filter((c) => c.margenMes < 0)
    .sort((a, b) => a.margenMes - b.margenMes);
  const peor = perdedoras[0];
  if (peor) {
    const total = perdedoras.reduce((s, c) => s + c.margenMes, 0);
    avisos.push({
      id: "clases-en-perdidas",
      nivel: "atencion",
      titulo: `${perdedoras.length} ${perdedoras.length === 1 ? "clase no se paga sola" : "clases no se pagan solas"}`,
      detalle: `La peor, ${peor.nombre} del ${DIAS[peor.weekday - 1]}: ${euros(Math.abs(peor.margenMes))} de agujero al mes. Entre todas suman ${euros(Math.abs(total))}.`,
    });
  }

  // Un fundador que paga más de lo que pagaría con el modelo normal.
  const caros = negocio.alumnos.filter(
    (a) =>
      a.fundador &&
      a.cursoIds.length > 0 &&
      CUOTA_FUNDADOR > cuotaMensual(a.estilos, false),
  );
  if (caros.length > 0) {
    avisos.push({
      id: "fundadores-caros",
      nivel: "atencion",
      titulo:
        caros.length === 1
          ? "A una socia fundadora la tarifa le sale cara"
          : `A ${caros.length} socios fundadores la tarifa les sale cara`,
      detalle: `${caros.map((a) => a.nombre).join(", ")}: con sus estilos pagaría${caros.length > 1 ? "n" : ""} menos con el modelo normal. La plaza fundadora compensa a partir de 4 estilos.`,
    });
  }

  const [top] = negocio.profesores;
  if (top && top.porcentaje >= 40) {
    avisos.push({
      id: "concentracion-profesorado",
      nivel: "info",
      titulo: `${top.nombre} concentra el ${Math.round(top.porcentaje)} % del coste de profesorado`,
      detalle: `${euros(top.costeMes)} de los ${euros(negocio.costeProfesorado)} mensuales, en ${top.clases} de las ${negocio.clases.length} clases. Si falta, se cae media semana.`,
    });
  }

  if (negocio.deficit > 0) {
    const libres = negocio.plazas - negocio.plazasOcupadas;
    avisos.push({
      id: "deficit",
      nivel: "info",
      titulo: `Faltan ${euros(negocio.deficit)} al mes para cubrir gastos`,
      detalle: `Equivale a ${Math.ceil(negocio.deficit / precios.base)} alumnos nuevos de un estilo, o a ${Math.ceil(negocio.deficit / precios.estiloExtra)} de los actuales sumando un estilo más. Quedan ${libres} plazas libres en el horario: el problema no es aforo.`,
    });
  }

  return avisos;
}
