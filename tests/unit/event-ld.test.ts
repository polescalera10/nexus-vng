import { describe, expect, it } from "vitest";
import { eventLd } from "@/components/seo/JsonLd";

const base = { titulo: "Bachazouk de 0 a 1", fecha: "2026-10-03T16:00:00+00:00", slug: "bachazouk" };

describe("eventLd", () => {
  it("declara performer y offers cuando hay precio", () => {
    const ld = eventLd({ ...base, precio: "20.00", abierto: true });
    expect(ld.performer).toEqual({ "@id": expect.any(String) });
    expect(ld.offers).toMatchObject({
      "@type": "Offer",
      price: "20",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: expect.stringContaining("/eventos/bachazouk"),
    });
  });

  it("precio 0 es gratuito y se declara", () => {
    expect(eventLd({ ...base, precio: 0 }).offers).toMatchObject({ price: "0" });
  });

  it("sin precio publicado no inventa offers", () => {
    expect("offers" in eventLd({ ...base, precio: null })).toBe(false);
    expect("offers" in eventLd(base)).toBe(false);
  });

  it("evento terminado no declara disponibilidad", () => {
    const ld = eventLd({ ...base, precio: 20, abierto: false });
    expect(ld.offers).not.toHaveProperty("availability");
  });

  it("usa la sala y localidad de la ubicación publicada, no la de la escuela", () => {
    const ld = eventLd({ ...base, ubicacion: "En Tu Salsa · Cubelles" });
    expect(ld.location.name).toBe("En Tu Salsa");
    expect(ld.location.address.addressLocality).toBe("Cubelles");
  });

  it("sin ubicación cae en la sala de NEXUS", () => {
    expect(eventLd(base).location.name).toContain("NEXUS");
  });
});
