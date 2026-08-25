import { createPublicClient, withRetry } from "@/lib/supabase/public";
import type { Evento } from "@/types/database";

/**
 * Eventos publicados en la web.
 *
 * Antes había aquí dos eventos de ejemplo (una fiesta y una masterclass, con
 * fecha y hora inventadas) que se servían como fallback cuando la tabla estaba
 * vacía — que era SIEMPRE, porque no existía ninguna pantalla para crear
 * eventos. La web anunciaba dos citas que no existían, en contra de la regla
 * de honestidad del proyecto. El fallback está fuera: si no hay eventos
 * publicados, la página enseña su estado vacío y ya está. Se crean desde
 * `/area-privada/admin/eventos`.
 */

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Eventos públicos ordenados por fecha ascendente. */
export async function getEventos(): Promise<Evento[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    return await withRetry(async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("publico", true)
        .order("fecha", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    });
  } catch (e) {
    console.error("[getEventos]", e);
    return [];
  }
}

/** Un evento público por su slug. */
export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  if (!hasSupabaseEnv()) return null;

  try {
    return await withRetry(async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("slug", slug)
        .eq("publico", true)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    });
  } catch (e) {
    console.error("[getEventoBySlug]", e);
    return null;
  }
}

/** Slugs para generateStaticParams. */
export async function getEventoSlugs(): Promise<string[]> {
  const list = await getEventos();
  return list.map((e) => e.slug);
}

/**
 * Slug + fecha real de última edición, para el `lastmod` del sitemap.
 * Ver el porqué en `getModalidadesSitemap()`.
 */
export async function getEventosSitemap(): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  const list = await getEventos();
  return list.map((e) => ({ slug: e.slug, updatedAt: e.updated_at ?? undefined }));
}
