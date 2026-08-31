import { describe, expect, it } from "vitest";
import {
  avisosDe,
  calcularNegocio,
  cuotaMensual,
  CUOTA_FUNDADOR,
  type AlumnoNegocioInput,
  type CursoNegocioInput,
  type Supuestos,
} from "@/lib/dashboard/negocio";

/* Ids reales del horario 26·27: los tres primeros son clases de pareja, con
   tarifa reducida frente a las que se dan en solitario. */
const SALSA1 = "2cb671cb-6a79-46ae-b2bd-93cf32f6abeb";
const BACHATA1_MIE = "7ea623f1-95f2-4f7c-a2a0-b578e67193c6";
const SALSA2 = "6cdf8d32-6df0-42d2-9235-ebcf6b0d4a42";
const REPARTO = "38ce73dc-94e1-47a1-a3d9-62598b6a1f61";
const BACHATA2_LUN = "2dc465e2-ca37-4ddb-8c0a-cb3fd354fdfa";
const CIA_SALSA = "eeb8da10-d9b8-4142-8e31-7d962cc5f167";

/* Ids reales de `teachers` (hacen falta para que `tarifaDe` resuelva) con
   nombres de pega a propósito: este repo es público y la pareja
   id → nombre → tarifa publicaría el sueldo de personas concretas. Los nombres
   de verdad solo salen de la base en tiempo de ejecución. */
const PROFE_A = { id: "2b0b3d96-eecf-4104-baec-73747ffc5b3d", nombre: "Profe A" };
const PROFE_B = { id: "2125591e-1255-4cb9-a644-51dbffaf1989", nombre: "Profe B" };
const PROFE_C = { id: "6e58bafd-abd5-414f-87c2-f29808f47de8", nombre: "Profe C" };
const TITULAR = { id: "97cd939c-a25e-4801-abd6-98e0639d1a9d", nombre: "Titular" };
const DESCONOCIDO = { id: "00000000-0000-4000-8000-000000000000", nombre: "Profe Nuevo" };

function curso(over: Partial<CursoNegocioInput> & { id: string }): CursoNegocioInput {
  return {
    name: "Clase",
    weekday: 3,
    hora: "20:30",
    capacityLeaders: 10,
    capacityFollowers: 10,
    modalidad: "Salsa cubana",
    categoria: "clase",
    nivel: null,
    profesores: [PROFE_A],
    ...over,
  };
}

function alumno(over: Partial<AlumnoNegocioInput> & { id: string }): AlumnoNegocioInput {
  return {
    nombre: over.id,
    rol: "follower",
    fundador: false,
    cuotaPendiente: false,
    cursoIds: [],
    enEspera: 0,
    ...over,
  };
}

const SUP: Supuestos = { alquiler: 700, semanas: 4, otros: 0 };

describe("cuotaMensual", () => {
  it("sigue el modelo de la web: 35 € el primero, +20 € por extra", () => {
    expect(cuotaMensual(1, false)).toBe(35);
    expect(cuotaMensual(2, false)).toBe(55);
    expect(cuotaMensual(3, false)).toBe(75);
  });

  it("no pasa del tope de la tarifa plana por muchos estilos que sume", () => {
    expect(cuotaMensual(4, false)).toBe(95);
    expect(cuotaMensual(5, false)).toBe(100);
    expect(cuotaMensual(9, false)).toBe(100);
  });

  it("el socio fundador paga la plana, vaya a las clases que vaya", () => {
    expect(cuotaMensual(1, true)).toBe(CUOTA_FUNDADOR);
    expect(cuotaMensual(7, true)).toBe(CUOTA_FUNDADOR);
  });

  it("sin matrícula activa no hay cuota: no se inventan ingresos", () => {
    expect(cuotaMensual(0, false)).toBe(0);
    expect(cuotaMensual(0, true)).toBe(0);
  });
});

