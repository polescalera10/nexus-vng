import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { turnstileEnabled, verifyTurnstile } from "@/lib/turnstile";

/**
 * La verificación de Turnstile decide si un lead se guarda. Los casos que
 * importan: que un despliegue sin claves no rompa los formularios, que un
 * token falso o ausente no pase, y que una caída de Cloudflare no se coma
 * leads reales.
 */

const ENV = { TURNSTILE_SECRET_KEY: "secreto", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "publica" };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("turnstileEnabled", () => {
  it("solo se activa con las dos claves", () => {
    expect(turnstileEnabled(ENV)).toBe(true);
    expect(turnstileEnabled({ TURNSTILE_SECRET_KEY: "secreto" })).toBe(false);
    expect(turnstileEnabled({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: "publica" })).toBe(false);
    expect(turnstileEnabled({})).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sin claves deja pasar y no llama a Cloudflare", async () => {
    const fetchImpl = vi.fn();
    const result = await verifyTurnstile(null, { env: {}, fetchImpl });
    expect(result).toEqual({ ok: true, skipped: "disabled" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rechaza sin token, con token vacío o desmesurado, sin llamar a Cloudflare", async () => {
    const fetchImpl = vi.fn();
    for (const token of [null, "", "x".repeat(2049)]) {
      const result = await verifyTurnstile(token, { env: ENV, fetchImpl });
      expect(result).toEqual({ ok: false, reason: "missing-token" });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("acepta un token que siteverify da por bueno y no le manda la IP", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, action: "lead" }));
    const result = await verifyTurnstile("token-bueno", { env: ENV, fetchImpl });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("secret")).toBe("secreto");
    expect(body.get("response")).toBe("token-bueno");
    expect(body.has("remoteip")).toBe(false);
  });

  it("rechaza un token que siteverify no valida", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: false, "error-codes": ["invalid-input-response"] }));
    const result = await verifyTurnstile("token-falso", { env: ENV, fetchImpl });
    expect(result).toEqual({ ok: false, reason: "rejected" });
  });

  it("rechaza un token válido emitido para otra acción", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, action: "login" }));
    const result = await verifyTurnstile("token-ajeno", { env: ENV, fetchImpl });
    expect(result).toEqual({ ok: false, reason: "rejected" });
  });

  it("si Cloudflare falla o responde 5xx, deja pasar el lead", async () => {
    const caido = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    expect(await verifyTurnstile("token", { env: ENV, fetchImpl: caido })).toEqual({
      ok: true,
      skipped: "unavailable",
    });

    const error500 = vi.fn().mockResolvedValue(jsonResponse({}, 503));
    expect(await verifyTurnstile("token", { env: ENV, fetchImpl: error500 })).toEqual({
      ok: true,
      skipped: "unavailable",
    });
  });
});
