import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { OG_LOCALE } from "@/i18n/locales";
import { tInicioMeta } from "@/i18n/textos/inicio";
import { RootShell, viewportBase } from "@/components/layout/RootShell";

/**
 * Layout raíz de las páginas en catalán (piloto de 6 páginas, ver
 * `i18n/rutas.ts`). Mismo esqueleto que `(es)/layout.tsx`, con `lang="ca"`.
 */
const homeTitle = `${tInicioMeta.ca.title} · ${site.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s · ${site.name}`,
  },
  description: tInicioMeta.ca.description,
  openGraph: {
    type: "website",
    locale: OG_LOCALE.ca,
    siteName: site.name,
    title: homeTitle,
    description: tInicioMeta.ca.description,
    url: `${site.url}/ca`,
  },
};

export const viewport: Viewport = viewportBase;

export default function RootLayoutCa({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ca">{children}</RootShell>;
}
