import { describe, expect, it } from "vitest";
import { localBusinessLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";

/*
  El DanceSchool del layout tiene que coincidir con la ficha verificada de
  Google Business Profile: mismas coordenadas, enlace a la ficha y NAP. Si
  alguien cambia el local o la ficha, este test obliga a mirar los dos sitios.
*/
describe("schema de la escuela", () => {
  const ld = localBusinessLd();

  it("lleva las coordenadas de la ficha de Google, en rango de la sala", () => {
    expect(ld.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    });
    // Rambla del Garraf, Sant Pere de Ribes: un error de signo o de orden
    // (lat/lng cruzadas) mandaría el pin al mar o a otro continente.
    expect(site.geo.latitude).toBeGreaterThan(41.2);
    expect(site.geo.latitude).toBeLessThan(41.27);
    expect(site.geo.longitude).toBeGreaterThan(1.7);
    expect(site.geo.longitude).toBeLessThan(1.8);
  });

  it("enlaza la ficha como mapa y como perfil de la misma entidad", () => {
    expect(ld.hasMap).toBe(site.google.mapsUrl);
    expect(ld.sameAs).toContain(site.google.mapsUrl);
    expect(ld.sameAs).toContain(site.social.instagram);
    expect(ld.sameAs.every((u) => u.startsWith("https://"))).toBe(true);
  });

  it("mantiene el NAP de la ficha", () => {
    expect(ld.address.streetAddress).toBe("Rambla del Garraf, 32, 1a Planta");
    expect(ld.address.postalCode).toBe("08812");
    expect(ld.address.addressLocality).toBe("Sant Pere de Ribes");
    expect(ld.telephone.replace(/\D/g, "")).toBe("34669291088");
  });
});
