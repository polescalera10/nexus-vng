import { describe, expect, it } from "vitest";
import { planificarAcceso } from "@/lib/access-bulk";

const c = (id: string, full_name: string, email: string) => ({ id, full_name, email });

describe("planificarAcceso", () => {
  it("crea a quien no tiene cuenta y normaliza el email", () => {
    const { pasos, omitidos } = planificarAcceso([c("1", "Ana", "  Ana@Mail.COM ")], new Map());
    expect(omitidos).toEqual([]);
    expect(pasos).toEqual([{ studentId: "1", nombre: "Ana", email: "ana@mail.com", userId: null }]);
  });

  it("enlaza sin crear si la cuenta ya existe como alumno", () => {
    const { pasos } = planificarAcceso(
      [c("1", "Ana", "ana@mail.com")],
      new Map([["ana@mail.com", { userId: "u1", role: "alumno" as const }]]),
    );
    expect(pasos[0]?.userId).toBe("u1");
  });

  it("no enlaza cuentas de admin, profe o sin perfil (no se les toca el rol)", () => {
    const existentes = new Map([
      ["pol@mail.com", { userId: "u1", role: "admin" as const }],
      ["profe@mail.com", { userId: "u2", role: "profesor" as const }],
      ["raro@mail.com", { userId: "u3", role: null }],
    ]);
    const { pasos, omitidos } = planificarAcceso(
      [c("1", "Pol", "pol@mail.com"), c("2", "Profe", "profe@mail.com"), c("3", "Raro", "raro@mail.com")],
      existentes,
    );
    expect(pasos).toEqual([]);
    expect(omitidos.map((o) => o.nombre)).toEqual(["Pol", "Profe", "Raro"]);
  });

  it("deja pasar solo al primero cuando dos fichas comparten email", () => {
    const { pasos, omitidos } = planificarAcceso(
      [c("1", "Uno", "casa@mail.com"), c("2", "Dos", "CASA@mail.com")],
      new Map(),
    );
    expect(pasos.map((p) => p.studentId)).toEqual(["1"]);
    expect(omitidos).toEqual([{ nombre: "Dos", motivo: "comparte email con otro alumno" }]);
  });

  it("omite emails con formato roto", () => {
    const { pasos, omitidos } = planificarAcceso(
      [c("1", "A", "sin-arroba"), c("2", "B", "a@b"), c("3", "C", "")],
      new Map(),
    );
    expect(pasos).toEqual([]);
    expect(omitidos).toHaveLength(3);
  });
});
