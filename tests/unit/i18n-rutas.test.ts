import { describe, expect, it } from "vitest";
import { PAREJAS, alternatesDe, enlace, idiomaDeRuta, rutaEn, tieneVersion } from "@/i18n/rutas";
import { ERRORES_CA } from "@/i18n/textos/comun";
import { interestLeadSchema, leadSchema } from "@/lib/validation/lead";
import { waContextForPath } from "@/lib/wa-page-context";
import { buildWaLink } from "@/lib/whatsapp";

describe("parejas de rutas es ↔ ca", () => {
  it.each(PAREJAS)("%s ↔ %s es recíproca", (es, ca) => {
    expect(rutaEn(es, "ca")).toBe(ca);
    expect(rutaEn(ca, "es")).toBe(es);
    expect(rutaEn(es, "es")).toBe(es);
    expect(idiomaDeRuta(ca)).toBe("ca");
    expect(idiomaDeRuta(es)).toBe("es");
  });

  it("todas las rutas catalanas cuelgan de /ca", () => {
    for (const [, ca] of PAREJAS) expect(ca === "/ca" || ca.startsWith("/ca/")).toBe(true);
  });

  it("una página fuera del piloto no tiene pareja", () => {
    expect(rutaEn("/faq", "ca")).toBeNull();
    expect(rutaEn("/clases/reparto", "ca")).toBeNull();
    expect(tieneVersion("/clases/reparto", "ca")).toBe(false);
    expect(tieneVersion("/clases/reparto", "es")).toBe(true);
  });

  it("no confunde rutas que empiezan por «ca» sin barra", () => {
    expect(idiomaDeRuta("/cambios")).toBe("es");
  });

  it("ignora barra final, query y ancla", () => {
    expect(rutaEn("/clases/?x=1", "ca")).toBe("/ca/classes");
    expect(rutaEn("/ca/horaris#top", "es")).toBe("/horarios");
  });
});

describe("enlace()", () => {
  it("en castellano no toca nada", () => {
    expect(enlace("/clases#horario", "es")).toBe("/clases#horario");
  });

  it("en catalán traduce la ruta y conserva el ancla", () => {
    expect(enlace("/clases#apuntarme", "ca")).toBe("/ca/classes#apuntarme");
    expect(enlace("/", "ca")).toBe("/ca");
  });

  it("en catalán deja en castellano lo que no tiene versión", () => {
    expect(enlace("/socio-fundador", "ca")).toBe("/socio-fundador");
  });
});

describe("alternatesDe()", () => {
  it("canonical propio y hreflang recíproco con x-default en castellano", () => {
    expect(alternatesDe("/ca/classes/bachata")).toEqual({
      canonical: "/ca/classes/bachata",
      languages: { es: "/clases/bachata", ca: "/ca/classes/bachata", "x-default": "/clases/bachata" },
    });
    expect(alternatesDe("/clases/bachata").languages?.ca).toBe("/ca/classes/bachata");
  });

  it("sin pareja, solo canonical", () => {
    expect(alternatesDe("/faq")).toEqual({ canonical: "/faq" });
  });
});

describe("errores de validación en catalán", () => {
  /** Todos los mensajes que pueden salir de los dos esquemas. */
  function mensajes(): string[] {
    const vistos = new Set<string>();
    const casos = [
      leadSchema.safeParse({ nombre: "", telefono: "x", email: "no", origen: "contacto", mensaje: "a".repeat(1001) }),
      leadSchema.safeParse({ nombre: "a".repeat(121), telefono: "1".repeat(21), origen: "contacto" }),
      leadSchema.safeParse({ nombre: "Ana", telefono: "abcdefg", origen: "contacto" }),
      interestLeadSchema.safeParse({ nombre: "", telefono: "", email: "", origen: "curso-regular", intereses: [] }),
      interestLeadSchema.safeParse({ nombre: "Ana Pérez", telefono: "600000000", email: "x", origen: "curso-regular", intereses: Array(51).fill("a") }),
    ];
    for (const c of casos) {
      if (c.success) continue;
      for (const lista of Object.values(c.error.flatten().fieldErrors)) for (const m of lista ?? []) vistos.add(m);
    }
    return [...vistos].filter((m) => !m.startsWith("Required") && !m.startsWith("Invalid"));
  }

  it("cada mensaje en castellano tiene su traducción", () => {
    const todos = mensajes();
    expect(todos.length).toBeGreaterThanOrEqual(8);
    const sinTraducir = todos.filter((m) => !(m in ERRORES_CA));
    expect(sinTraducir).toEqual([]);
  });
});

describe("WhatsApp desde las páginas en catalán", () => {
  it("el mensaje por ruta sale en catalán y con etiqueta ca:", () => {
    const ctx = waContextForPath("/ca/horaris");
    expect(ctx.label).toBe("ca:horarios");
    expect(ctx.message).toMatch(/^Hola! M'agradaria/);
    expect(waContextForPath("/ca/classes/salsa-cubana").message).toContain("salsa cubana");
    expect(waContextForPath("/ca/classes/salsa-cubana").label).toBe("ca:clase:salsa-cubana");
  });

  it("una ruta catalana sin mapa cae al genérico catalán, no al castellano", () => {
    expect(waContextForPath("/ca/otra").label).toBe("ca:general");
  });

  it("los CTA por origen respetan el idioma", () => {
    expect(decodeURIComponent(buildWaLink("hero", undefined, "ca"))).toContain("M'agradaria");
    expect(decodeURIComponent(buildWaLink("hero"))).toContain("¡Hola!");
  });
});
