import { describe, expect, it } from "vitest";
import {
  waContextEvento,
  waContextForPath,
  waContextModalidad,
  waContextProfesor,
} from "@/lib/wa-page-context";

/**
 * El mensaje prerrellenado es lo único que la escuela ve al recibir el chat:
 * si vuelve a ser genérico, no se sabe sobre qué pregunta esa persona. Estos
 * tests fijan que cada sección mande su propio texto.
 */
describe("waContextForPath", () => {
  it("da un mensaje propio a cada sección", () => {
    expect(waContextForPath("/intensivos").message).toContain("los intensivos");
    expect(waContextForPath("/horarios").message).toContain("los horarios");
    expect(waContextForPath("/socio-fundador").message).toContain("socio fundador");
  });

  it("nombra la disciplina en las páginas de clase", () => {
    expect(waContextForPath("/clases/salsa-cubana").message).toBe(
      "¡Hola! Me gustaría info sobre las clases de salsa cubana 💃",
    );
    expect(waContextForPath("/clases/bachata").message).toContain("de bachata");
  });

  it("no repite mensaje entre secciones distintas", () => {
    const rutas = [
      "/",
      "/clases",
      "/clases/bachata",
      "/intensivos",
      "/horarios",
      "/eventos",
      "/profesores",
      "/socio-fundador",
      "/faq",
      "/contacto",
      "/sobre-nosotros",
    ];
    const mensajes = rutas.map((r) => waContextForPath(r).message);
    expect(new Set(mensajes).size).toBe(rutas.length);
  });

  it("tolera barra final, query y pathname vacío", () => {
    expect(waContextForPath("/intensivos/")).toEqual(waContextForPath("/intensivos"));
    expect(waContextForPath("/intensivos?utm_source=ig")).toEqual(waContextForPath("/intensivos"));
    expect(waContextForPath(null).label).toBe("home");
  });

  it("cae en la sección cuando el detalle aún no tiene nombre", () => {
    expect(waContextForPath("/eventos/fiesta-de-verano").message).toBe(
      waContextForPath("/eventos").message,
    );
    expect(waContextForPath("/profesores/ana").message).toBe(
      waContextForPath("/profesores").message,
    );
  });

  it("usa un mensaje neutro en las páginas legales", () => {
    expect(waContextForPath("/aviso-legal").label).toBe("general");
    expect(waContextForPath("/privacidad").label).toBe("general");
  });
});

/**
 * Las páginas con contenido de BD inyectan el nombre exacto (con acentos y
 * mayúsculas de verdad), que es lo que debe verse en el chat.
 */
describe("contextos con nombre de la BD", () => {
  it("usa el nombre real de la modalidad", () => {
    const { label, message } = waContextModalidad("reggaeton", "Reggaetón");
    expect(label).toBe("clase:reggaeton");
    expect(message).toContain("las clases de reggaetón");
  });

  it("entrecomilla el título del evento", () => {
    expect(waContextEvento("fiesta-verano", "Fiesta de Verano").message).toContain(
      "el evento «Fiesta de Verano»",
    );
  });

  it("nombra al profe", () => {
    const { label, message } = waContextProfesor("ana-perez", "Ana Pérez");
    expect(label).toBe("profesor:ana-perez");
    expect(message).toContain("probar una clase con Ana Pérez");
  });
});
