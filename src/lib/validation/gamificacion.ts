import { z } from "zod";
import { optionalNumber } from "@/lib/validation/numbers";
import type { PointSource } from "@/types/database";

/**
 * Validación de la gamificación (migración 0027).
 * Réplica en Zod de los CHECK de la BD: el panel valida aquí y la BD vuelve a
 * validar, porque un admin con la anon key también puede escribir por REST.
 */

/**
 * Motivos que un humano puede elegir al dar puntos.
 * `canje` queda fuera a propósito: lo escribe el trigger
 * `reward_redemptions_apply`, y poder teclearlo descuadraría el saldo respecto
 * a `reward_redemptions`.
 */
export const manualPointSources = [
  "manual",
  "evento",
  "asistencia",
  "ajuste",
] as const satisfies readonly PointSource[];

export const pointEventSchema = z.object({
  student_id: z.string().uuid("Alumno no válido"),
  points: z.coerce
    .number({ invalid_type_error: "Puntos no válidos" })
    .int("Los puntos son números enteros")
    .refine((v) => v !== 0, "Cero puntos no es un apunte")
    .refine((v) => Math.abs(v) <= 10000, "Como máximo 10.000 puntos"),
  concept: z
    .string()
    .trim()
    .min(2, "Explica de qué son los puntos")
    .max(160, "Concepto demasiado largo"),
  source: z.enum(manualPointSources, {
    errorMap: () => ({ message: "Elige el motivo" }),
  }),
  /** Código de `point_rules` si viene de una regla del catálogo. */
  rule_code: z.string().trim().max(40).optional().or(z.literal("")),
  occurred_on: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida"),
});

export type PointEventInput = z.infer<typeof pointEventSchema>;

export const pointRuleSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, "Solo minúsculas, números y guiones bajos")
    .min(2, "Código demasiado corto")
    .max(40, "Código demasiado largo"),
  label: z
    .string()
    .trim()
    .min(2, "Ponle un nombre a la regla")
    .max(80, "Nombre demasiado largo"),
  points: z.coerce
    .number({ invalid_type_error: "Puntos no válidos" })
    .int("Los puntos son números enteros")
    .min(-1000, "Mínimo -1000")
    .max(1000, "Máximo 1000"),
  source: z.enum(manualPointSources, {
    errorMap: () => ({ message: "Elige el motivo" }),
  }),
  active: z.boolean(),
});

export type PointRuleInput = z.infer<typeof pointRuleSchema>;

export const rewardSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(2, "Ponle un nombre al premio")
    .max(80, "Nombre demasiado largo"),
  description: z
    .string()
    .trim()
    .max(400, "Descripción demasiado larga")
    .optional()
    .or(z.literal("")),
  cost_points: z.coerce
    .number({ invalid_type_error: "Coste no válido" })
    .int("El coste es un número entero")
    .min(1, "El coste mínimo es 1 punto")
    .max(100000, "Coste demasiado alto"),
  /** Vacío = sin límite de unidades (≠ 0, que es "agotado"). */
  stock: optionalNumber(
    z.coerce
      .number({ invalid_type_error: "Stock no válido" })
      .int("El stock es un número entero")
      .min(0, "El stock no puede ser negativo"),
  ),
  active: z.boolean(),
});

export type RewardInput = z.infer<typeof rewardSchema>;
