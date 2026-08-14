import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Sin `disallow`.
 *
 * El área privada se mantiene fuera del índice con `X-Robots-Tag: noindex`
 * (ver next.config.ts), que es más fuerte: bloquear el rastreo impide leer la
 * etiqueta y Google puede acabar indexando la URL desnuda si alguien la
 * enlaza. Las landings de campaña tampoco se bloquean aquí — llevan `noindex`
 * en su metadata y necesitan ser rastreables para que se lea.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
