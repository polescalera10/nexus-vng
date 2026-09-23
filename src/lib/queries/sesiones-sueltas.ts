import { createClient } from "@/lib/supabase/server";
import {
  SESIONES_INTENSIVO,
  sesionDeEvento,
  type SesionSuelta,
} from "@/lib/sesiones-sueltas";

/**
 * Consultas del catálogo de sesiones sueltas. La conversión al formato común
 * vive en `lib/sesiones-sueltas.ts` (pura, con sus tests); aquí solo está lo
 * que toca la base.
 */

export type { SesionSuelta };

const CAMPOS = "slug, titulo, fecha, fecha_fin, ubicacion, precio";

/**
 * Masterclasses del panel, publicadas o no: el control de asistencia hace falta
 * igual para una que todavía esté en borrador.
 */
async function getMasterclasses(): Promise<SesionSuelta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos")
    .select(CAMPOS)
    .eq("tipo", "masterclass")
    .order("fecha", { ascending: true });

  if (error) {
    console.error("[getMasterclasses]", error.message);
    return [];
  }
  return (data ?? []).map(sesionDeEvento);
}

/** Intensivos + masterclasses, cada grupo por su lado y ordenado por fecha. */
export async function listSesionesSueltas(): Promise<{
  intensivos: SesionSuelta[];
  masterclasses: SesionSuelta[];
}> {
  return { intensivos: SESIONES_INTENSIVO, masterclasses: await getMasterclasses() };
}

/**
 * Una sesión por su slug, sea del cartel o de `eventos`. Devuelve `null` si no
 * existe: es lo que impide que una marca de asistencia apunte a una sesión
 * inventada, ahora que los slugs de masterclass no se pueden enumerar en un
 * `z.enum` porque nacen en la base.
 */
export async function getSesionSuelta(slug: string): Promise<SesionSuelta | null> {
  const delCartel = SESIONES_INTENSIVO.find((s) => s.slug === slug);
  if (delCartel) return delCartel;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos")
    .select(CAMPOS)
    .eq("slug", slug)
    .eq("tipo", "masterclass")
    .maybeSingle();

  if (error) {
    console.error("[getSesionSuelta]", error.message);
    return null;
  }
  return data ? sesionDeEvento(data) : null;
}
