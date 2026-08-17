import { z } from "zod";
import { intensivoSesiones, INTENSIVO_PRECIO } from "@/content/intensivos";

/**
 * Validación del control de asistencia y cobro de intensivos.
 * Los slugs válidos salen del cartel (`src/content/intensivos.ts`), no de la
 * BD: así una marca solo puede apuntar a una sesión que existe de verdad.
 */

const SLUGS = intensivoSesiones.map((s) => s.value) as [string, ...string[]];

export const sesionIntensivoSchema = z.enum(SLUGS);

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
