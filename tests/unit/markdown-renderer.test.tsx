import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

/*
  El renderer pinta el Markdown de eventos (escrito desde el panel) y de los
  artículos del blog. Estos casos son los que añadió el blog: tablas, listas
  numeradas y comentarios que no se publican. Los de siempre (párrafos, listas,
  títulos, imágenes) tienen que seguir igual.
*/
describe("MarkdownRenderer", () => {
  it("pinta una tabla con cabecera, filas y scroll propio", () => {
    const { container } = render(
      <MarkdownRenderer
        content={["| | Salsa | Bachata |", "|---|---|---|", "| Origen | Cuba | **R. Dominicana** |"].join("\n")}
      />,
    );
    const tabla = container.querySelector("table");
    expect(tabla).not.toBeNull();
    expect(tabla?.parentElement?.className).toContain("overflow-x-auto");
    expect([...container.querySelectorAll("thead th")].map((th) => th.textContent)).toEqual(["", "Salsa", "Bachata"]);
    expect(container.querySelector('tbody th[scope="row"]')?.textContent).toBe("Origen");
    expect(container.querySelector("tbody td strong")?.textContent).toBe("R. Dominicana");
  });

  it("sin fila separadora, las barras son texto y no una tabla", () => {
    const { container } = render(<MarkdownRenderer content="| esto | no es tabla |" />);
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelector("p")?.textContent).toBe("| esto | no es tabla |");
  });

  it("pinta listas numeradas con <ol> y sin repetir el número", () => {
    const { container } = render(
      <MarkdownRenderer content={["1. **Escucha** un tema.", "2. Mira el horario."].join("\n")} />,
    );
    const items = [...container.querySelectorAll("ol > li")];
    expect(items.map((li) => li.textContent)).toEqual(["Escucha un tema.", "Mira el horario."]);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("no publica los comentarios, ni de una línea ni de varias", () => {
    const { container } = render(
      <MarkdownRenderer
        content={["Antes.", "<!-- UNIQUE INSIGHT: nota interna -->", "<!--", "otra nota", "-->", "Después."].join("\n")}
      />,
    );
    expect(container.textContent).not.toContain("nota");
    expect(container.textContent).not.toContain("<!--");
    expect([...container.querySelectorAll("p")].map((p) => p.textContent)).toEqual(["Antes.", "Después."]);
  });

  it("un bloque corta el párrafo anterior en vez de fundirse con él", () => {
    const { container } = render(
      <MarkdownRenderer content={["Tres pasos:", "1. Uno", "2. Dos"].join("\n")} />,
    );
    expect(container.querySelector("p")?.textContent).toBe("Tres pasos:");
    expect(container.querySelectorAll("ol > li")).toHaveLength(2);
  });

  it("mantiene listas con viñeta y títulos como hasta ahora", () => {
    const { container } = render(
      <MarkdownRenderer content={["## Título", "- a", "- b"].join("\n")} />,
    );
    expect(container.querySelector("h2")?.textContent).toBe("Título");
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
  });
});
