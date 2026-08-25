import { describe, expect, it } from "vitest";
import { isoToMadridLocal, madridToIso } from "@/lib/datetime-madrid";

/**
 * En Vercel el servidor corre en UTC. Si el panel guarda "21:00" tal cual, un
 * evento de verano se publica a las 23:00. Estos tests fijan el desfase real
 * de cada fecha (CEST en verano, CET en invierno).
 */
describe("madridToIso", () => {
  it("resta dos horas en horario de verano (CEST)", () => {
    expect(madridToIso("2026-07-15T21:00")).toBe("2026-07-15T19:00:00.000Z");
  });

  it("resta una hora en horario de invierno (CET)", () => {
    expect(madridToIso("2026-12-15T21:00")).toBe("2026-12-15T20:00:00.000Z");
  });
});

describe("isoToMadridLocal", () => {
  it("devuelve el valor que espera un input datetime-local", () => {
    expect(isoToMadridLocal("2026-07-15T19:00:00.000Z")).toBe("2026-07-15T21:00");
    expect(isoToMadridLocal("2026-12-15T20:00:00.000Z")).toBe("2026-12-15T21:00");
  });

  it("cadena vacía para null o basura", () => {
    expect(isoToMadridLocal(null)).toBe("");
    expect(isoToMadridLocal("no es una fecha")).toBe("");
  });

  it("es la inversa de madridToIso", () => {
    for (const local of ["2026-03-29T04:00", "2026-10-25T04:00", "2026-01-01T00:00"]) {
      expect(isoToMadridLocal(madridToIso(local))).toBe(local);
    }
  });
});
