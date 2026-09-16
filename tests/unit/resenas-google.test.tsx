import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResenasGoogle } from "@/components/landing/ResenasGoogle";
import { MAX_RESENAS } from "@/lib/google-reviews";
import { site } from "@/lib/site";

const datos = {
  nota: 4.8,
  total: 12,
  fichaUrl: site.google.mapsUrl,
  resenas: [
    {
      autor: "Laura M.",
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

describe("bloque de reseñas de Google", () => {
  it("pinta autor enlazado, estrellas, fecha y texto literal", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(screen.getByRole("link", { name: "Laura M." })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/contrib/123",
    );
    expect(screen.getByRole("img", { name: "5 de 5 estrellas" })).toBeInTheDocument();
    expect(screen.getByText("septiembre de 2026")).toBeInTheDocument();
    expect(screen.getByText("Texto de prueba de la reseña.")).toBeInTheDocument();
  });

  it("sin perfil, el nombre va sin enlace; con foto, la del proxy", () => {
    const { container } = render(<ResenasGoogle datos={datos} />);
    expect(screen.queryByRole("link", { name: "Jordi" })).toBeNull();
    expect(screen.getByText("Jordi")).toBeInTheDocument();
    expect(container.querySelector('img[src="/api/resenas/avatar?u=x"]')).not.toBeNull();
  });

  it("la nota media se anuncia con su valor real, no redondeada", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(screen.getByRole("img", { name: "Nota media 4,8 de 5" })).toBeInTheDocument();
    expect(screen.getByText("12 reseñas")).toBeInTheDocument();
  });

  it("dice cómo se eligen (Ómnibus) y enlaza a la ficha y a dejar reseña", () => {
    render(<ResenasGoogle datos={datos} />);
    expect(
      screen.getByText(new RegExp(`hasta ${MAX_RESENAS} de las más recientes que llevan comentario, sin filtrar por puntuación`)),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver todas en google maps/i })).toHaveAttribute("href", site.google.mapsUrl);
    expect(screen.getByRole("link", { name: /escribir una reseña/i })).toHaveAttribute("href", site.google.reviewUrl);
  });

  it("sin nota media no pinta la cabecera de valoración", () => {
    render(<ResenasGoogle datos={{ ...datos, nota: null, total: null }} />);
    expect(screen.queryByRole("img", { name: /nota media/i })).toBeNull();
  });
});
