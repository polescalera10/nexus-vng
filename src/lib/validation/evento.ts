import { z } from "zod";
import { safeImageSrc } from "@/lib/images";
import { optionalNumber } from "@/lib/validation/numbers";
import type { EventoTipo } from "@/types/database";

/**
 * Validación de alta/edición de evento (panel admin).
 * Réplica en Zod de los CHECK de la migración 0028.
 */

export const eventoTipos = [
  "fiesta",
  "social",
  "masterclass",
  "congreso",
  "taller",
  "intensivo",
  "otro",
] as const satisfies readonly EventoTipo[];

/** `^[a-z0-9]+(-[a-z0-9]+)*$`, igual que el CHECK `eventos_slug_format`. */
export const EVENTO_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Fiesta de Año Nuevo" → "fiesta-de-ano-nuevo". Ver `slugifyModalidad`. */
export function slugifyEvento(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** `datetime-local` del formulario → ISO. Vacío se queda vacío. */
const localDateTime = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha y hora no válidas");

/** Solo http(s) o rutas del propio sitio: un `javascript:` acabaría en un href. */
const httpUrl = (message: string) =>
  z
    .string()
    .trim()
    .max(2000, "URL demasiado larga")
    .regex(/^https?:\/\//, message)
    .optional()
    .or(z.literal(""));

export const eventoSchema = z
  .object({
    id: z.string().uuid("Evento no válido").optional().or(z.literal("")),
    titulo: z
      .string()
      .trim()
      .min(2, "Ponle un título al evento")
      .max(120, "Título demasiado largo"),
    slug: z
      .string()
      .trim()
      .regex(EVENTO_SLUG_REGEX, "Solo minúsculas, números y guiones")
      .min(2, "El slug es demasiado corto")
      .max(80, "El slug es demasiado largo"),
    tipo: z.enum(eventoTipos, {
      errorMap: () => ({ message: "Elige el tipo de evento" }),
    }),
    fecha: localDateTime,
    fecha_fin: localDateTime.optional().or(z.literal("")),
    descripcion: z
      .string()
      .trim()
      .max(20000, "La descripción es demasiado larga")
      .optional()
      .or(z.literal("")),
    ubicacion: z
      .string()
      .trim()
      .max(200, "Ubicación demasiado larga")
      .optional()
      .or(z.literal("")),
    /** Vacío = no se anuncia precio (≠ 0, que es "entrada gratuita"). */
    precio: optionalNumber(
      z.coerce
        .number({ invalid_type_error: "Precio no válido" })
        .min(0, "El precio no puede ser negativo")
        .max(10000, "Precio demasiado alto"),
    ),
    capacidad: optionalNumber(
      z.coerce
        .number({ invalid_type_error: "Aforo no válido" })
        .int("Aforo no válido")
        .min(1, "El aforo mínimo es 1")
        .max(100000, "Aforo demasiado grande"),
    ),
    puntos: z.coerce
      .number({ invalid_type_error: "Puntos no válidos" })
      .int("Puntos no válidos")
      .min(0, "No puede ser negativo")
      .max(10000, "Demasiados puntos"),
    cta_url: httpUrl("El enlace debe empezar por http:// o https://"),
    /**
     * La portada pasa por la MISMA lista blanca que las imágenes del markdown
     * (`safeImageSrc`). Antes bastaba con que empezara por http(s), lo que
     * dejaba cargar un pixel de un tercero en una página pública: el mismo
     * problema de RGPD que la auditoría B2 ya había cerrado para el markdown.
     * Validarlo aquí da un error visible al guardar en vez de una imagen que
     * desaparece sin explicación al pintarla.
     */
    cover_image_url: z
      .string()
      .trim()
      .max(2000, "URL demasiado larga")
      .refine(
        (v) => safeImageSrc(v) !== null,
        "Usa una ruta propia (/images/…) o una URL https de Supabase Storage",
      )
      .optional()
      .or(z.literal("")),
    publico: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_fin && data.fecha_fin < data.fecha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_fin"],
        message: "El fin no puede ser anterior al inicio",
      });
    }
  });

export type EventoInput = z.infer<typeof eventoSchema>;
