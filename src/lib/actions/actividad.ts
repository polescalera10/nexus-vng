"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * El alumno ha pulsado el play de un vídeo del diario (fachada de
 * `VideoEmbed`). Solo se recibe el id del vídeo: el alumno sale de la sesión
 * y la RPC (0049b) comprueba que el vídeo es de una clase suya.
 *
 * Fuego y olvido: no devuelve nada útil y nunca lanza. El vídeo tiene que
 * arrancar aunque el apunte falle.
 */
export async function registrarReproduccion(videoId: string): Promise<void> {
  const parsed = z.string().uuid().safeParse(videoId);
  if (!parsed.success) return;
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("registrar_reproduccion_video", {
      p_video_id: parsed.data,
    });
    if (error) console.warn("[actividad] vídeo:", error.message);
  } catch (e) {
    console.warn("[actividad] vídeo:", e instanceof Error ? e.message : e);
  }
}
