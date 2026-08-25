import { z } from "zod";
import { danceRoles, E164_REGEX } from "@/lib/validation/student";

/**
 * Validación de "aceptar un lead como alumno".
 *
 * Solo se exige lo imprescindible para tener una ficha usable: nombre,
 * teléfono y email. Cumpleaños, nivel y pareja se piden más adelante desde la
 * ficha del alumno — pedirlo todo aquí convertiría un flujo de dos toques en
 * un formulario que nadie rellena.
 *
 * `dance_role` es NOT NULL en `students`, así que viaja con "both" por defecto.
 */
export const leadConversionSchema = z
  .object({
    lead_id: z.string().uuid("Lead no válido"),
    full_name: z
      .string()
      .trim()
      .min(2, "Dinos el nombre del alumno")
      .max(120, "Nombre demasiado largo"),
    phone: z
      .string()
      .trim()
      .regex(E164_REGEX, "Formato internacional, p. ej. +34600000000"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Email no válido")
      .max(254, "Email demasiado largo"),
    dance_role: z.enum(danceRoles, {
      errorMap: () => ({ message: "Elige un rol de baile" }),
    }),
    /** Curso en el que se matricula al aceptarlo. Vacío = solo crear ficha. */
    course_id: z.string().uuid("Curso no válido").optional().or(z.literal("")),
    role_in_course: z.enum(["leader", "follower"]).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.course_id && !data.role_in_course) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role_in_course"],
        message: "Indica si entra como leader o follower",
      });
    }
  });

export type LeadConversionInput = z.infer<typeof leadConversionSchema>;
