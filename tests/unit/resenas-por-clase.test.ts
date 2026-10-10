import { describe, expect, it } from "vitest";
import type { ResenaGoogle, ResenasGoogle } from "@/lib/google-reviews";
import { disciplinasMencionadas, fichaParaClase, resenasParaClase } from "@/lib/resenas-por-clase";

const r = (texto: string, publicada = "2026-09-15T10:00:00Z"): ResenaGoogle => ({
  autor: "Ana",
  autorUrl: null,
  avatar: null,
  estrellas: 5,
  publicada,
  texto,
});

// Las seis reseñas reales de la ficha a 10-10-2026, abreviadas.
const general = r("Una maravilla de academia. Enseñan super bien.", "2026-09-15T20:52:00Z");
const salsaYBachata = r("Las clases de salsa y bachata son una pasada!", "2026-09-15T20:04:00Z");
const repartoYBachata = r("hice clase de reparto con Ana. Y Martina, la profe de bachata, me encanta.", "2026-09-15T19:20:00Z");
const otraGeneral = r("Es una escuela donde desde el primer día me he sentido una más.", "2026-09-15T17:29:00Z");
const todas = [general, salsaYBachata, repartoYBachata, otraGeneral];

describe("disciplinasMencionadas", () => {
  it("detecta cada disciplina, con tildes y en catalán", () => {
    expect(disciplinasMencionadas("Salsa y Bachata")).toEqual(["salsa", "bachata"]);
    expect(disciplinasMencionadas("clase de reggaetón")).toEqual(["reggaeton"]);
    expect(disciplinasMencionadas("las clases de tacones y heels")).toEqual(["heels"]);
    expect(disciplinasMencionadas("classes de talons")).toEqual(["heels"]);
    expect(disciplinasMencionadas("sexy style con lady")).toEqual(["sexy", "lady"]);
  });

  it("un texto general no nombra ninguna", () => {
    expect(disciplinasMencionadas("Profesores muy cracks y buen ambiente. Recomendado!")).toEqual([]);
  });
});

describe("resenasParaClase", () => {
  it("en bachata no sale ninguna reseña que nombre salsa ni reparto", () => {
    const out = resenasParaClase(todas, "bachata", 6);
    expect(out).toEqual([general, otraGeneral]);
  });

  it("en salsa tampoco sale la que nombra bachata", () => {
    expect(resenasParaClase(todas, "salsa-cubana", 6)).toEqual([general, otraGeneral]);
  });

  it("la reseña de esa clase va antes que las generales, aunque sea más antigua", () => {
    const soloBachata = r("La clase de bachata de los martes es lo mejor de mi semana", "2026-01-01T00:00:00Z");
    expect(resenasParaClase([general, soloBachata, otraGeneral], "bachata", 6)).toEqual([soloBachata, general, otraGeneral]);
    // Y en otra clase esa misma reseña no sale.
    expect(resenasParaClase([general, soloBachata], "reparto", 6)).toEqual([general]);
  });

  it("la reseña de salsa vale en Lady Salsa (misma familia) pero no en reparto", () => {
    const soloSalsa = r("Mi clase de salsa es una pasada");
    expect(resenasParaClase([soloSalsa], "lady-style-salsa", 6)).toEqual([soloSalsa]);
    expect(resenasParaClase([soloSalsa], "reparto", 6)).toEqual([]);
  });

  it("una ficha desconocida solo recibe reseñas generales", () => {
    expect(resenasParaClase(todas, "clase-nueva", 6)).toEqual([general, otraGeneral]);
  });

  it("no filtra por nota: una de 2 estrellas general también sale", () => {
    const mala = { ...r("No me convenció el horario"), estrellas: 2 };
    expect(resenasParaClase([mala, general], "bachata", 6)).toContain(mala);
  });

  it("respeta el máximo", () => {
    expect(resenasParaClase(todas, "bachata", 1)).toEqual([general]);
  });
});

describe("fichaParaClase", () => {
  const datos: ResenasGoogle = { nota: 5, total: 22, fichaUrl: "https://maps.example", resenas: todas };

  it("conserva nota y total de la escuela y solo cambia las reseñas", () => {
    expect(fichaParaClase(datos, "bachata", 6)).toEqual({ ...datos, resenas: [general, otraGeneral] });
  });

  it("sin reseñas aplicables o sin datos, null: no se pinta el bloque", () => {
    expect(fichaParaClase({ ...datos, resenas: [salsaYBachata] }, "reparto", 6)).toBeNull();
    expect(fichaParaClase(null, "bachata", 6)).toBeNull();
  });
});
