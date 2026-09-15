import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDate,
  formatRelative,
  formatSessionDay,
  formatTime,
  recentMonthKeysInMadrid,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  DANCE_ROLE_LABELS,
  ENROLLMENT_STATUS_LABELS,
} from "@/lib/format";

describe("formatTime", () => {
  it("recorta los segundos que devuelve Postgres", () => {
    expect(formatTime("20:00:00")).toBe("20:00");
    expect(formatTime("09:30:00")).toBe("09:30");
  });

  it("deja intacto un valor que ya viene en HH:MM", () => {
    expect(formatTime("18:45")).toBe("18:45");
  });
});

describe("formatDate", () => {
  it("formatea una fecha ISO en es-ES", () => {
    // Se comprueba por partes: el separador de mes varía según versión de ICU.
    const out = formatDate("2026-07-17");
    expect(out).toContain("17");
    expect(out).toContain("2026");
    expect(out.toLowerCase()).toContain("jul");
  });

  it("no se desplaza un día por zona horaria (se ancla a medianoche local)", () => {
    // Sin el 'T00:00:00' del helper, un runner en UTC+X restaría un día.
    expect(formatDate("2026-01-01")).toContain("1");
    expect(formatDate("2026-01-01")).toContain("2026");
    expect(formatDate("2026-12-31")).toContain("31");
  });
});

describe("WEEKDAYS", () => {
  it("respeta la convención del proyecto 1=Lunes … 7=Domingo", () => {
    expect(WEEKDAYS[1]).toBe("Lunes");
    expect(WEEKDAYS[7]).toBe("Domingo");
    expect(WEEKDAYS_SHORT[1]).toBe("Lun");
    expect(WEEKDAYS_SHORT[7]).toBe("Dom");
  });

  it("cubre los siete días sin huecos", () => {
    for (let d = 1; d <= 7; d += 1) {
      expect(WEEKDAYS[d]).toBeTruthy();
      expect(WEEKDAYS_SHORT[d]).toBeTruthy();
    }
    expect(Object.keys(WEEKDAYS)).toHaveLength(7);
  });
});

describe("etiquetas de enums", () => {
  it("traduce los roles de baile y los estados de matrícula", () => {
    expect(DANCE_ROLE_LABELS.leader).toBe("Leader");
    expect(DANCE_ROLE_LABELS.both).toBe("Ambos");
    expect(ENROLLMENT_STATUS_LABELS.lista_espera).toBe("Lista de espera");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("colapsa lo de hace menos de un minuto en 'ahora'", () => {
    expect(formatRelative(ago(30 * 1000), now)).toBe("ahora");
  });

  it("da minutos y horas dentro del día", () => {
    expect(formatRelative(ago(5 * 60_000), now)).toBe("hace 5 min");
    expect(formatRelative(ago(3 * 3_600_000), now)).toBe("hace 3 h");
  });

  it("usa 'ayer' para el día anterior y días sueltos hasta 7", () => {
    expect(formatRelative(ago(26 * 3_600_000), now)).toBe("ayer");
    expect(formatRelative(ago(4 * 86_400_000), now)).toBe("hace 4 d");
  });

  it("a partir de una semana cae a fecha absoluta", () => {
    expect(formatRelative(ago(20 * 86_400_000), now)).toMatch(/jul/);
  });

  it("no muestra tiempos negativos por desfase de reloj", () => {
    expect(formatRelative(new Date(now.getTime() + 60_000).toISOString(), now)).toBe(
      "ahora",
    );
  });
});

describe("formatSessionDay", () => {
  // 10:00 de Madrid del miércoles 9 de septiembre de 2026.
  const ahora = new Date("2026-09-09T08:00:00Z");

  it("dice Hoy, Mañana y Ayer en vez de la fecha", () => {
    expect(formatSessionDay("2026-09-09", ahora)).toBe("Hoy");
    expect(formatSessionDay("2026-09-10", ahora)).toBe("Mañana");
    expect(formatSessionDay("2026-09-08", ahora)).toBe("Ayer");
  });

  it("a partir de ahí cae a día de la semana y fecha, sin coma", () => {
    const salida = formatSessionDay("2026-09-15", ahora);
    expect(salida).not.toContain(",");
    expect(salida).toMatch(/^mar 15/);
  });

  /**
   * Vercel corre en UTC: a las 00:30 de Madrid en verano ya es el día anterior
   * en UTC. Sin `todayInMadrid` esto diría "Mañana" a una clase que es hoy.
   */
  it("usa el día de Madrid, no el del servidor en UTC", () => {
    const medianocheMadrid = new Date("2026-09-08T22:30:00Z"); // 00:30 del día 9
    expect(formatSessionDay("2026-09-09", medianocheMadrid)).toBe("Hoy");
  });
});

describe("recentMonthKeysInMadrid", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * 22:30 UTC del 30-09 = 00:30 del 01-10 en Madrid. Con el reloj del servidor
   * el informe de horas del profesor empezaría en septiembre.
   */
  it("el día 1 de madrugada ya cuenta el mes nuevo de Madrid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T22:30:00Z"));
    expect(recentMonthKeysInMadrid(6)).toEqual([
      "2026-10",
      "2026-09",
      "2026-08",
      "2026-07",
      "2026-06",
      "2026-05",
    ]);
  });

  it("cruza el cambio de año", () => {
    const keys = recentMonthKeysInMadrid(3, new Date("2026-12-31T23:30:00Z"));
    expect(keys).toEqual(["2027-01", "2026-12", "2026-11"]);
  });
});
