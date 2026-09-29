import { describe, expect, it } from "vitest";
import { construirLlmsTxt } from "@/lib/llms-txt";
import { precios } from "@/content/precios";
import { site } from "@/lib/site";

const vacio = { disciplinas: [], paginas: [], guias: [], profesores: [] };

describe("llms.txt", () => {
  it("abre con el nombre y el resumen, como pide el formato", () => {
    const txt = construirLlmsTxt(vacio);
    expect(txt.startsWith(`# ${site.name}\n\n> `)).toBe(true);
  });

  it("los precios salen de content/precios, no escritos a mano", () => {
    const txt = construirLlmsTxt(vacio);
    expect(txt).toContain(`${precios.base} €/mes`);
    expect(txt).toContain(`${precios.flat} €/mes`);
  });

  it("no inventa un precio para la clase de prueba", () => {
    expect(construirLlmsTxt(vacio)).not.toMatch(/prueba[^\n]*€/);
  });

  it("pinta cada entrada como enlace Markdown y omite las secciones vacías", () => {
    const txt = construirLlmsTxt({
      ...vacio,
      guias: [{ url: "https://nexusvng.es/blog/x", titulo: "Guía X", texto: "Resumen\n  en dos líneas" }],
    });
    expect(txt).toContain("## Guías\n\n- [Guía X](https://nexusvng.es/blog/x): Resumen en dos líneas");
    expect(txt).not.toContain("## Profesores");
  });
});
