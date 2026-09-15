import { describe, expect, it } from "vitest";
import { metaDescripciones, modalidadesContenido } from "@/content/modalidades";
import { site } from "@/lib/site";

/*
  La meta description es lo que se lee en el resultado de Google. Por encima de
  ~160 caracteres el SERP la corta a mitad de frase, y sin la ciudad no casa con
  la búsqueda local que queremos ganar. La auditoría del 15-09-2026 encontró las
  diez fichas sin ciudad y una a 183 caracteres.
*/
describe("meta descriptions de las fichas de disciplina", () => {
  const slugs = Object.keys(modalidadesContenido);

  it("cada disciplina con contenido tiene su meta description", () => {
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(metaDescripciones[slug], slug).toBeTruthy();
  });

  it("no sobra ninguna: toda meta description corresponde a una disciplina", () => {
    for (const slug of Object.keys(metaDescripciones)) expect(slugs, slug).toContain(slug);
  });

  it.each(Object.entries(metaDescripciones))("%s mide entre 120 y 160 caracteres", (_, texto) => {
    expect(texto.length).toBeGreaterThanOrEqual(120);
    expect(texto.length).toBeLessThanOrEqual(160);
  });

  it.each(Object.entries(metaDescripciones))("%s nombra la ciudad y no promete gratis", (_, texto) => {
    expect(texto).toContain(site.locality);
    expect(texto.toLowerCase()).not.toContain("gratis");
  });
});
