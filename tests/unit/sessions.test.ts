import { describe, expect, it } from "vitest";
import {
  currentMonthInMadrid,
  formatMonth,
  sessionDatesForMonth,
  toISODate,
} from "@/lib/sessions";

/**
 * Generación de sesiones por mes natural.
 *
 * El caso que motivó el cambio: el 08-09-2026 (martes), con la lógica de
 * "próximas 4 semanas desde hoy", Bachata 1 de los lunes generó el 14, 21 y
 * 28 de septiembre y el 5 de OCTUBRE — se saltó el lunes 7, que ya había
 * pasado, y se metió en el mes siguiente.
 */

describe("sessionDatesForMonth", () => {
  it("da todos los lunes de septiembre de 2026, incluido el 7 ya pasado", () => {
    expect(sessionDatesForMonth(1, "2026-09")).toEqual([
      "2026-09-07",
      "2026-09-14",
      "2026-09-21",
      "2026-09-28",
    ]);
  });

  it("no se sale del mes: nada de octubre", () => {
    const septiembre = sessionDatesForMonth(1, "2026-09");
    expect(septiembre.every((d) => d.startsWith("2026-09"))).toBe(true);
  });

  it("cuenta los cinco martes de septiembre de 2026", () => {
    expect(sessionDatesForMonth(2, "2026-09")).toEqual([
      "2026-09-01",
      "2026-09-08",
      "2026-09-15",
      "2026-09-22",
      "2026-09-29",
    ]);
  });

  it("respeta start_date: el curso empezó el lunes 7, no hay martes 1", () => {
    expect(sessionDatesForMonth(2, "2026-09", "2026-09-07")).toEqual([
      "2026-09-08",
      "2026-09-15",
      "2026-09-22",
      "2026-09-29",
    ]);
  });

  it("respeta end_date", () => {
    expect(sessionDatesForMonth(1, "2026-09", null, "2026-09-15")).toEqual([
      "2026-09-07",
      "2026-09-14",
    ]);
  });

  it("devuelve vacío cuando el mes queda fuera del rango del curso", () => {
    expect(sessionDatesForMonth(1, "2026-09", "2026-10-01")).toEqual([]);
    expect(sessionDatesForMonth(1, "2026-09", null, "2026-08-31")).toEqual([]);
  });

  it("domingo es 7 en la convención del proyecto, no 0", () => {
    expect(sessionDatesForMonth(7, "2026-09")).toEqual([
      "2026-09-06",
      "2026-09-13",
      "2026-09-20",
      "2026-09-27",
    ]);
  });

  it("febrero de un año bisiesto no desborda al mes siguiente", () => {
    const febrero = sessionDatesForMonth(6, "2028-02"); // sábados
    expect(febrero.at(-1)).toBe("2028-02-26");
    expect(febrero.every((d) => d.startsWith("2028-02"))).toBe(true);
  });

  it("rechaza entradas imposibles en vez de inventar fechas", () => {
    expect(sessionDatesForMonth(0, "2026-09")).toEqual([]);
    expect(sessionDatesForMonth(8, "2026-09")).toEqual([]);
    expect(sessionDatesForMonth(1, "2026-13")).toEqual([]);
    expect(sessionDatesForMonth(1, "septiembre")).toEqual([]);
  });
});

describe("currentMonthInMadrid", () => {
  it("usa el mes de Madrid, no el del servidor en UTC", () => {
    // 23:30 UTC del 30 de septiembre = 01:30 del 1 de octubre en Madrid.
    expect(currentMonthInMadrid(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10");
  });

  it("devuelve el formato YYYY-MM", () => {
    expect(currentMonthInMadrid(new Date("2026-09-08T10:00:00Z"))).toBe("2026-09");
  });
});

describe("formatMonth", () => {
  it("escribe el mes en castellano", () => {
    expect(formatMonth("2026-09")).toBe("septiembre de 2026");
    expect(formatMonth("2026-01")).toBe("enero de 2026");
  });
});

describe("toISODate", () => {
  it("no se desplaza un día por la zona horaria", () => {
    expect(toISODate(new Date(2026, 8, 7))).toBe("2026-09-07");
    expect(toISODate(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});
