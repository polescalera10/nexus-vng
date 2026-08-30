import { z } from "zod";

/**
 * Validación de alta/edición de curso (panel admin).
 * Convención weekday: 1=Lunes … 7=Domingo (ver 0013_courses.sql).
 */

const optionalUuid = z
  .string()
  .uuid("Selección no válida")
  .optional()
  .or(z.literal(""));

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida")
  .optional()
  .or(z.literal(""));

export const courseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ponle un nombre al curso")
      .max(120, "Nombre demasiado largo"),
    modalidad_id: z.string().uuid("Elige una modalidad"),
    nivel_id: optionalUuid,
    /** Profes titulares. Vacío = curso sin asignar. */
    teacher_ids: z.array(z.string().uuid("Selección no válida")).default([]),
    weekday: z.coerce
      .number({ invalid_type_error: "Elige un día" })
      .int("Elige un día")
      .min(1, "Elige un día")
      .max(7, "Elige un día"),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Hora no válida"),
    duration_min: z.coerce
      .number({ invalid_type_error: "Duración no válida" })
      .int("Duración no válida")
      .min(15, "Mínimo 15 minutos")
      .max(600, "Máximo 600 minutos"),
    capacity_leaders: z.coerce
      .number({ invalid_type_error: "Aforo no válido" })
      .int("Aforo no válido")
      .min(0, "No puede ser negativo")
      .max(200, "Aforo demasiado grande"),
    capacity_followers: z.coerce
      .number({ invalid_type_error: "Aforo no válido" })
      .int("Aforo no válido")
      .min(0, "No puede ser negativo")
      .max(200, "Aforo demasiado grande"),
    cycle_type: z.enum(["curso", "suelta"], {
      errorMap: () => ({ message: "Elige el tipo de ciclo" }),
    }),
    start_date: optionalDate,
    end_date: optionalDate,
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "La fecha de fin debe ser posterior al inicio",
      });
    }
  });

export type CourseInput = z.infer<typeof courseSchema>;
