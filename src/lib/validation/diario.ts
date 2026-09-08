import { z } from "zod";
import { parseVideoUrl } from "@/lib/video";

/**
 * Payload del diario de clase: qué se dio en la sesión y sus vídeos.
 *
 * La URL no se valida con `z.string().url()` y ya está: se pasa por
 * `parseVideoUrl`, que aplica la lista blanca de orígenes. Un enlace de un
 * dominio que no esté en la lista no llega a la base de datos — si llegara,
 * el reproductor no lo pintaría y el alumno vería un hueco sin explicación.
 */

const videoUrl = z
  .string()
  .trim()
  .min(1, "Pega el enlace del vídeo")
  .max(2048, "El enlace es demasiado largo")
  .refine((v) => parseVideoUrl(v) !== null, {
    message: "Solo se aceptan enlaces de YouTube, Vimeo o Google Drive",
  });

export const diarioSchema = z.object({
  sessionId: z.string().uuid("Sesión no válida"),
  resumen: z
    .string()
    .trim()
    .max(4000, "El resumen no puede pasar de 4000 caracteres")
    // Vacío = borrar la nota. Se distingue de "no tocar" porque el formulario
    // siempre manda el campo.
    .default(""),
  videos: z
    .array(
      z.object({
        url: videoUrl,
        titulo: z
          .string()
          .trim()
          .max(200, "El título no puede pasar de 200 caracteres")
          .optional()
          .transform((v) => (v ? v : undefined)),
      }),
    )
    .max(10, "Como máximo 10 vídeos por sesión")
    .default([]),
});

export type DiarioInput = z.infer<typeof diarioSchema>;
