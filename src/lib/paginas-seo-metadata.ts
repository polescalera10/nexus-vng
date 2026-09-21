import type { Metadata } from "next";
import { getPaginaSeo } from "@/content/paginas-seo";
import { ogImages } from "@/lib/seo";

/**
 * `metadata` de una página de entrada SEO, a partir de su registro.
 *
 * Vive en `lib/` y no en el componente porque `generateMetadata` se ejecuta
 * fuera del árbol de React y no puede leer nada que el componente calcule.
 *
 * `openGraph` incluye `images: ogImages` a mano: Next NO fusiona ese campo con
 * el del layout raíz, lo sustituye entero, y sin esta línea el enlace se
 * comparte por WhatsApp sin miniatura (ver `lib/seo.ts`).
 */
export function metadataPaginaSeo(slug: string): Metadata {
  const p = getPaginaSeo(slug);
  if (!p) return { title: "Página no encontrada" };

  return {
    title: p.metaTitle,
    description: p.description,
    alternates: { canonical: `/${p.slug}` },
    openGraph: {
      type: "website",
      title: p.h1,
      description: p.description,
      url: `/${p.slug}`,
      images: ogImages,
    },
  };
}
