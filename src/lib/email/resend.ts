/**
 * Envío de correo por la API de Resend (solo servidor).
 *
 * Es el mismo Resend que usa Supabase como SMTP para los enlaces de acceso
 * (ver docs/email-templates/README.md), con el dominio `nexusvng.es` ya
 * verificado. Aquí se llama a la API HTTP con `fetch` en vez de instalar su
 * SDK: es una sola petición y así no entra otra dependencia.
 *
 * `RESEND_API_KEY` vive en Vercel. Basta con una clave de tipo "Sending
 * access" limitada al dominio: no necesita leer ni gestionar nada más.
 */

export type CorreoSaliente = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  /**
   * Resend descarta un segundo envío con la misma clave durante 24 h. Si el
   * disparador se reintenta después de un envío que sí salió, no hay
   * correo doble.
   */
  idempotencyKey?: string;
};

export class ResendNoConfigurado extends Error {
  constructor() {
    super("RESEND_API_KEY no configurada.");
  }
}

export async function enviarCorreo(correo: CorreoSaliente): Promise<{ id: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new ResendNoConfigurado();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(correo.idempotencyKey ? { "Idempotency-Key": correo.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: correo.from,
      to: correo.to,
      subject: correo.subject,
      html: correo.html,
      text: correo.text,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    // El cuerpo de error de Resend es JSON con `message`; no trae datos del correo.
    const detalle = await res.text().catch(() => "");
    throw new Error(`Resend respondió ${res.status}: ${detalle.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id?: string };
  return { id: data.id ?? "" };
}
