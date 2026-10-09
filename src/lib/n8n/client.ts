/**
 * Cliente mínimo del webhook de n8n (N8N_WEBHOOK_URL).
 * La app NUNCA llama a Meta/WhatsApp: hace POST del evento a n8n y es n8n
 * quien renderiza plantillas y envía (email + WhatsApp).
 * Solo servidor — la URL del webhook no se expone nunca al cliente.
 */
export function n8nConfigurado(): boolean {
  return Boolean(process.env.N8N_WEBHOOK_URL);
}

/**
 * Devuelve `true` si el evento llegó a n8n y `false` si no hay webhook
 * configurado. Hasta el 09-10-2026 devolvía `void` en los dos casos y
 * `dispatchWhatsappEvent` marcaba el evento como `enviado` aunque no hubiera
 * salido nada: el panel de WhatsApp enseñaba como enviados avisos que nadie
 * recibió. Un fallo de red o un 4xx/5xx sigue lanzando.
 */
export async function postToN8n(payload: object): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    console.warn("[n8n] N8N_WEBHOOK_URL no configurado; se omite el POST.");
    return false;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Evita que un webhook lento cuelgue la Server Action / ruta que llama.
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`n8n respondió ${res.status} ${res.statusText}`);
  }
  return true;
}
