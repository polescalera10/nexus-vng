import { createPublicClient, withRetry } from "@/lib/supabase/public";
import { founding } from "@/content/landing";
import { SIN_DATO, type FoundingSpots } from "@/lib/founding-spots";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Plazas fundadoras que quedan, en vivo.
 *
 * El total (10) es una decisión de negocio y vive en `content/landing.ts`. Las
 * ocupadas salen de `leads`: cada solicitud con origen `socio-fundador` que no
 * esté descartada ocupa una plaza. Como `leads` es PII y su RLS solo deja leer a
 * admin, el recuento llega por el RPC `founding_spots_taken()` (migración 0036),
 * que devuelve un agregado y nada más.
 *
 * Se consulta con el cliente público (sin cookies) para no romper el ISR de las
 * páginas que lo usan. Si algo falla se devuelve `SIN_DATO` y el contador
 * desaparece: mejor sin cifra que con una inventada.
 */
export async function getFoundingSpots(): Promise<FoundingSpots> {
  const total = founding.spotsTotal;
  if (total === null || total <= 0) return SIN_DATO;
  if (!hasSupabaseEnv()) return SIN_DATO;

  try {
    return await withRetry(async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("founding_spots_taken");

      if (error) throw new Error(error.message);
      if (typeof data !== "number") throw new Error("founding_spots_taken no devolvió un número");

      // Si entran más solicitudes que plazas, quedan 0 (no un negativo).
      return { left: Math.max(0, total - data), total };
    });
  } catch (e) {
    console.error("[getFoundingSpots]", e);
    return SIN_DATO;
  }
}
