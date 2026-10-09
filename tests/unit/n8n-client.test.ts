import { afterEach, describe, expect, it, vi } from "vitest";
import { n8nConfigurado, postToN8n } from "@/lib/n8n/client";

/*
  Sin webhook no se puede decir que algo se ha enviado. Hasta el 09-10-2026
  `postToN8n` devolvía lo mismo con y sin URL, y los avisos salían en el panel
  como «enviados» sin haber salido de la app.
*/
describe("cliente de n8n", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sin N8N_WEBHOOK_URL no envía y lo dice", async () => {
    vi.stubEnv("N8N_WEBHOOK_URL", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(n8nConfigurado()).toBe(false);
    await expect(postToN8n({ type: "broadcast" })).resolves.toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("con webhook devuelve true si n8n responde 2xx", async () => {
    vi.stubEnv("N8N_WEBHOOK_URL", "https://n8n.example/webhook");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));

    expect(n8nConfigurado()).toBe(true);
    await expect(postToN8n({ type: "broadcast" })).resolves.toBe(true);
  });

  it("con webhook lanza si n8n responde con error", async () => {
    vi.stubEnv("N8N_WEBHOOK_URL", "https://n8n.example/webhook");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(postToN8n({ type: "broadcast" })).rejects.toThrow(/500/);
  });
});
