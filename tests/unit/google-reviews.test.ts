import { describe, expect, it } from "vitest";
import { avatarPermitido, parseFeaturable } from "@/lib/google-reviews";
import { site } from "@/lib/site";

const resena = (extra: Record<string, unknown> = {}) => ({
  id: "r1",
  platform: "google",
  text: "Texto literal del alumno",
  rating: { value: 5, max: 5 },
  publishedAt: "2026-09-01T10:00:00Z",
  author: {
    name: "Laura M.",
    avatarUrl: "https://lh3.googleusercontent.com/a/foto=s128",
    profileUrl: "https://www.google.com/maps/contrib/123",
  },
  ...extra,
});

const widget = (reviews: unknown[], extra: Record<string, unknown> = {}) => ({
  success: true,
  widget: {
    uuid: "w",
    isExampleReviews: false,
    reviews,
    gbpLocationSummary: { reviewsCount: 12, rating: 4.8 },
    ...extra,
  },
});

describe("parseFeaturable", () => {
  it("devuelve nota, total, ficha y reseñas con el texto tal cual", () => {
    const out = parseFeaturable(widget([resena()]));
    expect(out).toMatchObject({ nota: 4.8, total: 12, fichaUrl: site.google.mapsUrl });
    expect(out?.resenas[0]).toMatchObject({
      autor: "Laura M.",
      autorUrl: "https://www.google.com/maps/contrib/123",
      estrellas: 5,
      publicada: "2026-09-01T10:00:00Z",
      texto: "Texto literal del alumno",
    });
  });

  it("NUNCA publica las reseñas de ejemplo de Featurable", () => {
    expect(parseFeaturable(widget([resena()], { isExampleReviews: true }))).toBeNull();
  });

  it("ordena por fecha, no por nota, y se queda con las más recientes", () => {
    const out = parseFeaturable(
      widget([
        resena({ text: "vieja 5", publishedAt: "2026-01-01T00:00:00Z" }),
        resena({ text: "nueva 2", rating: { value: 2, max: 5 }, publishedAt: "2026-09-10T00:00:00Z" }),
        resena({ text: "media 4", rating: { value: 4, max: 5 }, publishedAt: "2026-05-01T00:00:00Z" }),
      ]),
      2,
    );
    expect(out?.resenas.map((r) => r.texto)).toEqual(["nueva 2", "media 4"]);
    expect(out?.resenas[0]?.estrellas).toBe(2);
  });

  it("sirve la foto del autor por nuestro proxy, nunca directa", () => {
    expect(parseFeaturable(widget([resena()]))?.resenas[0]?.avatar).toBe(
      `/api/resenas/avatar?u=${encodeURIComponent("https://lh3.googleusercontent.com/a/foto=s128")}`,
    );
  });

  it("descarta reseñas sin texto o mal formadas sin tumbar las buenas", () => {
    const out = parseFeaturable(widget([resena({ text: "  " }), resena({ text: null }), { rating: 9 }, resena()]));
    expect(out?.resenas).toHaveLength(1);
  });

  it("escala notas sobre otra base a 5 estrellas", () => {
    expect(parseFeaturable(widget([resena({ rating: { value: 8, max: 10 } })]))?.resenas[0]?.estrellas).toBe(4);
  });

  it("sin reseñas, con error o con respuesta rara devuelve null", () => {
    expect(parseFeaturable(widget([]))).toBeNull();
    expect(parseFeaturable({ success: false, widget: { reviews: [resena()] } })).toBeNull();
    expect(parseFeaturable(null)).toBeNull();
    expect(parseFeaturable("error")).toBeNull();
  });

  it("sin resumen de la ficha, sin nota ni total pero con reseñas", () => {
    const out = parseFeaturable(widget([resena()], { gbpLocationSummary: null }));
    expect(out).toMatchObject({ nota: null, total: null });
    expect(out?.resenas).toHaveLength(1);
  });

  it("no enlaza perfiles ni fotos fuera de Google", () => {
    const out = parseFeaturable(
      widget([
        resena({
          author: { name: "X", avatarUrl: "https://evil.example/foto.png", profileUrl: "https://evil.example/p" },
        }),
      ]),
    );
    expect(out?.resenas[0]?.autorUrl).toBeNull();
    expect(out?.resenas[0]?.avatar).toBeNull();
  });
});

describe("avatarPermitido (lista blanca del proxy)", () => {
  it("acepta solo https de googleusercontent", () => {
    expect(avatarPermitido("https://lh3.googleusercontent.com/a/x")).toBe(true);
    expect(avatarPermitido("http://lh3.googleusercontent.com/a/x")).toBe(false);
    expect(avatarPermitido("https://googleusercontent.com.evil.es/x")).toBe(false);
    expect(avatarPermitido("https://evilgoogleusercontent.com/x")).toBe(false);
    expect(avatarPermitido("https://169.254.169.254/latest")).toBe(false);
    expect(avatarPermitido("no es una url")).toBe(false);
  });
});