describe("calcularNegocio · estilos", () => {
  it("dos clases de la misma modalidad son UN estilo", () => {
    const cursos = [
      curso({ id: BACHATA1_MIE, modalidad: "Bachata" }),
      curso({ id: BACHATA2_LUN, modalidad: "Bachata" }),
    ];
    const negocio = calcularNegocio(
      cursos,
      [alumno({ id: "a", cursoIds: [BACHATA1_MIE, BACHATA2_LUN] })],
      SUP,
    );
    expect(negocio.alumnos[0]!.estilos).toBe(1);
    expect(negocio.alumnos[0]!.cuota).toBe(35);
  });

  it("la compañía cuenta como un estilo más", () => {
    const cursos = [
      curso({ id: SALSA1, modalidad: "Salsa cubana" }),
      curso({ id: CIA_SALSA, modalidad: "Cía Salsa", categoria: "compania" }),
    ];
    const negocio = calcularNegocio(cursos, [alumno({ id: "a", cursoIds: [SALSA1, CIA_SALSA] })], SUP);
    expect(negocio.alumnos[0]!.estilos).toBe(2);
    expect(negocio.alumnos[0]!.cuota).toBe(55);
    expect(negocio.clases[1]!.esCompania).toBe(true);
  });

  it("una matrícula a un curso que ya no existe no cuenta", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1 })],
      [alumno({ id: "a", cursoIds: [SALSA1, "curso-borrado"] })],
      SUP,
    );
    expect(negocio.alumnos[0]!.cursoIds).toEqual([SALSA1]);
    expect(negocio.alumnos[0]!.estilos).toBe(1);
  });
});

describe("calcularNegocio · coste de profesorado", () => {
  it("aplica la tarifa de pareja por id de curso, no por nombre de clase", () => {
    const negocio = calcularNegocio(
      [
        curso({ id: SALSA1, name: "Salsa 1", profesores: [PROFE_A, TITULAR] }),
        curso({ id: REPARTO, name: "Reparto", profesores: [PROFE_A] }),
      ],
      [],
      SUP,
    );
    // Salsa 1 es clase de pareja: 30 €/h. El titular no cobra, así que no suma.
    expect(negocio.clases[0]!.costeHora).toBe(30);
    // Reparto la da sola: 35 €/h.
    expect(negocio.clases[1]!.costeHora).toBe(35);
    expect(negocio.costeProfesorado).toBe((30 + 35) * 4);
  });

  it("suma las tarifas de los dos profesores cuando ambos cobran", () => {
    const negocio = calcularNegocio(
      [curso({ id: BACHATA2_LUN, profesores: [PROFE_C, PROFE_B] })],
      [],
      SUP,
    );
    expect(negocio.clases[0]!.costeHora).toBe(40);
  });

  it("quien no cobra no aparece en el reparto de coste", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1, profesores: [PROFE_A, TITULAR] })],
      [],
      SUP,
    );
    expect(negocio.profesores.map((p) => p.nombre)).toEqual([PROFE_A.nombre]);
  });

  it("un profesor sin tarifa se señala en vez de contar 0 € en silencio", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1, profesores: [DESCONOCIDO] })],
      [],
      SUP,
    );
    expect(negocio.sinTarifa).toEqual(["Profe Nuevo"]);
    expect(negocio.clases[0]!.profesores[0]!.tarifa).toBeNull();
    expect(avisosDe(negocio).some((a) => a.id === "sin-tarifa")).toBe(true);
  });
});

