import { postToN8n } from "@/lib/n8n/client";
import type { createClient } from "@/lib/supabase/server";
import type { WhatsappEventType } from "@/types/database";

/**
 * Despacho de eventos de WhatsApp. Flujo (docs/whatsapp-contracts.md):
 *   1. inserta la fila en `whatsapp_events` (status `pendiente`) — log/cola,
 *   2. POST del evento a n8n (postToN8n),
 *   3. éxito → `enviado` + sent_at · fallo → `error`.
 * `enviado` significa "entregado a n8n", NO entrega real de WhatsApp.
 * Todo es best-effort: NUNCA lanza hacia el caller (solo console.error), para
 * que un fallo del webhook no rompa la mutación de negocio que lo dispara.
 */

/** Cliente de Supabase del caller (anon+sesión o service role, según ruta). */
type Supa = Awaited<ReturnType<typeof createClient>>;

export type DispatchWhatsappEventInput = {
  type: WhatsappEventType;
  /** null en `broadcast`: los destinatarios van en payload.recipients[]. */
  studentId: string | null;
  payload: Record<string, unknown>;
};

export async function dispatchWhatsappEvent(
  supabase: Supa,
  { type, studentId, payload }: DispatchWhatsappEventInput,
): Promise<void> {
  try {
    const { data: event, error } = await supabase
      .from("whatsapp_events")
      .insert({
        student_id: studentId,
        type,
        payload,
        status: "pendiente",
        sent_at: null,
      })
      .select("id, created_at")
      .single();

    if (error || !event) {
      console.error(
        `[dispatchWhatsappEvent] insert (${type}) falló:`,
        error?.message ?? "sin fila",
      );
      return;
    }

    try {
      await postToN8n({
        event_id: event.id,
        type,
        student_id: studentId,
        payload,
        created_at: event.created_at,
      });
      await supabase
        .from("whatsapp_events")
        .update({ status: "enviado", sent_at: new Date().toISOString() })
        .eq("id", event.id);
    } catch (e) {
      console.error(`[dispatchWhatsappEvent] POST a n8n (${type}) falló:`, e);
      await supabase
        .from("whatsapp_events")
        .update({ status: "error" })
        .eq("id", event.id);
    }
  } catch (e) {
    // Última red de seguridad: el despacho jamás rompe al caller.
    console.error(`[dispatchWhatsappEvent] fallo inesperado (${type}):`, e);
  }
}

/**
 * Reenvía a n8n los eventos que quedaron en `pendiente`.
 *
 * Hay dos formas de que un evento se quede sin despachar:
 *   · el POST a n8n falló en su momento (queda en `error`, no se toca aquí);
 *   · lo creó un TRIGGER de la base de datos, que no puede hablar con n8n.
 *     Es el caso de `puntos_hito` (migración 0027): la fila aparece cuando un
 *     alumno cruza un hito, sin que ninguna ruta de la app se entere.
 *
 * Por eso la cola necesita a alguien que la vacíe: esta función, llamada desde
 * el cron diario. Devuelve cuántos ha despachado.
 */
export async function flushPendingWhatsappEvents(
  supabase: Supa,
  limit = 100,
): Promise<number> {
  const { data: pending, error } = await supabase
    .from("whatsapp_events")
    .select("id, type, student_id, payload, created_at")
    .eq("status", "pendiente")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[flushPendingWhatsappEvents] lectura:", error.message);
    return 0;
  }
  if (!pending || pending.length === 0) return 0;

  let sent = 0;
  for (const event of pending) {
    try {
      await postToN8n({
        event_id: event.id,
        type: event.type,
        student_id: event.student_id,
        payload: event.payload,
        created_at: event.created_at,
      });
      await supabase
        .from("whatsapp_events")
        .update({ status: "enviado", sent_at: new Date().toISOString() })
        .eq("id", event.id);
      sent += 1;
    } catch (e) {
      console.error(`[flushPendingWhatsappEvents] POST (${event.type}) falló:`, e);
      await supabase
        .from("whatsapp_events")
        .update({ status: "error" })
        .eq("id", event.id);
    }
  }

  return sent;
}
