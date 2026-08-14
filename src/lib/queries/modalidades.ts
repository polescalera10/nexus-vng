import { createPublicClient } from "@/lib/supabase/public";
import { modalidadesFallback } from "@/content/landing";
import type { Modalidad } from "@/types/database";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type ModalidadCard = Pick<Modalidad, "slug" | "nombre" | "descripcion">;

/**
 * Modalidades activas, ordenadas. Cae al fallback estático si no hay BD
 * configurada o la consulta falla — así la web compila y se ve sin Supabase.
 */
export async function getModalidades(): Promise<ModalidadCard[]> {
  if (!hasSupabaseEnv()) return modalidadesFallback;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("modalidades")
      .select("slug, nombre, descripcion")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error || !data || data.length === 0) return modalidadesFallback;
    return data;
  } catch {
    return modalidadesFallback;
  }
}

/** Una modalidad por slug (para /clases/[modalidad]). */
export async function getModalidadBySlug(slug: string): Promise<ModalidadCard | null> {
  if (!hasSupabaseEnv()) {
    return modalidadesFallback.find((m) => m.slug === slug) ?? null;
  }
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("modalidades")
      .select("slug, nombre, descripcion")
      .eq("slug", slug)
      .eq("activo", true)
      .maybeSingle();
    return data ?? modalidadesFallback.find((m) => m.slug === slug) ?? null;
  } catch {
    return modalidadesFallback.find((m) => m.slug === slug) ?? null;
  }
}

/** Slugs para generateStaticParams. */
export async function getModalidadSlugs(): Promise<string[]> {
  const list = await getModalidades();
  return list.map((m) => m.slug);
}

/**
 * Slug + fecha real de última edición, para el `lastmod` del sitemap.
 *
 * Google solo hace caso de `lastmod` si le parece fiable; si todas las URLs
 * llevan la fecha del build, deja de usarlo. Cuando no hay BD (o la fila no
 * trae fecha) se devuelve `undefined` y el sitemap cae a la fecha declarada a
 * mano para esa sección.
 */
export async function getModalidadesSitemap(): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  if (!hasSupabaseEnv()) return modalidadesFallback.map((m) => ({ slug: m.slug }));

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("modalidades")
      .select("slug, updated_at")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error || !data || data.length === 0) {
      return modalidadesFallback.map((m) => ({ slug: m.slug }));
    }
    return data.map((m) => ({ slug: m.slug, updatedAt: m.updated_at ?? undefined }));
  } catch {
    return modalidadesFallback.map((m) => ({ slug: m.slug }));
  }
}
