import { describe, expect, it } from "vitest";
import {
  MODALIDAD_SLUG_REGEX,
  slugifyModalidad,
} from "@/lib/validation/modalidad";
import { EVENTO_SLUG_REGEX, slugifyEvento } from "@/lib/validation/evento";

/**
 * Los slugs generados aquí van directos a un CHECK de Postgres
 * (`modalidades_slug_format`, `eventos_slug_format`) y a una URL pública.
 * Cualquier carácter que se cuele es un insert que falla con un error opaco.
 */
describe("slugifyModalidad", () => {
  it("quita tildes y pasa a guiones", () => {
    expect(slugifyModalidad("Cía Bachata Lady")).toBe("cia-bachata-lady");
    expect(slugifyModalidad("Salsa cubana")).toBe("salsa-cubana");
    expect(slugifyModalidad("Reggaetón")).toBe("reggaeton");
  });

  it("colapsa separadores y no deja guiones sueltos en los extremos", () => {
    expect(slugifyModalidad("  Lady   Style / Salsa  ")).toBe("lady-style-salsa");
    expect(slugifyModalidad("¡Heels!")).toBe("heels");
  });

  it("respeta siempre el CHECK de la migración 0025", () => {
    for (const nombre of [
      "Cía Salsa",
      "Sexy Style",
      "Bachata — nivel 2",
      "Ñu & Co.",
    ]) {
      expect(MODALIDAD_SLUG_REGEX.test(slugifyModalidad(nombre))).toBe(true);
    }
  });

  it("devuelve cadena vacía si no queda nada usable", () => {
    expect(slugifyModalidad("!!!")).toBe("");
  });
});

describe("slugifyEvento", () => {
  it("genera slugs válidos para la URL pública", () => {
    expect(slugifyEvento("Fiesta de Año Nuevo")).toBe("fiesta-de-ano-nuevo");
    expect(EVENTO_SLUG_REGEX.test(slugifyEvento("Masterclass · Bachata"))).toBe(true);
  });

  it("no supera los 80 caracteres del CHECK", () => {
    const slug = slugifyEvento("palabra ".repeat(30));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(EVENTO_SLUG_REGEX.test(slug)).toBe(true);
  });
});
