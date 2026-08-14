import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Web app manifest. Next lo sirve en /manifest.webmanifest y mete el
 * <link rel="manifest"> solo, sin tocar el layout.
 *
 * Para qué sirve aquí: cuando alguien añade la web a la pantalla de inicio
 * desde Android/Chrome (flujo real en una escuela que vive del móvil), el
 * icono que se instala sale de aquí — no del favicon.
 *
 * `purpose: "maskable"` es el que Android recorta en círculo/squircle: lleva
 * la N más pequeña para que no se coma el glifo al enmascarar.
 * Los colores son espejo de los tokens de globals.css (--color-ink).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Escuela de baile en ${site.locality}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
