import { z } from "zod";
import { birthdaySchema, danceRoles, phoneSchema } from "./student";

/**
 * Lo que el alumno puede cambiar de su propia ficha.
 *
 * Es deliberadamente más corto que `studentSchema`: aquí no están `email`
 * (es la identidad del enlace mágico — cambiarlo solo en `students` dejaría
 * al alumno sin poder entrar), ni `payment_status`, ni `notes`, ni `active`,
 * ni `is_founding_member`. Esta lista debe cuadrar con la lista blanca del
 * guard de Postgres (migración 0044b): el esquema es la primera barrera, el
 * trigger la última.
 */
export const perfilAlumnoSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre")
    .max(120, "Nombre demasiado largo"),
  phone: phoneSchema,
  birthday: birthdaySchema,
  dance_role: z.enum(danceRoles, {
    errorMap: () => ({ message: "Elige cómo bailas" }),
  }),
  show_in_leaderboard: z.boolean(),
});

export type PerfilAlumnoInput = z.infer<typeof perfilAlumnoSchema>;

/**
 * Ruta del avatar dentro del bucket: `<uuid de la ficha>/<fichero>`.
 *
 * La misma forma que valida el CHECK de 0044a y sobre la que decide la
 * política del bucket. Se comprueba también aquí para rechazar un intento de
 * `../` antes de que llegue a Postgres.
 */
export const avatarPathSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z0-9._-]{1,80}$/,
    "Ruta de imagen no válida",
  );
