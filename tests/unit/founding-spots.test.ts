import { describe, expect, it } from "vitest";
import { SIN_DATO, barraPct, tieneAforo } from "@/lib/founding-spots";
import { kickerPlazas } from "@/content/socio-fundador";

describe("tieneAforo", () => {
  it("acepta un recuento real", () => {
    expect(tieneAforo({ left: 7, total: 10 })).toBe(true);
    expect(tieneAforo({ left: 0, total: 10 })).toBe(true);
  });

  it("rechaza el hueco de datos: sin cifra no se pinta contador", () => {
    expect(tieneAforo(SIN_DATO)).toBe(false);
    expect(tieneAforo({ left: 5, total: null })).toBe(false);
    expect(tieneAforo({ left: null, total: 10 })).toBe(false);
    expect(tieneAforo({ left: 0, total: 0 })).toBe(false);
  });
});

describe("barraPct", () => {
  it("con cero ocupadas la barra va vacía", () => {
    expect(barraPct(0, 10)).toBe(0);
  });

  it("una sola plaza ocupada se ve (suelo del 6 %)", () => {
    expect(barraPct(1, 10)).toBe(10);
    expect(barraPct(1, 100)).toBe(6);
  });

  it("escala con las ocupadas", () => {
    expect(barraPct(3, 10)).toBe(30);
    expect(barraPct(10, 10)).toBe(100);
  });

  it("no divide por cero", () => {
    expect(barraPct(3, 0)).toBe(0);
  });
});

describe("kickerPlazas", () => {
  it("dice cuántas quedan cuando hay dato", () => {
    expect(kickerPlazas(7)).toBe("Quedan 7 de 10 plazas");
    expect(kickerPlazas(0)).toBe("Quedan 0 de 10 plazas");
  });

  it("sin dato no se inventa una cifra", () => {
    expect(kickerPlazas(null)).toBe("Plaza de socio fundador");
  });
});
