import { describe, expect, it } from "vitest";
import {
  SESIONES_INTENSIVO,
  sesionDeEvento,
  type EventoSesion,
} from "@/lib/sesiones-sueltas";
import { site } from "@/lib/site";

/**
 * Intensivos y masterclass comparten la pantalla de asistencia y cobro, pero
 * vienen de sitios distintos (el cartel del repo y la tabla `eventos`): estas
 * pruebas cubren la conversión al formato común.
 */

const masterclass: EventoSesion = {
  slug: "masterclass-bachazouk-de-0-a-1",
  titulo: "Bachazouk de 0 a 1",
  // 18:00 de Madrid en octubre (CEST, +02).
  fecha: "2026-10-03T16:00:00+00:00",
  fecha_fin: "2026-10-03T18:00:00+00:00",
  ubicacion: "En Tu Salsa · Cubelles",
  precio: 20,
};

describe("sesionDeEvento", () => {
  it("saca el día y la hora en hora de Madrid, no en UTC", () => {
    const s = sesionDeEvento(masterclass);
    expect(s.fechaIso).toBe("2026-10-03");
    expect(s.detalle).toBe("18:00 – 20:00 · En Tu Salsa · Cubelles");
  });

  it("una clase de madrugada no se va al día anterior", () => {
    const s = sesionDeEvento({
      ...masterclass,
      // 00:30 del día 4 en Madrid es 22:30 del 3 en UTC.
      fecha: "2026-10-03T22:30:00+00:00",
      fecha_fin: null,
    });
    expect(s.fechaIso).toBe("2026-10-04");
    expect(s.detalle).toBe("00:30 · En Tu Salsa · Cubelles");
  });

  it("sin sala cae en la de la escuela", () => {
    expect(sesionDeEvento({ ...masterclass, ubicacion: null }).detalle).toContain(
      site.nap.venue,
    );
  });

  it("sin precio anunciado cobra 0, nunca un importe inventado", () => {
    expect(sesionDeEvento({ ...masterclass, precio: null }).precio).toBe(0);
    expect(sesionDeEvento({ ...masterclass, precio: 0 }).precio).toBe(0);
    expect(sesionDeEvento(masterclass).precio).toBe(20);
  });
});

describe("SESIONES_INTENSIVO", () => {
  it("son las 8 del cartel, a 20 € y ordenadas por fecha", () => {
    expect(SESIONES_INTENSIVO).toHaveLength(8);
    expect(SESIONES_INTENSIVO.every((s) => s.precio === 20)).toBe(true);
    expect(SESIONES_INTENSIVO.every((s) => s.tipo === "intensivo")).toBe(true);
    const fechas = SESIONES_INTENSIVO.map((s) => s.fechaIso);
    expect([...fechas].sort()).toEqual(fechas);
  });

  it("ningún slug de intensivo choca con el formato de slug de evento", () => {
    for (const s of SESIONES_INTENSIVO) {
      expect(s.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
