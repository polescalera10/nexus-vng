import type { Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { JsonLd, localBusinessLd } from "@/components/seo/JsonLd";
import "@/app/globals.css";

/*
  Esqueleto común de los layouts raíz.

  La web tiene DOS layouts raíz, uno por idioma — `app/(es)/layout.tsx` y
  `app/(ca)/layout.tsx` — porque `lang` solo se puede fijar en el `<html>` y
  las páginas son estáticas: no hay petición en la que leer la ruta. Los grupos
  de ruta no cambian las URLs. Consecuencias:
    · Pasar de un idioma al otro recarga la página entera (solo ocurre en el
      selector de idioma).
    · `app/not-found.tsx` no sirve con varios layouts raíz: las URLs que no
      casan con nada las pinta `app/global-not-found.tsx`
      (`experimental.globalNotFound` en next.config.ts).
*/

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Negro de marca en la UI del navegador (barra de estado móvil).
 * `viewportFit: "cover"` habilita las variables env(safe-area-inset-*) que usan
 * el WhatsApp sticky y el menú móvil para no quedar bajo el indicador de inicio.
 */
export const viewportBase: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function RootShell({
  lang,
  children,
  conSchema = true,
}: {
  lang: "es" | "ca";
  children: React.ReactNode;
  /** El 404 global no lleva el JSON-LD de la escuela. */
  conSchema?: boolean;
}) {
  return (
    <html lang={lang} className={`${anton.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {conSchema && <JsonLd data={localBusinessLd()} />}
      </body>
    </html>
  );
}
