import { describe, expect, it } from "vitest";
import { avatarPermitido, parsePlace } from "@/lib/google-reviews";
import { site } from "@/lib/site";

const resena = (extra: Record<string, unknown> = {}) => ({
  rating: 5,
  relativePublishTimeDescription: "hace 2 semanas",
  publishTime: "2026-09-01T10:00:00Z",
  text: { text: "Traducido", languageCode: "es" },
  originalText: { text: "Texto original del alumno", languageCode: "ca" },
  authorAttribution: {
    displayName: "Laura M.",
    uri: "https://www.google.com/maps/contrib/123",
    photoUri: "https://lh3.googleusercontent.com/a/foto=s128",
  },
  ...extra,
});

describe("parsePlace", () => {
  it("devuelve nota, total, ficha y reseñas con el texto ORIGINAL", () => {
    const out = parsePlace({
      rating: 4.9,
      userRatingCount: 12,
      googleMapsUri: "https://maps.google.com/?cid=1",
      reviews: [resena()],
    });
    expect(out).toMatchObject({ nota: 4.9, total: 12, fichaUrl: "https://maps.google.com/?cid=1" });
    expect(out?.resenas[0]).toMatchObject({
      autor: "Laura M.",
      autorUrl: "https://www.google.com/maps/contrib/123",
      estrellas: 5,
      cuando: "hace 2 semanas",
      texto: "Texto original del alumno",
    });
  });

  it("sirve la foto del autor por nuestro proxy, nunca directa", () => {
    const out = parsePlace({ reviews: [resena()] });
    expect(out?.resenas[0]?.avatar).toBe(
      `/api/resenas/avatar?u=${encodeURIComponent("https://lh3.googleusercontent.com/a/foto=s128")}`,
    );
  });

  it("sin texto original usa el de Google, y sin ninguno descarta la reseña", () => {
    const soloText = parsePlace({ reviews: [resena({ originalText: undefined })] });
    expect(soloText?.resenas[0]?.texto).toBe("Traducido");
    expect(parsePlace({ reviews: [resena({ originalText: undefined, text: { text: "  " } })] })).toBeNull();
  });

  it("descarta reseñas mal formadas sin tumbar las buenas", () => {
    const out = parsePlace({ reviews: [{ rating: 9 }, { autor: "x" }, resena()] });
    expect(out?.resenas).toHaveLength(1);
  });

  it("sin reseñas o con una respuesta rara devuelve null", () => {
    expect(parsePlace({ rating: 5, userRatingCount: 0 })).toBeNull();
    expect(parsePlace(null)).toBeNull();
    expect(parsePlace("error")).toBeNull();
  });

  it("sin enlace de ficha en la respuesta cae al de lib/site", () => {
    expect(parsePlace({ reviews: [resena()] })?.fichaUrl).toBe(site.google.mapsUrl);
  });

  it("no enlaza perfiles ni fotos fuera de Google", () => {
    const out = parsePlace({
      reviews: [
        resena({
          authorAttribution: {
            displayName: "X",
            uri: "https://evil.example/perfil",
            photoUri: "https://evil.example/foto.png",
          },
        }),
      ],
    });
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
