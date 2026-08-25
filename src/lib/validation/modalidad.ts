import { z } from "zod";
import type { ModalidadCategoria } from "@/types/database";

/**
 * Validación del alta rápida de modalidad (panel admin).
 * Réplica en Zod de los CHECK de la migración 0025.
 */

export const modalidadCategorias = [
  "clase",
  "compania",
] as const satisfies readonly ModalidadCategoria[];

export const MODALIDAD_CATEGORIA_LABELS: Record<ModalidadCategoria, string> = {
  clase: "Clase abierta",
  compania: "Grupo de compañía",
};

/** `^[a-z0-9]+(-[a-z0-9]+)*$`, igual que el CHECK `modalidades_slug_format`. */
export const MODALIDAD_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * "Cía Bachata Lady" → "cia-bachata-lady".
 *
 * `normalize("NFD")` separa la tilde de la letra y el rango \u0300-\u036f la
 * borra, así que "í" pasa a "i" sin tabla de equivalencias. La ñ se trata
 * aparte porque descomponerla daría "n" y perdería el sonido — pero para un
 * slug es exactamente lo que queremos, así que cae en el mismo saco.
 */
export function slugifyModalidad(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export const modalidadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Ponle un nombre a la modalidad")
    .max(80, "Nombre demasiado largo"),
  descripcion: z
    .string()
    .trim()
    .max(400, "Descripción demasiado larga")
    .optional()
    .or(z.literal("")),
  categoria: z.enum(modalidadCategorias, {
    errorMap: () => ({ message: "Elige el tipo de modalidad" }),
  }),
});

export type ModalidadInput = z.infer<typeof modalidadSchema>;