describe("calcularNegocio · cuenta y reparto de ingresos", () => {
  it("reparte la cuota del alumno entre sus clases", () => {
    const negocio = calcularNegocio(
      [
        curso({ id: SALSA1, modalidad: "Salsa cubana" }),
        curso({ id: BACHATA1_MIE, modalidad: "Bachata" }),
      ],
      [alumno({ id: "a", cursoIds: [SALSA1, BACHATA1_MIE] })],
      SUP,
    );
    // 2 estilos = 55 €, a partes iguales entre las dos clases.
    expect(negocio.ingresos).toBe(55);
    expect(negocio.clases[0]!.ingresoMes).toBeCloseTo(27.5);
    expect(negocio.clases[1]!.ingresoMes).toBeCloseTo(27.5);
  });

  it("gastos = profesorado + alquiler + otros, y el resultado es la resta", () => {
    const negocio = calcularNegocio(
      [curso({ id: REPARTO, profesores: [PROFE_A] })],
      [alumno({ id: "a", cursoIds: [REPARTO] })],
      { alquiler: 700, semanas: 4, otros: 50 },
    );
    expect(negocio.costeProfesorado).toBe(140);
    expect(negocio.gastos).toBe(890);
    expect(negocio.ingresos).toBe(35);
    expect(negocio.resultado).toBe(-855);
    expect(negocio.deficit).toBe(855);
  });

  it("las semanas del supuesto escalan el coste, no el ingreso", () => {
    const entrada = [curso({ id: REPARTO, profesores: [PROFE_A] })];
    const gente = [alumno({ id: "a", cursoIds: [REPARTO] })];
    const cuatro = calcularNegocio(entrada, gente, SUP);
    const cinco = calcularNegocio(entrada, gente, { ...SUP, semanas: 5 });
    expect(cinco.costeProfesorado).toBe(cuatro.costeProfesorado * 1.25);
    expect(cinco.ingresos).toBe(cuatro.ingresos);
  });

  it("la ocupación sale del aforo real de cada clase", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1, capacityLeaders: 10, capacityFollowers: 10 })],
      [
        alumno({ id: "a", cursoIds: [SALSA1], rol: "leader" }),
        alumno({ id: "b", cursoIds: [SALSA1], rol: "follower" }),
      ],
      SUP,
    );
    expect(negocio.clases[0]!.aforo).toBe(20);
    expect(negocio.clases[0]!.leaders).toBe(1);
    expect(negocio.clases[0]!.followers).toBe(1);
    expect(negocio.ocupacion).toBeCloseTo(0.1);
  });

  it("una clase sin aforo declarado no divide por cero", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1, capacityLeaders: 0, capacityFollowers: 0 })],
      [],
      SUP,
    );
    expect(negocio.clases[0]!.ocupacion).toBe(0);
    expect(negocio.ocupacion).toBe(0);
  });
});

describe("avisosDe", () => {
  it("señala la clase sin un solo matriculado", () => {
    const negocio = calcularNegocio([curso({ id: REPARTO, name: "Reparto" })], [], SUP);
    const aviso = avisosDe(negocio).find((a) => a.id === "clases-vacias");
    expect(aviso?.titulo).toContain("Reparto");
    expect(aviso?.nivel).toBe("critico");
  });

  it("avisa de las cuotas pendientes: facturable no es cobrado", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1 })],
      [alumno({ id: "a", cursoIds: [SALSA1], cuotaPendiente: true })],
      SUP,
    );
    expect(avisosDe(negocio).some((a) => a.id === "cuotas-pendientes")).toBe(true);
  });

  it("detecta al fundador que pagaría menos con el modelo normal", () => {
    const negocio = calcularNegocio(
      [curso({ id: SALSA1, modalidad: "Salsa cubana" })],
      [alumno({ id: "a", nombre: "Karen", cursoIds: [SALSA1], fundador: true })],
      SUP,
    );
    // 1 estilo = 35 € normales frente a 85 € de plaza fundadora.
    const aviso = avisosDe(negocio).find((a) => a.id === "fundadores-caros");
    expect(aviso?.detalle).toContain("Karen");
  });

  it("no lo avisa cuando la plaza fundadora sí compensa", () => {
    const cursos = [
      curso({ id: SALSA1, modalidad: "Salsa cubana" }),
      curso({ id: BACHATA1_MIE, modalidad: "Bachata" }),
      curso({ id: REPARTO, modalidad: "Reparto" }),
      curso({ id: CIA_SALSA, modalidad: "Cía Salsa", categoria: "compania" }),
      curso({ id: SALSA2, modalidad: "Lady Style Salsa" }),
    ];
    const negocio = calcularNegocio(
      cursos,
      [alumno({ id: "a", cursoIds: cursos.map((c) => c.id), fundador: true })],
      SUP,
    );
    // 5 estilos = 100 € normales; la plaza fundadora (85 €) sale a cuenta.
    expect(avisosDe(negocio).some((a) => a.id === "fundadores-caros")).toBe(false);
  });

  it("no inventa avisos cuando no hay nada que revisar", () => {
    const negocio = calcularNegocio(
      [curso({ id: REPARTO, profesores: [PROFE_A] })],
      [alumno({ id: "a", cursoIds: [REPARTO] })],
      { alquiler: 0, semanas: 0, otros: 0 },
    );
    const ids = avisosDe(negocio).map((a) => a.id);
    expect(ids).not.toContain("clases-vacias");
    expect(ids).not.toContain("cuotas-pendientes");
    expect(ids).not.toContain("deficit");
  });
});
