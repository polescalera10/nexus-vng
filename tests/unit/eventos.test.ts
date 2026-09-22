import { describe, expect, it } from "vitest";
import { admiteInscripcion, eventoTerminado, finDelEvento } from "@/lib/eventos";

/**
 * La ficha pública y la Server Action de inscripción deciden con esta misma
 * función: si se separan, el formulario puede estar oculto y seguir aceptando
 * altas (o al revés).
 */

const masterclass = {
  tipo: "masterclass" as const,
  fecha: "2026-10-03T18:00:00+02:00",
  fecha_fin: "2026-10-03T20:00:00+02:00",
};

const enPlena = new Date("2026-10-03T18:30:00+02:00");
const antes = new Date("2026-09-22T10:00:00+02:00");
const despues = new Date("2026-10-03T20:01:00+02:00");

describe("eventoTerminado", () => {
  it("cuenta el fin, no el inicio: a media clase sigue sin terminar", () => {
    expect(eventoTerminado(masterclass, enPlena)).toBe(false);
    expect(eventoTerminado(masterclass, antes)).toBe(false);
    expect(eventoTerminado(masterclass, despues)).toBe(true);
  });

  it("sin `fecha_fin` manda la hora de inicio", () => {
    const sinFin = { ...masterclass, fecha_fin: null };
    expect(finDelEvento(sinFin)).toBe(new Date(sinFin.fecha).getTime());
    expect(eventoTerminado(sinFin, enPlena)).toBe(true);
  });
});

describe("admiteInscripcion", () => {
  it("solo las masterclass que no han terminado", () => {
    expect(admiteInscripcion(masterclass, antes)).toBe(true);
    expect(admiteInscripcion(masterclass, despues)).toBe(false);
    expect(admiteInscripcion({ ...masterclass, tipo: "fiesta" }, antes)).toBe(false);
    expect(admiteInscripcion({ ...masterclass, tipo: "taller" }, antes)).toBe(false);
  });
});
