import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { ultimaActualizacion } from "@/content/actualizaciones";
import { listProfesorSlugs } from "@/content/profesores";
import { getModalidadesSitemap } from "@/lib/queries/modalidades";
import { getEventosSitemap } from "@/lib/queries/eventos";

/**
 * Sitemap: SOLO URLs canónicas e indexables.
 *
 * Dos decisiones que conviene no revertir sin pensarlo:
 *
 * 1. Las 30 landings de campaña (/l/[icp]/[dolor]) NO están aquí. Se abrieron
 *    a orgánico el 01-08-2026 y la auditoría SEO del 14-08-2026 mostró el
 *    resultado: 94 % de similitud de texto entre ellas, misma plantilla, 0
 *    enlaces internos y más de la mitad de las URLs indexables del dominio.
 *    Es el patrón de contenido escalado / doorway que el sistema de contenido
 *    útil penaliza a nivel de SITIO, no de página. Vuelven a `noindex` (ver
 *    (campanas)/l/[icp]/[dolor]/page.tsx) y salen del sitemap: incluir una URL
 *    con `noindex` es mandar dos señales contradictorias.
 *
 * 2. Sin `changefreq` ni `priority`: Google los ignora desde hace años. El
 *    `lastmod` sí lo usa, pero solo si es creíble — por eso sale de fechas
 *    reales (`content/actualizaciones.ts` y `updated_at` de Supabase) y no de
 *    la fecha del build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;

  const staticPaths = [
    "",
    "/clases",
    "/socio-fundador",
    "/intensivos",
    "/profesores",
    "/horarios",
    "/eventos",
    "/sobre-nosotros",
    "/contacto",
    "/faq",
    "/aviso-legal",
    "/privacidad",
    "/cookies",
  ];

  const modalidades = await getModalidadesSitemap();
  // Fichas de evento: misma fuente que /eventos y /eventos/[slug]
  // (Supabase con fallback estático), así el sitemap nunca se desincroniza.
  const eventos = await getEventosSitemap();

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: ultimaActualizacion(path),
    })),
    ...modalidades.map(({ slug, updatedAt }) => ({
      url: `${base}/clases/${slug}`,
      lastModified: updatedAt ? new Date(updatedAt) : ultimaActualizacion("/clases"),
    })),
    ...listProfesorSlugs().map((slug) => ({
      url: `${base}/profesores/${slug}`,
      lastModified: ultimaActualizacion("/profesores"),
    })),
    ...eventos.map(({ slug, updatedAt }) => ({
      url: `${base}/eventos/${slug}`,
      lastModified: updatedAt ? new Date(updatedAt) : ultimaActualizacion("/eventos"),
    })),
  ];
}
