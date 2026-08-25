import { describe, expect, it } from "vitest";
import {
  altaPuertaSchema,
  marcaIntensivoSchema,
} from "@/lib/validation/intensivo";
import {
  intensivoSesiones,
  intensivoTitulo,
  getIntensivoSesion,
  INTENSIVO_PRECIO,
  INTENSIVO_ULTIMA_FECHA,
  intensivoFinalizado,
} from "@/content/intensivos";
import { formatEuros, todayInMadrid } from "@/lib/format";

const UUID = "11111111-2222-3333-4444-555555555555";

describe("catálogo de intensivos", () => {
  it("tiene las 8 sesiones del cartel, ordenadas por fecha", () => {
    expect(intensivoSesiones).toHaveLength(8);
    const fechas = intensivoSesiones.map((s) => s.fechaIso);
    expect([...fechas].sort()).toEqual(fechas);
  });

  it("cada sesión tiene fecha ISO válida y slug único", () => {
    for (const s of intensivoSesiones) {
      expect(s.fechaIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(new Set(intensivoSesiones.map((s) => s.value)).size).toBe(8);
  });

  it("el día del slug coincide con el día de la fecha ISO", () => {
    // Protege contra un cartel editado a medias (fecha nueva, slug viejo).
    for (const s of intensivoSesiones) {
      expect(s.value).toContain(String(Number(s.fechaIso.slice(8))));
    }
  });

  it("compone el título con el nivel cuando lo hay", () => {
    expect(intensivoTitulo(intensivoSesiones[0]!)).toBe("Salsa (Nivel 2)");
    const sinNivel = intensivoSesiones.find((s) => !s.nivel)!;
    expect(intensivoTitulo(sinNivel)).toBe(sinNivel.estilo);
  });

  it("getIntensivoSesion devuelve undefined con un slug inventado", () => {
    expect(getIntensivoSesion("intensivo-que-no-existe")).toBeUndefined();
    expect(getIntensivoSesion("intensivo-salsa-lun17")?.estilo).toBe("Salsa");
  });
});

describe("marcaIntensivoSchema", () => {
  const base = {
    sesion: "intensivo-salsa-lun17",
    leadId: UUID,
    registroId: null,
    nombre: "Ana García",
    telefono: "600111222",
    email: "ana@example.com",
    asistio: true,
    pagado: true,
    metodoPago: "efectivo" as const,
  };

  it("acepta una marca válida y pone el precio por defecto", () => {
    const parsed = marcaIntensivoSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.importe).toBe(INTENSIVO_PRECIO);
  });

  it("rechaza una sesión que no está en el cartel", () => {
    expect(
      marcaIntensivoSchema.safeParse({ ...base, sesion: "intensivo-falso" }).success,
    ).toBe(false);
  });

  it("acepta una fila de puerta (sin lead) y datos de contacto vacíos", () => {
    const parsed = marcaIntensivoSchema.safeParse({
      ...base,
      leadId: null,
      registroId: UUID,
      telefono: null,
      email: null,
      metodoPago: null,
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza un método de pago inventado", () => {
    expect(
      marcaIntensivoSchema.safeParse({ ...base, metodoPago: "criptomoneda" }).success,
    ).toBe(false);
  });
});

describe("altaPuertaSchema", () => {
  it("solo exige el nombre", () => {
    const parsed = altaPuertaSchema.safeParse({
      sesion: "intensivo-heels-lun24",
      nombre: "Nuevo Alumno",
      telefono: "",
      pagado: false,
      metodoPago: null,
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza un nombre de una sola letra", () => {
    const parsed = altaPuertaSchema.safeParse({
      sesion: "intensivo-heels-lun24",
      nombre: "A",
      telefono: "",
      pagado: false,
      metodoPago: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza un teléfono con letras", () => {
    const parsed = altaPuertaSchema.safeParse({
      sesion: "intensivo-heels-lun24",
      nombre: "Nuevo Alumno",
      telefono: "no tengo",
      pagado: false,
      metodoPago: null,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("formatEuros", () => {
  it("no muestra decimales cuando el importe es entero", () => {
    expect(formatEuros(20).replace(/ /g, " ")).toBe("20 €");
    expect(formatEuros(0).replace(/ /g, " ")).toBe("0 €");
  });

  it("mantiene los céntimos cuando los hay", () => {
    expect(formatEuros(12.5).replace(/ /g, " ")).toBe("12,5 €");
  });
});

describe("todayInMadrid", () => {
  it("devuelve el día de Madrid, no el de UTC", () => {
    // 23:30 UTC del 16 de agosto = 01:30 del 17 en Madrid (CEST, UTC+2).
    expect(todayInMadrid(new Date("2026-08-16T23:30:00Z"))).toBe("2026-08-17");
  });

  it("devuelve el formato YYYY-MM-DD", () => {
    expect(todayInMadrid()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("intensivoFinalizado", () => {
  it("la última fecha se deriva de las sesiones, no está escrita a mano", () => {
    const fechas = intensivoSesiones.map((s) => s.fechaIso);
    expect(INTENSIVO_ULTIMA_FECHA).toBe([...fechas].sort().at(-1));
  });

  it("no da por terminada la edición el mismo día de la última sesión", () => {
    // La sesión es de 19:30 a 21:30: ese día todavía se puede reservar.
    expect(intensivoFinalizado(INTENSIVO_ULTIMA_FECHA)).toBe(false);
  });

  it("sigue abierta durante la edición", () => {
    for (const s of intensivoSesiones) {
      expect(intensivoFinalizado(s.fechaIso)).toBe(false);
    }
  });

  it("cierra a partir del día siguiente a la última sesión", () => {
    const dia = new Date(`${INTENSIVO_ULTIMA_FECHA}T12:00:00Z`);
    dia.setUTCDate(dia.getUTCDate() + 1);
    expect(intensivoFinalizado(dia.toISOString().slice(0, 10))).toBe(true);
  });

  it("compara como fecha, no como texto suelto: un año después sigue cerrada", () => {
    const [y, m, d] = INTENSIVO_ULTIMA_FECHA.split("-");
    expect(intensivoFinalizado(`${Number(y) + 1}-${m}-${d}`)).toBe(true);
  });

  it("todayInMadrid devuelve un ISO comparable con las fechas del cartel", () => {
    expect(todayInMadrid()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
