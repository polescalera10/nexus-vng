import { describe, expect, it } from "vitest";
import { CASOS } from "@/components/landing/PuntoDePartida";
import { paginasSeo } from "@/content/paginas-seo";
import { articulos } from "@/content/blog";

/**
 * El bloque "¿Con cuál te identificas?" de la home es el enlace interno más
 * rastreado del sitio. Hasta el 28-09-2026 apuntaba a landings `/l/` en
 * `noindex`: seis enlaces de la home gastados en URLs que Google no indexa.
 * Estas comprobaciones impiden volver a eso y detectan un slug renombrado
 * antes de que el enlace acabe en un 404.
 */

const INDEXABLES = new Set([
  ...paginasSeo.map((p) => `/${p.slug}`),
  ...articulos.map((a) => `/blog/${a.slug}`),
]);

describe("PuntoDePartida", () => {
  it("ningún destino es una landing de campaña en noindex", () => {
    for (const caso of CASOS) {
      expect(caso.href.startsWith("/l/"), caso.href).toBe(false);
    }
  });

  it("todos los destinos son páginas de entrada o guías publicadas", () => {
    for (const caso of CASOS) {
      expect(INDEXABLES.has(caso.href), caso.href).toBe(true);
    }
  });

  it("no repite destino ni texto", () => {
    expect(new Set(CASOS.map((c) => c.href)).size).toBe(CASOS.length);
    expect(new Set(CASOS.map((c) => c.label)).size).toBe(CASOS.length);
  });
});
