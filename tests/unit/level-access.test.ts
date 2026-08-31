import { describe, expect, it } from "vitest";
import { aboveLevelMessage, checkLevel } from "@/lib/level-access";

const inicial = { orden: 1, nombre: "Iniciación" };
const medio = { orden: 2, nombre: "Medio" };
const avanzado = { orden: 3, nombre: "Avanzado" };

describe("checkLevel", () => {
  it("deja bajar de nivel", () => {
    expect(checkLevel(avanzado, inicial)).toEqual({ kind: "ok" });
    expect(checkLevel(medio, medio)).toEqual({ kind: "ok" });
  });

  it("avisa al saltar por encima de su nivel", () => {
    expect(checkLevel(inicial, avanzado)).toEqual({
      kind: "above",
      studentLevel: "Iniciación",
      courseLevel: "Avanzado",
    });
  });

  it("un curso sin nivel es abierto a todos", () => {
    expect(checkLevel(inicial, null)).toEqual({ kind: "ok" });
  });

  it("sin nivel del alumno no hay nada que comparar", () => {
    expect(checkLevel(null, avanzado)).toEqual({ kind: "unknown" });
  });
});

describe("aboveLevelMessage", () => {
  it("nombra los dos niveles y recuerda la regla", () => {
    const msg = aboveLevelMessage({
      kind: "above",
      studentLevel: "Iniciación",
      courseLevel: "Avanzado",
    });
    expect(msg).toContain("Avanzado");
    expect(msg).toContain("Iniciación");
    expect(msg).toContain("no saltar");
  });
});
