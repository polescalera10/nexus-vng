"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { diarioSchema, type DiarioInput } from "@/lib/validation/diario";
import { parseVideoUrl } from "@/lib/video";

/**
 * Server Action del diario de clase (migración 0043).
 * Patrón del proyecto: validar (Zod) → mutar vía createClient() (respeta RLS)
 * → revalidar. Escriben el profe de la sesión y el admin; la RLS 0043d es la
 * barrera real y aquí solo se valida encima.
 */

export type DiarioResult = { status: "success" | "error"; message?: string };

/**
 * Guarda el diario completo de una sesión: el resumen y la lista de vídeos.
 *
 * Los vídeos se reemplazan en bloque (borrar + insertar) en vez de conciliar
 * fila a fila: son tres o cuatro por sesión, el formulario manda siempre la
 * lista entera y así no hay estado intermedio raro si el profe reordena.
 */
export async function saveDiario(input: DiarioInput): Promise<DiarioResult> {
  const parsed = diarioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Los datos del diario no son válidos.",
    };
  }
  const { sessionId, resumen, videos } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tu sesión ha caducado. Vuelve a entrar." };
  }

  // La RLS de class_sessions solo devuelve la fila al titular/sustituto/admin:
  // si no llega nada, es que no manda en esta sesión.
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, course_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) {
    return {
      status: "error",
      message: "No tienes permiso para editar el diario de esta sesión.",
    };
  }

  // ── Resumen ───────────────────────────────────────────────────────────────
  if (resumen.length === 0) {
    const { error } = await supabase
      .from("session_notes")
      .delete()
      .eq("class_session_id", sessionId);
    if (error) {
      console.error("[saveDiario] borrar nota:", error.message);
      return { status: "error", message: "No se ha podido borrar el resumen." };
    }
  } else {
    const { error } = await supabase.from("session_notes").upsert(
      { class_session_id: sessionId, resumen, created_by: user.id },
      { onConflict: "class_session_id" },
    );
    if (error) {
      console.error("[saveDiario] guardar nota:", error.message);
      return { status: "error", message: "No se ha podido guardar el resumen." };
    }
  }

  // ── Vídeos ────────────────────────────────────────────────────────────────
  const { error: delError } = await supabase
    .from("session_videos")
    .delete()
    .eq("class_session_id", sessionId);
  if (delError) {
    console.error("[saveDiario] borrar vídeos:", delError.message);
    return { status: "error", message: "No se han podido actualizar los vídeos." };
  }

  if (videos.length > 0) {
    // Se guarda la URL ya normalizada (`watchUrl`): así en la base no quedan
    // parámetros de tracking ni variantes del mismo vídeo.
    const rows = videos.flatMap((v, i) => {
      const parsedVideo = parseVideoUrl(v.url);
      if (!parsedVideo) return [];
      return [
        {
          class_session_id: sessionId,
          url: parsedVideo.watchUrl,
          titulo: v.titulo ?? null,
          orden: i,
          created_by: user.id,
        },
      ];
    });

    const { error } = await supabase.from("session_videos").insert(rows);
    if (error) {
      console.error("[saveDiario] insertar vídeos:", error.message);
      return { status: "error", message: "No se han podido guardar los vídeos." };
    }
  }

  revalidatePath(`/area-privada/profesor/asistencia/${sessionId}`);
  revalidatePath(`/area-privada/profesor/cursos/${session.course_id}`);
  revalidatePath(`/area-privada/alumno/clase/${session.course_id}`);
  revalidatePath("/area-privada/alumno");

  return { status: "success", message: "Diario guardado." };
}
