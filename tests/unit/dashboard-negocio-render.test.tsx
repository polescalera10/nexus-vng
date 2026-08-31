import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  Avisos,
  CuentaDelMes,
  Kpi,
  SemanaGrid,
} from "@/app/area-privada/(dashboard)/admin/dashboard/_components/Bloques";
import {
  avisosDe,
  calcularNegocio,
  type AlumnoNegocioInput,
  type CursoNegocioInput,
  type Supuestos,
} from "@/lib/dashboard/negocio";

/**
 * El Dashboard vive detrás de `requireRole("admin")`, así que no se puede
 * abrir en el navegador sin sesión. Estos tests renderizan los bloques con
 * números reales para comprobar que pintan lo que calculan.
 */

const SALSA1 = "2cb671cb-6a79-46ae-b2bd-93cf32f6abeb"; // pareja: 30 €/h
const REPARTO = "38ce73dc-94e1-47a1-a3d9-62598b6a1f61"; // sola: 35 €/h

/* Ids reales de `teachers` con nombres de pega: el repo es público y la pareja
   id → nombre → tarifa publicaría sueldos de personas concretas. */
const PROFE_A = { id: "2b0b3d96-eecf-4104-baec-73747ffc5b3d", nombre: "Profe A" };
const TITULAR = { id: "97cd939c-a25e-4801-abd6-98e0639d1a9d", nombre: "Titular" };

const CURSOS: CursoNegocioInput[] = [
  {
    id: SALSA1,
    name: "Salsa 1",
    weekday: 3,
    hora: "20:30",
    capacityLeaders: 10,
    capacityFollowers: 10,
    modalidad: "Salsa cubana",
    categoria: "clase",
    nivel: "Empiezo",
    profesores: [PROFE_A, TITULAR],
  },
  {
    id: REPARTO,
    name: "Reparto",
    weekday: 3,
    hora: "19:30",
    capacityLeaders: 10,
    capacityFollowers: 10,
    modalidad: "Reparto",
    categoria: "clase",
    nivel: null,
    profesores: [PROFE_A],
  },
];

const ALUMNOS: AlumnoNegocioInput[] = [
  {
    id: "a",
    nombre: "Aida",
    rol: "follower",
    fundador: false,
    cuotaPendiente: true,
    cursoIds: [SALSA1],
    enEspera: 0,
  },
  {
    id: "b",
    nombre: "Toni",
    rol: "leader",
    fundador: false,
    cuotaPendiente: false,
    cursoIds: [SALSA1],
    enEspera: 0,
  },
];

const SUP: Supuestos = { alquiler: 700, semanas: 4, otros: 0 };
const negocio = calcularNegocio(CURSOS, ALUMNOS, SUP);

describe("Kpi", () => {
  it("pinta etiqueta, cifra y nota", () => {
    render(<Kpi label="Ingresos previstos" value="70 €" nota="cuotas de 2 alumnos" />);
    expect(screen.getByText("Ingresos previstos")).toBeInTheDocument();
    expect(screen.getByText("70 €")).toBeInTheDocument();
    expect(screen.getByText("cuotas de 2 alumnos")).toBeInTheDocument();
  });
});

describe("CuentaDelMes", () => {
  it("enseña las tres líneas de la cuenta y el resultado con su signo", () => {
    render(<CuentaDelMes negocio={negocio} supuestos={SUP} />);

    expect(screen.getByText("Cuotas de alumnos")).toBeInTheDocument();
    expect(screen.getByText("Profesorado")).toBeInTheDocument();
    expect(screen.getByText("Alquiler de sala")).toBeInTheDocument();

    // 2 alumnos × 35 € = 70 € de ingresos; (30 + 35) × 4 = 260 € de profesorado.
    expect(screen.getByText("70 €")).toBeInTheDocument();
    expect(screen.getByText("260 €")).toBeInTheDocument();
    // 70 − 960 = −890 €, con el signo menos delante.
    expect(screen.getByText("−890 €")).toBeInTheDocument();
  });

  it("la barra de cobertura es accesible y dice el porcentaje", () => {
    render(<CuentaDelMes negocio={negocio} supuestos={SUP} />);
    // 70 de 960 = 7 %.
    expect(screen.getByRole("img", { name: /cubren el 7 %/ })).toBeInTheDocument();
  });

  it("sin otros gastos no pinta esa línea", () => {
    render(<CuentaDelMes negocio={negocio} supuestos={SUP} />);
    expect(screen.queryByText("Otros gastos")).not.toBeInTheDocument();
  });
});

describe("SemanaGrid", () => {
  it("coloca cada clase en su día con profesorado, ocupación y margen", () => {
    const { container } = render(<SemanaGrid clases={negocio.clases} />);

    expect(screen.getByText("Miércoles")).toBeInTheDocument();
    expect(screen.getByText("Salsa 1")).toBeInTheDocument();
    expect(screen.getByText("Profe A + Titular")).toBeInTheDocument();

    // Salsa 1: 2 de 20 plazas = 10 %.
    expect(screen.getByText("10 %")).toBeInTheDocument();
    // Reparto está vacía: 0 % y su coste entero como agujero.
    expect(screen.getByText("0 %")).toBeInTheDocument();
    expect(screen.getByText("−140 €")).toBeInTheDocument();

    // Las dos franjas del horario, sin inventarse días vacíos.
    expect(within(container).getByText("19:30")).toBeInTheDocument();
    expect(within(container).getByText("20:30")).toBeInTheDocument();
  });

  it("avisa cuando una clase no tiene profesor asignado", () => {
    const sinProfe = calcularNegocio(
      [{ ...CURSOS[0]!, profesores: [] }],
      [],
      SUP,
    );
    render(<SemanaGrid clases={sinProfe.clases} />);
    expect(screen.getByText("sin profesor asignado")).toBeInTheDocument();
  });
});

describe("Avisos", () => {
  it("pinta los avisos que salen de los números", () => {
    render(<Avisos avisos={avisosDe(negocio)} />);
    expect(screen.getByText(/Reparto · miércoles 19:30: sin matriculados/)).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 alumnos con la cuota pendiente/)).toBeInTheDocument();
  });

  it("cuando no hay nada que revisar lo dice, en vez de dejar un hueco", () => {
    render(<Avisos avisos={[]} />);
    expect(screen.getByText(/Nada que revisar/)).toBeInTheDocument();
  });
});
