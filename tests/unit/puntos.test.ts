import { describe, expect, it } from "vitest";
import { formatPoints } from "@/lib/format";
import {
  agruparPorMes,
  etiquetaMes,
  iconoDeMovimiento,
  progreso,
  proximoCanjeDisponible,
  siguienteMeta,
  sumarMeses,
  usosDelMes,
} from "@/lib/puntos";

const canje = (reward_id: string, requested_at: string, status = "solicitado" as const) => ({
  reward_id,
  requested_at,
  status: status as "solicitado" | "entregado" | "cancelado",
});

describe("sumarMeses (como timestamptz + interval en Postgres)", () => {
  it("suma meses sin cambiar el día", () => {
    expect(sumarMeses(new Date("2026-10-05T10:00:00Z"), 3).toISOString()).toBe(
      "2027-01-05T10:00:00.000Z",
    );
  });

  it("si el día no existe, se queda en el último del mes", () => {
    expect(sumarMeses(new Date("2026-11-30T08:00:00Z"), 3).toISOString()).toBe(
      "2027-02-28T08:00:00.000Z",
    );
  });

  it("doce meses es un año", () => {
    expect(sumarMeses(new Date("2028-02-29T00:00:00Z"), 12).toISOString()).toBe(
      "2029-02-28T00:00:00.000Z",
    );
  });
});

describe("proximoCanjeDisponible (espejo del tope de 0050)", () => {
  const ahora = new Date("2026-10-05T12:00:00Z");
  const mes = { id: "mes", redeem_limit: "trimestre" as const };

  it("sin tope, siempre disponible", () => {
    expect(
      proximoCanjeDisponible({ id: "x", redeem_limit: null }, [canje("x", "2026-10-01T00:00:00Z")], ahora),
    ).toBeNull();
  });

  it("sin canjes previos, disponible", () => {
    expect(proximoCanjeDisponible(mes, [], ahora)).toBeNull();
  });

  it("canjeado hace un mes: bloqueado hasta 3 meses después del canje", () => {
    const libre = proximoCanjeDisponible(mes, [canje("mes", "2026-09-05T09:00:00Z")], ahora);
    expect(libre?.toISOString()).toBe("2026-12-05T09:00:00.000Z");
  });

  it("canjeado hace más de 3 meses: disponible", () => {
    expect(proximoCanjeDisponible(mes, [canje("mes", "2026-06-01T00:00:00Z")], ahora)).toBeNull();
  });

  it("un canje cancelado no cuenta", () => {
    expect(
      proximoCanjeDisponible(mes, [canje("mes", "2026-10-01T00:00:00Z", "cancelado" as never)], ahora),
    ).toBeNull();
  });

  it("el tope es por premio: otro premio no bloquea", () => {
    expect(proximoCanjeDisponible(mes, [canje("otro", "2026-10-01T00:00:00Z")], ahora)).toBeNull();
  });

  it("cuenta desde el último canje, y el anual son 12 meses", () => {
    const libre = proximoCanjeDisponible(
      { id: "anio", redeem_limit: "anual" },
      [canje("anio", "2025-12-01T00:00:00Z", "entregado" as never), canje("anio", "2026-03-01T00:00:00Z", "entregado" as never)],
      ahora,
    );
    expect(libre?.toISOString()).toBe("2027-03-01T00:00:00.000Z");
  });
});

describe("usosDelMes (tope de stories y reels)", () => {
  const events = [
    { rule_code: "story_instagram", points: 5, occurred_on: "2026-10-03" },
    { rule_code: "story_instagram", points: 5, occurred_on: "2026-10-01" },
    { rule_code: "story_instagram", points: 5, occurred_on: "2026-09-30" },
    { rule_code: "story_instagram", points: -5, occurred_on: "2026-10-02" },
    { rule_code: "reel_instagram", points: 15, occurred_on: "2026-10-02" },
  ];

  it("cuenta solo apuntes positivos de esa regla en ese mes", () => {
    expect(usosDelMes(events, "story_instagram", "2026-10")).toBe(2);
    expect(usosDelMes(events, "story_instagram", "2026-09")).toBe(1);
    expect(usosDelMes(events, "reel_instagram", "2026-10")).toBe(1);
  });
});

describe("siguienteMeta y progreso", () => {
  const premios = [
    { cost_points: 1000 },
    { cost_points: 500 },
    { cost_points: 12000 },
  ];

  it("el premio más barato que todavía no alcanza", () => {
    expect(siguienteMeta(premios, 0)?.cost_points).toBe(500);
    expect(siguienteMeta(premios, 500)?.cost_points).toBe(1000);
    expect(siguienteMeta(premios, 999)?.cost_points).toBe(1000);
  });

  it("null si ya llega a todos", () => {
    expect(siguienteMeta(premios, 12000)).toBeNull();
    expect(siguienteMeta([], 10)).toBeNull();
  });

  it("progreso entero entre 0 y 100", () => {
    expect(progreso(250, 1000)).toBe(25);
    expect(progreso(999, 1000)).toBe(99);
    expect(progreso(5000, 1000)).toBe(100);
    expect(progreso(-10, 1000)).toBe(0);
  });
});

describe("agruparPorMes", () => {
  it("agrupa en orden y separa lo ganado de lo gastado", () => {
    const meses = agruparPorMes([
      { points: 200, occurred_on: "2026-10-04" },
      { points: -1000, occurred_on: "2026-10-02" },
      { points: 800, occurred_on: "2026-10-01" },
      { points: 5, occurred_on: "2026-09-20" },
    ]);
    expect(meses.map((m) => [m.mes, m.ganados, m.gastados, m.events.length])).toEqual([
      ["2026-10", 1000, 1000, 3],
      ["2026-09", 5, 0, 1],
    ]);
  });

  it("vacío, vacío", () => {
    expect(agruparPorMes([])).toEqual([]);
  });
});

describe("iconoDeMovimiento", () => {
  const reglas = new Map([["taller", "masterclass" as const]]);
  const canjes = new Map([["c1", "hoodie" as const]]);

  it("regla, canje y apunte a mano", () => {
    expect(iconoDeMovimiento({ rule_code: "taller", source: "evento", source_id: null }, reglas, canjes)).toBe("masterclass");
    expect(iconoDeMovimiento({ rule_code: null, source: "canje", source_id: "c1" }, reglas, canjes)).toBe("hoodie");
    expect(iconoDeMovimiento({ rule_code: null, source: "canje", source_id: "c9" }, reglas, canjes)).toBe("regalo");
    expect(iconoDeMovimiento({ rule_code: null, source: "manual", source_id: null }, reglas, canjes)).toBe("estrella");
  });
});

describe("etiquetaMes y formatPoints", () => {
  it("mes en castellano con mayúscula", () => {
    expect(etiquetaMes("2026-10")).toBe("Octubre 2026");
    expect(etiquetaMes("2027-01")).toBe("Enero 2027");
  });

  it("agrupa también los números de cuatro cifras (es-ES no lo hace por defecto)", () => {
    expect(formatPoints(1750)).toBe("1.750");
    expect(formatPoints(12000)).toBe("12.000");
    expect(formatPoints(500)).toBe("500");
    expect(formatPoints(-1000)).toBe("-1.000");
  });
});
