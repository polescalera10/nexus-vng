import { z } from "zod";
import type { DanceRole, PaymentStatus } from "@/types/database";

/** Valores válidos de los enums del alumno (fuente: types/database.ts). */
export const danceRoles = ["leader", "follower", "both"] as const satisfies readonly DanceRole[];
export const paymentStatuses = ["al_dia", "pendiente"] as const satisfies readonly PaymentStatus[];

/**
 * Teléfono en texto libre.
 *
 * Los alumnos llegan con números de aquí y de fuera, escritos de mil formas
 * ("600 11 22 33", "+34 600112233", "0033 6 12 34 56 78"). Exigir E.164 en el
 * formulario solo conseguía bloquear altas legítimas, así que aquí se valida
 * lo mismo que en los leads (solo dígitos y símbolos de teléfono) y la
 * normalización a E.164 se intenta al guardar, sin rechazar lo que no encaje.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(6, "Teléfono demasiado corto")
  .max(25, "Teléfono demasiado largo")
  .regex(/^[+0-9\s().-]+$/, "El teléfono solo puede tener números y símbolos");

export const studentSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Dinos el nombre del alumno")
    .max(120, "Nombre demasiado largo"),
  phone: phoneSchema,
  /**
   * Obligatorio: es la identidad con la que el alumno entra al área privada
   * (magic link). La columna sigue admitiendo null en BD para las fichas
   * históricas dadas de alta antes de que existiera el acceso.
   */
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email no válido")
    .max(254, "Email demasiado largo"),
  /** ISO `YYYY-MM-DD`. Alimenta la felicitación automática. */
  birthday: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00Z`);
      return !Number.isNaN(d.getTime()) && d < new Date() && d.getUTCFullYear() > 1900;
    }, "Fecha no válida")
    .optional()
    .or(z.literal("")),
  dance_role: z.enum(danceRoles, {
    errorMap: () => ({ message: "Elige un rol de baile" }),
  }),
  nivel_id: z.string().uuid("Nivel no válido").optional().or(z.literal("")),
  partner_id: z.string().uuid("Pareja no válida").optional().or(z.literal("")),
  payment_status: z.enum(paymentStatuses, {
    errorMap: () => ({ message: "Elige el estado de la cuota" }),
  }),
  is_founding_member: z.boolean(),
  notes: z.string().trim().max(2000, "Notas demasiado largas").optional().or(z.literal("")),
  active: z.boolean(),
});

export type StudentInput = z.infer<typeof studentSchema>;

/** Notas editables desde la ficha del profesor. */
export const studentNotesSchema = z.object({
  student_id: z.string().uuid("Alumno no válido"),
  notes: z.string().trim().max(2000, "Notas demasiado largas").optional().or(z.literal("")),
});
