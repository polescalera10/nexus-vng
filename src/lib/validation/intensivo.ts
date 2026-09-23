import { z } from "zod";
import { INTENSIVO_PRECIO } from "@/content/intensivos";

/**
 * Validación del control de asistencia y cobro de las sesiones sueltas
 * (intensivos y masterclass).
 *
 * El slug era un `z.enum` con las 8 sesiones del cartel, lo que garantizaba
 * que una marca no pudiera apuntar a una sesión inventada. Desde que las
 * masterclass entran aquí eso ya no vale: sus slugs nacen en `eventos`, se
 * crean desde el panel y no se pueden enumerar al compilar. Zod comprueba
 * ahora la FORMA, y la existencia la comprueba la Server Action contra el
 * catálogo (`getSesionSuelta`) antes de escribir nada.
 */

export const sesionIntensivoSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Sesión no válida");

export const metodoPagoSchema = z.enum(["efectivo", "bizum", "tarjeta", "otro"]);

const telefonoSchema = z
  .string()
  .trim()
  .min(6, "Teléfono no válido")
  .max(20, "Teléfono no válido")
  .regex(/^[+0-9\s().-]+$/, "El teléfono solo puede tener números y símbolos");

/** Marca de una persona en una sesión (asistencia + cobro). */
export const marcaIntensivoSchema = z.object({
  sesion: sesionIntensivoSchema,
  /** Lead que se apuntó por la web; null en las altas en puerta. */
  leadId: z.string().uuid().nullable(),
  /** Fila ya existente en `intensivo_registros`, si la hay. */
  registroId: z.string().uuid().nullable(),
  nombre: z.string().trim().min(2, "Nombre demasiado corto").max(120),
  telefono: telefonoSchema.nullable(),
  email: z.string().trim().email().max(254).nullable(),
  asistio: z.boolean(),
  pagado: z.boolean(),
  metodoPago: metodoPagoSchema.nullable(),
  importe: z.number().min(0).max(999).default(INTENSIVO_PRECIO),
});

export type MarcaIntensivoInput = z.input<typeof marcaIntensivoSchema>;

/**
 * Alta en puerta: alguien que se presenta sin haberse apuntado por la web.
 * Solo el nombre es obligatorio — la idea es teclearlo en cinco segundos con
 * la clase empezando.
 */
export const altaPuertaSchema = z.object({
  sesion: sesionIntensivoSchema,
  nombre: z.string().trim().min(2, "Escribe el nombre").max(120, "Nombre demasiado largo"),
  telefono: telefonoSchema.optional().or(z.literal("")),
  pagado: z.boolean(),
  metodoPago: metodoPagoSchema.nullable(),
});
