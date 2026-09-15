import { TURNSTILE_ACTION } from "@/lib/turnstile-shared";

/**
 * Verificación en servidor de Cloudflare Turnstile para los formularios de lead.
 *
 * El widget del navegador solo emite un token; lo que frena al bot es esta
 * llamada a siteverify con la clave secreta. Sin ella, cualquiera podría
 * mandar el formulario con un token inventado.
 *
 * Decisiones:
 *   · **Apagado mientras falte alguna de las dos claves.** Con solo la secreta
 *     los formularios rechazarían a todo el mundo (no habría widget que emita
 *     token); con solo la pública, el widget no protegería nada. Así un
 *     despliegue sin configurar no rompe la captación.
 *   · **Token ausente o rechazado → no se guarda el lead.**
 *   · **Siteverify caído o lento → se deja pasar y se registra.** El objetivo
 *     nº1 de la web es convertir; siguen activos el honeypot y el rate limit de
 *     Vercel Firewall. Un bot no puede forzar este camino: depende de que
 *     Cloudflare no responda, no de lo que mande el cliente.
 *   · **No se envía la IP del visitante** (`remoteip` es opcional): menos datos
 *     personales hacia un tercero, por RGPD.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Longitud máxima de un token según la documentación de Turnstile. */
const MAX_TOKEN_LENGTH = 2048;

type Env = Record<string, string | undefined>;

export type TurnstileCheck =
  | { ok: true; skipped?: "disabled" | "unavailable" }
  | { ok: false; reason: "missing-token" | "rejected" };

/** Texto que ve el visitante cuando la verificación no pasa. */
export const TURNSTILE_ERROR_MESSAGE =
  "No hemos podido comprobar que no eres un robot. Vuelve a pulsar el botón en unos segundos o escríbenos por WhatsApp.";

export function turnstileEnabled(env: Env = process.env): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(
  token: FormDataEntryValue | null,
  deps: { env?: Env; fetchImpl?: typeof fetch } = {},
): Promise<TurnstileCheck> {
  const env = deps.env ?? process.env;
  const fetchImpl = deps.fetchImpl ?? fetch;

  if (!turnstileEnabled(env)) return { ok: true, skipped: "disabled" };

  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: "missing-token" };
  }

  let data: { success?: boolean; action?: string; "error-codes"?: string[] };
  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`siteverify respondió ${res.status}`);
    data = await res.json();
  } catch (error) {
    console.error("[turnstile] siteverify no disponible; se deja pasar el lead:", error);
    return { ok: true, skipped: "unavailable" };
  }

  if (data.success !== true) {
    console.warn("[turnstile] token rechazado:", data["error-codes"]);
    return { ok: false, reason: "rejected" };
  }
  if (data.action && data.action !== TURNSTILE_ACTION) {
    console.warn("[turnstile] token de otra acción:", data.action);
    return { ok: false, reason: "rejected" };
  }
  return { ok: true };
}
