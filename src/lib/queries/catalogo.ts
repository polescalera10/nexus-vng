import { createClient } from "@/lib/supabase/server";
import type { Modalidad, Nivel } from "@/types/database";

/**
 * Catálogos compartidos del panel (modalidades y niveles).
 *
 * Vivían duplicados en `queries/teachers.ts` (disciplinas del profe) y en
 * `queries/courses.ts` (modalidad del curso), cada uno con su propia forma:
 * uno devolvía `slug + nombre` y el otro `id + nombre`, así que el mismo
 * catálogo no se podía reutilizar entre formularios ni ampliar en un solo
 * sitio. Aquí hay una única definición con todo lo que necesitan ambos.
 */

export type ModalidadOption = Pick<Modalidad, "id" | "slug" | "nombre" | "categoria">;
export type NivelOption = Pick<Nivel, "id" | "nombre">;

/** Modalidades activas, ordenadas. Vacío si la consulta falla (se registra). */
export async function getModalidadOptions(): Promise<ModalidadOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modalidades")
    .select("id, slug, nombre, categoria")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("[getModalidadOptions]", error.message);
    return [];
  }
  return data ?? [];
}

/** Niveles del catálogo, ordenados de menor a mayor. */
export async function getNivelOptions(): Promise<NivelOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("niveles")
    .select("id, nombre")
    .order("orden", { ascending: true });

  if (error) {
    console.error("[getNivelOptions]", error.message);
    return [];
  }
  return data ?? [];
}
