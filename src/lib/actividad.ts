import { createClient } from "@/lib/supabase/server";

/**
 * Apunta que el alumno de la sesión ha abierto una sección de su área.
 * Alimenta el informe diario (`/api/cron/informe-alumnos`).
 *
 * Una fila por alumno y día (0049a/b): la RPC resuelve el alumno desde la
 * sesión y descarta cualquier sección fuera de su lista blanca. Se llama desde
 * las páginas, no desde el layout: en el App Router el layout no se vuelve a
 * renderizar al navegar entre páginas hermanas y contaría una sola visita.
 *
 * Nunca rompe la página. Si el apunte falla, se pierde una visita del
 * informe; si fallara la página, el alumno se quedaría sin su área.
 */
export type SeccionAlumno = "inicio" | "ranking" | "perfil" | "clase";

export async function registrarVisita(seccion: SeccionAlumno): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("registrar_visita_alumno", { p_seccion: seccion });
    if (error) console.warn("[actividad] visita:", error.message);
  } catch (e) {
    console.warn("[actividad] visita:", e instanceof Error ? e.message : e);
  }
}
