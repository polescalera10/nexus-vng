import { describe, expect, it } from "vitest";
import {
  articulos,
  articulosDeDisciplina,
  articulosOrdenados,
  articulosRelacionados,
  type Articulo,
} from "@/content/blog";
import { modalidadesContenido } from "@/content/modalidades";
import { __parseInlineStyles } from "@/components/ui/MarkdownRenderer";

const base: Articulo = {
  slug: "uno",
  titulo: "Uno",
  metaTitle: "Uno",
  description: "d".repeat(130),
  resumen: "r",
  publicado: "2026-09-01",
  actualizado: "2026-09-01",
  autor: { nombre: "Pol", profesorSlug: "pol" },
  disciplinas: ["bachata"],
  imagen: { src: "/media/clases/bachata-1.jpg", alt: "a", ancho: 900, alto: 1200 },
  cuerpo: "texto",
};

describe("catálogo del blog", () => {
  it("ordena del más reciente al más antiguo", () => {
    const lista = [
      { ...base, slug: "viejo", publicado: "2026-01-05" },
      { ...base, slug: "nuevo", publicado: "2026-09-10" },
      { ...base, slug: "medio", publicado: "2026-05-02" },
    ];
    expect(articulosOrdenados(lista).map((a) => a.slug)).toEqual(["nuevo", "medio", "viejo"]);
  });

  it("filtra por disciplina para el enlace de vuelta de la ficha", () => {
    const lista = [
      { ...base, slug: "a", disciplinas: ["bachata", "salsa-cubana"] },
      { ...base, slug: "b", disciplinas: ["heels"] },
    ];
    expect(articulosDeDisciplina("salsa-cubana", lista).map((a) => a.slug)).toEqual(["a"]);
    expect(articulosDeDisciplina("reparto", lista)).toEqual([]);
  });

  /*
    Estas dos reglas evitan publicar un artículo roto: un slug de disciplina mal
    escrito deja el enlace de vuelta sin pintar (silencioso), y una meta fuera de
    rango se corta en el SERP.
  */
  it("cada artículo publicado apunta a disciplinas que existen", () => {
    for (const a of articulos)
      for (const slug of a.disciplinas) expect(Object.keys(modalidadesContenido), a.slug).toContain(slug);
  });

  it("cada artículo publicado tiene meta y title dentro de rango", () => {
    for (const a of articulos) {
      expect(a.metaTitle.length, a.slug).toBeLessThanOrEqual(48);
      expect(a.description.length, a.slug).toBeGreaterThanOrEqual(120);
      expect(a.description.length, a.slug).toBeLessThanOrEqual(160);
      expect(a.actualizado >= a.publicado, a.slug).toBe(true);
    }
  });
});

describe("sigue leyendo (articulosRelacionados)", () => {
  const lista: Articulo[] = [
    { ...base, slug: "a", disciplinas: ["bachata", "salsa-cubana"] },
    { ...base, slug: "b", disciplinas: ["heels"] },
    { ...base, slug: "c", disciplinas: ["bachata"] },
    { ...base, slug: "d", disciplinas: ["bachata", "salsa-cubana"] },
    { ...base, slug: "e", disciplinas: ["salsa-cubana"] },
  ];

  it("nunca se recomienda a sí mismo y respeta el límite", () => {
    const r = articulosRelacionados("a", 3, lista).map((x) => x.slug);
    expect(r).not.toContain("a");
    expect(r).toHaveLength(3);
  });

  it("pone primero las guías que comparten disciplina", () => {
    // b (heels) no comparte nada con a: va detrás de c, d y e.
    expect(articulosRelacionados("a", 3, lista).map((x) => x.slug)).toEqual(["c", "d", "e"]);
    // Sin ninguna afín, se rellena igual.
    expect(articulosRelacionados("b", 3, lista).map((x) => x.slug)).toHaveLength(3);
  });

  it("aparca las que el cuerpo ya enlaza", () => {
    const conEnlace = lista.map((x) => (x.slug === "a" ? { ...x, cuerpo: "ver [c](/blog/c)" } : x));
    expect(articulosRelacionados("a", 3, conEnlace).map((x) => x.slug)).toEqual(["d", "e", "b"]);
  });

  it("desempata dando la vuelta al registro, no siempre a las mismas", () => {
    // Con todo empatado, cada una recomienda a las siguientes.
    const iguales = lista.map((x) => ({ ...x, disciplinas: ["bachata"] }));
    expect(articulosRelacionados("d", 2, iguales).map((x) => x.slug)).toEqual(["e", "a"]);
  });

  it("slug inexistente: lista vacía", () => {
    expect(articulosRelacionados("no-existe", 3, lista)).toEqual([]);
  });

  it("con las guías publicadas, todas reciben al menos un enlace", () => {
    const destinos = new Set(articulos.flatMap((a) => articulosRelacionados(a.slug).map((r) => r.slug)));
    for (const a of articulos) expect(destinos, a.slug).toContain(a.slug);
  });
});

describe("enlaces en Markdown", () => {
  it("convierte enlaces internos", () => {
    expect(__parseInlineStyles("ver [bachata](/clases/bachata)")).toContain(
      '<a href="/clases/bachata"',
    );
  });

  it("abre los https en otra pestaña", () => {
    const html = __parseInlineStyles("[Maps](https://maps.google.com/x)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("no pinta enlaces con esquemas peligrosos ni protocolo relativo", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,x", "http://inseguro.es", "//evil.es"]) {
      const html = __parseInlineStyles(`[clic](${url})`);
      // El texto se conserva (con `javascript:alert(1)` queda suelto el
      // paréntesis de cierre, que es texto inofensivo); lo que no puede haber
      // es etiqueta de enlace ni rastro del destino.
      expect(html, url).toContain("clic");
      expect(html, url).not.toContain("<a ");
      expect(html.toLowerCase(), url).not.toContain("href");
    }
  });
});
