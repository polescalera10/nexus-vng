import { createClient } from "@/lib/supabase/server";
import type { Evento } from "@/types/database";

/**
 * Consultas de eventos para el panel. Separadas de `queries/eventos.ts`
 * a propósito: aquella usa el cliente público (anon, solo eventos `publico`)
 * y se ejecuta en páginas cacheadas de la web; esta usa la sesión del admin
 * y ve también los borradores.
 */

/** Todos los eventos, los más próximos primero y los pasados detrás. */
export async function listEventos(): Promise<Evento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("[listEventos]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getEventoById(id: string): Promise<Evento | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getEventoById]", error.message);
    return null;
  }
  return data;
}
