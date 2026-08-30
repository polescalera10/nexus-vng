import { describe, expect, it } from "vitest";
import {
  buildConversionQuery,
  readConversionNotice,
} from "@/lib/leads/conversion-notice";

/** Ida y vuelta: lo que escribe la acción es lo que lee la ficha. */
function roundTrip(summary: Parameters<typeof buildConversionQuery>[0]) {
  const params = new URLSearchParams(buildConversionQuery(summary).slice(1));
  return readConversionNotice(Object.fromEntries(params));
}

describe("readConversionNotice", () => {
  it("no pinta nada al entrar en la ficha por su cuenta", () => {
    expect(readConversionNotice({})).toBeNull();
    expect(readConversionNotice({ alta: "2" })).toBeNull();
  });

  it("celebra la conversión limpia", () => {
    const notice = roundTrip({ enrolled: 2, waitlisted: 0, failed: 0, closed: [], unmatched: [] });
    expect(notice?.tone).toBe("success");
    expect(notice?.lines).toEqual(["Matriculado en 2 clases."]);
  });

  it("singulariza una sola clase", () => {
    const notice = roundTrip({ enrolled: 1, waitlisted: 0, failed: 0, closed: [], unmatched: [] });
    expect(notice?.lines).toEqual(["Matriculado en 1 clase."]);
  });

  it("avisa de lista de espera y de lo que no se pudo cruzar", () => {
    const notice = roundTrip({
      enrolled: 1,
      waitlisted: 1,
      failed: 0,
      closed: [],
      unmatched: ["Bachata 0 · Jueves 21:30"],
    });
    expect(notice?.tone).toBe("warning");
    expect(notice?.lines).toEqual([
      "Matriculado en 1 clase.",
      "1 clase en lista de espera por aforo completo.",
      "Pidió Bachata 0 · Jueves 21:30, que no corresponde a ningún curso activo.",
    ]);
  });

  it("dice que la ficha se creó sin matrículas cuando no entró ninguna", () => {
    const notice = roundTrip({ enrolled: 0, waitlisted: 0, failed: 0, closed: [], unmatched: [] });
    expect(notice?.tone).toBe("success");
    expect(notice?.lines).toEqual(["Ficha creada sin matrículas."]);
  });

  it("trunca la lista larga y cuenta el resto", () => {
    const notice = roundTrip({
      enrolled: 0,
      waitlisted: 0,
      failed: 0,
      closed: [],
      unmatched: ["a", "b", "c", "d", "e"],
    });
    expect(notice?.lines[1]).toBe(
      "Pidió a, b, c y 2 más, que no corresponde a ningún curso activo.",
    );
  });

  it("dice qué clase rechaza su rol", () => {
    const notice = roundTrip({
      enrolled: 1,
      waitlisted: 0,
      failed: 0,
      closed: ["Heels"],
      unmatched: [],
    });
    expect(notice?.tone).toBe("warning");
    expect(notice?.lines).toEqual([
      "Matriculado en 1 clase.",
      "Heels no admite su rol, así que no se ha matriculado ahí.",
    ]);
  });

  it("ignora contadores corruptos en la URL", () => {
    const notice = readConversionNotice({ convertido: "1", alta: "-3", espera: "hola" });
    expect(notice?.lines).toEqual(["Ficha creada sin matrículas."]);
  });
});
