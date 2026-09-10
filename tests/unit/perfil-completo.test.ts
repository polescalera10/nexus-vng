import { describe, expect, it } from "vitest";
import {
  camposPendientes,
  listaPendientes,
  perfilCompleto,
} from "@/lib/perfil-completo";

/**
 * Este fichero es el contrato del espejo TS ↔ SQL: la misma regla vive en
 * `public.perfil_alumno_completo()` (migración 0045c) y es la de Postgres la
 * que concede los puntos. Si un caso de aquí cambia, hay que cambiar la
 * migración también.
 */

const ficha = (
  full_name: string,
  birthday: string | null,
  avatar_path: string | null,
) => ({ full_name, birthday, avatar_path });

describe("camposPendientes", () => {
  it("una ficha con nombre, apellido, cumpleaños y foto no debe nada", () => {
    expect(camposPendientes(ficha("Ana Ruiz", "1995-04-12", "x/f.jpg"))).toEqual([]);
    expect(perfilCompleto(ficha("Ana Ruiz", "1995-04-12", "x/f.jpg"))).toBe(true);
  });

  it("sin apellido pide los apellidos", () => {
    expect(camposPendientes(ficha("Ana", "1995-04-12", "x/f.jpg"))).toEqual(["apellidos"]);
  });

  it("un apellido de una sola letra no cuenta como apellido", () => {
    expect(camposPendientes(ficha("Ana R", "1995-04-12", "x/f.jpg"))).toEqual([
      "apellidos",
    ]);
  });

  it("dos apellidos valen igual que uno", () => {
    expect(camposPendientes(ficha("Ana Ruiz Gil", "1995-04-12", "x/f.jpg"))).toEqual([]);
  });

  it("los espacios de sobra no cuelan como apellido", () => {
    expect(camposPendientes(ficha("  Ana   ", "1995-04-12", "x/f.jpg"))).toEqual([
      "apellidos",
    ]);
  });

  it("acumula todo lo que falta, en orden", () => {
    expect(camposPendientes(ficha("Ana", null, null))).toEqual([
      "apellidos",
      "cumpleanos",
      "foto",
    ]);
  });

  it("sin foto pide la foto", () => {
    expect(camposPendientes(ficha("Ana Ruiz", "1995-04-12", null))).toEqual(["foto"]);
  });
});

describe("listaPendientes", () => {
  it("uno solo va sin conjunción", () => {
    expect(listaPendientes(["foto"])).toBe("tu foto");
  });

  it("dos van con y", () => {
    expect(listaPendientes(["apellidos", "foto"])).toBe("tus apellidos y tu foto");
  });

  it("tres van con comas y una y al final", () => {
    expect(listaPendientes(["apellidos", "cumpleanos", "foto"])).toBe(
      "tus apellidos, tu cumpleaños y tu foto",
    );
  });

  it("una lista vacía no escribe nada", () => {
    expect(listaPendientes([])).toBe("");
  });
});
