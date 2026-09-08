import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Cron de sesiones del mes.
 *
 * Lo que se fija aquí es la puerta: sin CRON_SECRET no arranca, y con un
 * secreto que no cuadra devuelve 401 sin tocar la base. El endpoint escribe
 * con service role, así que un fallo de esta comprobación es escritura abierta
 * a internet — es el mismo riesgo que cubre security.test.ts para el resto de
 * los crons.
 */

const generateMonthSessions = vi.fn();
vi.mock("@/lib/sessions-write", () => ({
  generateMonthSessions: (...a: unknown[]) => generateMonthSessions(...a),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({}),
}));

const { GET } = await import("@/app/api/cron/sesiones-mes/route");

const SECRET = "secreto-de-prueba";
const url = (qs = "") => `https://nexusvng.es/api/cron/sesiones-mes${qs}`;
const req = (headers: Record<string, string>, qs = "") =>
  new Request(url(qs), { headers });

beforeEach(() => {
  generateMonthSessions.mockReset();
  generateMonthSessions.mockResolvedValue({ month: "2026-09", cursos: 15, sesiones: 55 });
  process.env.CRON_SECRET = SECRET;
});

describe("autorización", () => {
  it("500 si el servidor no tiene CRON_SECRET, y no escribe", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req({}));
    expect(res.status).toBe(500);
    expect(generateMonthSessions).not.toHaveBeenCalled();
  });

  it("401 sin secreto", async () => {
    const res = await GET(req({}));
    expect(res.status).toBe(401);
    expect(generateMonthSessions).not.toHaveBeenCalled();
  });

  it("401 con un secreto que no cuadra", async () => {
    const res = await GET(req({ "x-cron-secret": "otro" }));
    expect(res.status).toBe(401);
    expect(generateMonthSessions).not.toHaveBeenCalled();
  });

  it("acepta el Bearer que pone Vercel Cron", async () => {
    const res = await GET(req({ authorization: `Bearer ${SECRET}` }));
    expect(res.status).toBe(200);
    expect(generateMonthSessions).toHaveBeenCalled();
  });

  it("acepta el header x-cron-secret", async () => {
    const res = await GET(req({ "x-cron-secret": SECRET }));
    expect(res.status).toBe(200);
  });
});

describe("mes", () => {
  const auth = { "x-cron-secret": SECRET };

  it("sin parámetro usa el mes en curso", async () => {
    await GET(req(auth));
    const [, month] = generateMonthSessions.mock.calls[0]!;
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });

  it("acepta ?month=YYYY-MM para rellenar un mes concreto", async () => {
    await GET(req(auth, "?month=2026-10"));
    expect(generateMonthSessions.mock.calls[0]![1]).toBe("2026-10");
  });

  it("400 con un mes con formato inválido, sin tocar la base", async () => {
    for (const malo of ["2026-13", "26-10", "octubre", "2026-1", "2026-00"]) {
      const res = await GET(req(auth, `?month=${malo}`));
      expect(res.status, malo).toBe(400);
    }
    expect(generateMonthSessions).not.toHaveBeenCalled();
  });

  it("devuelve el recuento de lo generado", async () => {
    const res = await GET(req(auth));
    expect(await res.json()).toEqual({
      ok: true,
      month: "2026-09",
      cursos: 15,
      sesiones: 55,
    });
  });

  it("500 y ok:false cuando la generación falla", async () => {
    generateMonthSessions.mockResolvedValue({
      month: "2026-09",
      cursos: 0,
      sesiones: 0,
      error: "No hay cursos activos.",
    });
    const res = await GET(req(auth));
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });
});
