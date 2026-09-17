import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { RootShell, viewportBase } from "@/components/layout/RootShell";

/**
 * Title de la home: la palabra clave PRIMERO, la marca al final.
 *
 * Antes empezaba por "NEXUS VNG —": las nueve primeras posiciones del title,
 * que es donde más peso tiene, se las llevaba una marca que todavía no tiene
 * volumen de búsqueda propio. Con "Clases de baile en Vilanova i la Geltrú"
 * delante se ataca la consulta que sí lo tiene, y la marca sigue visible al
 * cierre (50 caracteres: no se trunca en el SERP).
 */
const homeTitle = `Clases de baile en ${site.locality} · ${site.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: homeTitle,
    description: site.description,
    url: site.url,
  },
  alternates: { canonical: "/" },
};

/** Layout raíz de las páginas en castellano (ver `RootShell`). */
export const viewport: Viewport = viewportBase;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="es">{children}</RootShell>;
}
