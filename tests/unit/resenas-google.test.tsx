import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AUTOPLAY_MS, REANUDAR_MS, ResenasGoogle } from "@/components/landing/ResenasGoogle";
import { MAX_RESENAS } from "@/lib/google-reviews";

// jsdom no trae ResizeObserver, IntersectionObserver ni matchMedia.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
/** El carrusel está en pantalla nada más observarlo. */
globalThis.IntersectionObserver = class {
  constructor(private cb: IntersectionObserverCallback) {}
  observe() {
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
let menosMovimiento = false;
window.matchMedia = ((q: string) => ({
  matches: q.includes("reduce") ? menosMovimiento : false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
})) as unknown as typeof window.matchMedia;

/** jsdom no maqueta: se simula una lista más ancha que su hueco. */
function simularLista(scrollLeft = 0) {
  const lista = screen.getByRole("list", { name: "Reseñas" });
  Object.defineProperty(lista, "scrollWidth", { configurable: true, value: 900 });
  Object.defineProperty(lista, "clientWidth", { configurable: true, value: 300 });
  Object.defineProperty(lista, "scrollLeft", { configurable: true, value: scrollLeft });
  const llamadas: { tipo: string; left?: number }[] = [];
  lista.scrollBy = ((o: ScrollToOptions) => llamadas.push({ tipo: "by", left: o.left })) as typeof lista.scrollBy;
  lista.scrollTo = ((o: ScrollToOptions) => llamadas.push({ tipo: "to", left: o.left })) as typeof lista.scrollTo;
  act(() => {
    fireEvent.scroll(lista);
  });
  return { lista, llamadas };
}

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
    const { lista, llamadas } = simularLista();

    const anterior = screen.getByRole("button", { name: "Reseña anterior" });
    const siguiente = screen.getByRole("button", { name: "Reseña siguiente" });
    expect(anterior).toBeDisabled();
    expect(siguiente).toBeEnabled();

    fireEvent.click(siguiente);
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]?.left).toBeGreaterThan(0);

    Object.defineProperty(lista, "scrollLeft", { configurable: true, value: 600 });
    act(() => {
      fireEvent.scroll(lista);
    });
    expect(siguiente).toBeDisabled();
    expect(anterior).toBeEnabled();
  });

  it("sin nota media no pinta la cabecera de valoración", () => {
    render(<ResenasGoogle datos={{ ...datos, nota: null, total: null }} />);
    expect(screen.queryByRole("img", { name: /nota media/i })).toBeNull();
  });
});

describe("paso automático del carrusel", () => {
  afterEach(() => {
    vi.useRealTimers();
    menosMovimiento = false;
  });

  it("avanza una tarjeta solo cada cierto tiempo", () => {
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { llamadas } = simularLista();
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS - 100));
    expect(llamadas).toHaveLength(0);
    act(() => vi.advanceTimersByTime(200));
    expect(llamadas).toEqual([{ tipo: "by", left: expect.any(Number) }]);
  });

  it("al llegar al final vuelve al principio", () => {
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { llamadas } = simularLista(600);
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS + 10));
    expect(llamadas).toEqual([{ tipo: "to", left: 0 }]);
  });

  it("el botón lo pausa y lo reanuda", () => {
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { llamadas } = simularLista();
    const boton = screen.getByRole("button", { name: /pausar el paso automático/i });
    act(() => {
      fireEvent.click(boton);
    });
    expect(boton).toHaveAttribute("aria-pressed", "true");
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 3));
    expect(llamadas).toHaveLength(0);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /reanudar el paso automático/i }));
    });
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS + 10));
    expect(llamadas).toHaveLength(1);
  });

  it("se para con el ratón encima y mientras la lista anuncia cambios solo cuando no se mueve", () => {
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { lista, llamadas } = simularLista();
    expect(lista).toHaveAttribute("aria-live", "off");
    act(() => {
      fireEvent.mouseEnter(screen.getByRole("region", { name: /lo que dicen en google/i }));
    });
    expect(lista).toHaveAttribute("aria-live", "polite");
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 2));
    expect(llamadas).toHaveLength(0);
  });

  it("tras usar las flechas espera antes de seguir solo", () => {
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { llamadas } = simularLista();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Reseña siguiente" }));
    });
    expect(llamadas).toHaveLength(1);
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS + 10));
    expect(llamadas).toHaveLength(1);
    act(() => vi.advanceTimersByTime(REANUDAR_MS));
    expect(llamadas.length).toBeGreaterThan(1);
  });

  it("con 'reducir movimiento' no se mueve solo ni ofrece pausa", () => {
    menosMovimiento = true;
    vi.useFakeTimers();
    render(<ResenasGoogle datos={datos} />);
    const { llamadas } = simularLista();
    expect(screen.queryByRole("button", { name: /paso automático/i })).toBeNull();
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 3));
    expect(llamadas).toHaveLength(0);
  });
});
