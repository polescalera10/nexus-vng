import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ResenasGoogle } from "@/components/landing/ResenasGoogle";
import { MAX_RESENAS } from "@/lib/google-reviews";

// jsdom no trae ResizeObserver ni matchMedia.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;

const datos = {
  nota: 4.8,
  total: 12,
  fichaUrl: "https://maps.google.com/?cid=1",
  resenas: [
    {
      autor: "Laura",
      autorUrl: "https://www.google.com/maps/contrib/123",
      avatar: null,
      estrellas: 5,
      publicada: "2026-09-01T10:00:00Z",
      texto: "Texto de prueba de la reseña.",
    },
    {
      autor: "Jordi",
      autorUrl: null,
      avatar: "/api/resenas/avatar?u=x",
      estrellas: 4,
      publicada: null,
      texto: "Otra reseña.",
    },
  ],
};

describe("carrusel de reseñas de Google", () => {
  it("pinta cada reseña como diapositiva con autor, estrellas, fecha y texto literal", () => {
    render(<ResenasGoogle datos={datos} />);
    const diapositivas = screen.getAllByRole("listitem");
    expect(diapositivas).toHaveLength(2);
    expect(diapositivas[0]).toHaveAttribute("aria-roledescription", "diapositiva");
    expect(diapositivas[0]).toHaveAttribute("aria-label", "1 de 2");
    expect(screen.getByText("Laura")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 de 5 estrellas" })).toBeInTheDocument();
    expect(screen.getByText("septiembre de 2026")).toBeInTheDocument();
    expect(screen.getByText("Texto de prueba de la reseña.")).toBeInTheDocument();
  });

  it("no enlaza a Google: ni perfiles, ni 'ver todas', ni 'escribir una reseña'", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("con foto, la del proxy", () => {
    const { container } = render(<ResenasGoogle datos={datos} />);
    expect(container.querySelector('img[src="/api/resenas/avatar?u=x"]')).not.toBeNull();
  });

  it("la nota media se anuncia con su valor real, no redondeada", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(screen.getByRole("img", { name: "Nota media 4,8 de 5" })).toBeInTheDocument();
    expect(screen.getByText("12 reseñas")).toBeInTheDocument();
  });

  it("dice cómo se eligen (Ómnibus)", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(
      screen.getByText(new RegExp(`hasta ${MAX_RESENAS} de las más recientes que llevan comentario, sin filtrar por puntuación`)),
    ).toBeInTheDocument();
  });

  it("las flechas desplazan la lista una tarjeta y se desactivan en los extremos", () => {
    render(<ResenasGoogle datos={datos} />);
    const lista = screen.getByRole("list", { name: "Reseñas" });
    // jsdom no maqueta: se simula una lista más ancha que su hueco.
    Object.defineProperty(lista, "scrollWidth", { configurable: true, value: 900 });
    Object.defineProperty(lista, "clientWidth", { configurable: true, value: 300 });
    const llamadas: ScrollToOptions[] = [];
    lista.scrollBy = ((o: ScrollToOptions) => llamadas.push(o)) as typeof lista.scrollBy;
    fireEvent.scroll(lista);

    const anterior = screen.getByRole("button", { name: "Reseña anterior" });
    const siguiente = screen.getByRole("button", { name: "Reseña siguiente" });
    expect(anterior).toBeDisabled();
    expect(siguiente).toBeEnabled();

    fireEvent.click(siguiente);
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]?.left).toBeGreaterThan(0);

    Object.defineProperty(lista, "scrollLeft", { configurable: true, value: 600 });
    fireEvent.scroll(lista);
    expect(siguiente).toBeDisabled();
    expect(anterior).toBeEnabled();
  });

  it("sin nota media no pinta la cabecera de valoración", () => {
    render(<ResenasGoogle datos={{ ...datos, nota: null, total: null }} />);
    expect(screen.queryByRole("img", { name: /nota media/i })).toBeNull();
  });
});
