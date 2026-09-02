import { describe, expect, it } from "vitest";
import {
  buildLeadWaLink,
  buildStudentWaLink,
  buildWaLink,
  normalizePhone,
} from "@/lib/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/site";

/**
 * buildWaLink es la función más crítica del sitio: el objetivo nº1 es convertir
 * visitas en mensajes de WhatsApp, y todos los CTA pasan por aquí. Un enlace mal
 * formado o un texto sin codificar rompe la conversión sin dar ningún error.
 */
describe("buildWaLink", () => {
  it("apunta a wa.me con el número configurado", () => {
    expect(buildWaLink("hero")).toContain(`https://wa.me/${WHATSAPP_NUMBER}?text=`);
  });

  it("codifica el mensaje base como parámetro text", () => {
    const url = new URL(buildWaLink("hero"));
    expect(url.searchParams.get("text")).toBe(
      "¡Hola! Me gustaría info de la clase de prueba de baile 🙂",
    );
  });

  it("no deja espacios ni acentos sin codificar en la query", () => {
    const raw = buildWaLink("footer");
    const query = raw.slice(raw.indexOf("?text=") + "?text=".length);
    expect(query).not.toMatch(/[\s¡áéíóúñ]/);
  });

  it("compone base + extra + emoji cuando el origen tiene mensaje propio", () => {
    const text = new URL(buildWaLink("modalidad", "Bachata")).searchParams.get("text");
    expect(text).toBe("¡Hola! Me interesa la clase de Bachata 💃");
  });

  it("usa solo el extra cuando el origen no tiene mensaje base (campañas)", () => {
    const propio = "¡Hola! Vengo de la landing de parejas y quiero info";
    const text = new URL(buildWaLink("campana", propio)).searchParams.get("text");
    expect(text).toBe(propio);
  });

  it("devuelve texto vacío para campana sin extra (no inventa mensaje)", () => {
    expect(new URL(buildWaLink("campana")).searchParams.get("text")).toBe("");
  });

  it("da un mensaje distinto por origen para poder atribuir la conversión", () => {
    const origins = ["hero", "sticky", "founding", "cta-final", "footer", "nav"] as const;
    const textos = origins.map((o) => new URL(buildWaLink(o)).searchParams.get("text"));
    expect(new Set(textos).size).toBe(origins.length);
  });

  it("no rompe con caracteres reservados de URL en el extra", () => {
    const text = new URL(buildWaLink("evento", "Fiesta & Salsa #1?")).searchParams.get("text");
    expect(text).toBe("¡Hola! Me gustaría más información sobre el evento Fiesta & Salsa #1? 💃");
  });
});

/**
 * Acciones rápidas del panel: el admin escribe AL LEAD, no a la escuela. Los
 * teléfonos de `leads` son texto libre (el schema permite espacios y símbolos),
 * así que normalizarlos bien es lo que hace que el botón funcione.
 */
describe("normalizePhone", () => {
  it("limpia espacios y símbolos y prefija +34 en los de 9 dígitos", () => {
    expect(normalizePhone("600 12 34 56")).toBe("34600123456");
    expect(normalizePhone("(600) 123-456")).toBe("34600123456");
  });

  it("respeta los que ya traen prefijo internacional", () => {
    expect(normalizePhone("+34 600 123 456")).toBe("34600123456");
    expect(normalizePhone("0034600123456")).toBe("34600123456");
  });

  it("descarta lo que no puede ser un teléfono", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("sin teléfono")).toBeNull();
  });
});

describe("buildLeadWaLink", () => {
  it("abre el chat del lead con el mensaje ya escrito", () => {
    const href = buildLeadWaLink("600 123 456", "Marta Gil");
    expect(href).toContain("https://wa.me/34600123456?text=");
    expect(decodeURIComponent(href!)).toContain("¡Hola Marta!");
  });

  it("no inventa un enlace si el teléfono no sirve", () => {
    expect(buildLeadWaLink("123", "Marta")).toBeNull();
  });
});

describe("buildStudentWaLink", () => {
  it("abre el chat del alumno saludando por su nombre", () => {
    const href = buildStudentWaLink("600 123 456", "Marta Gil");
    expect(href).toContain("https://wa.me/34600123456?text=");
    expect(decodeURIComponent(href!)).toContain("¡Hola Marta!");
  });

  it("no habla de consultas: el alumno ya está en la escuela", () => {
    expect(decodeURIComponent(buildStudentWaLink("600123456")!)).not.toContain("consulta");
  });

  it("aguanta los teléfonos en formato libre (0042)", () => {
    expect(buildStudentWaLink("0033 6 12 34 56 78")).toContain("https://wa.me/33612345678");
  });

  it("no inventa un enlace si el teléfono no sirve", () => {
    expect(buildStudentWaLink("123", "Marta")).toBeNull();
  });
});
