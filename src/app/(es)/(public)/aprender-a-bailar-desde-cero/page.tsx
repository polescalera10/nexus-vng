import type { Metadata } from "next";
import { PaginaEntrada } from "@/components/paginas/PaginaEntrada";
import { metadataPaginaSeo } from "@/lib/paginas-seo-metadata";

/*
  Ruta estática a propósito, no un `[slug]` de primer nivel: un segmento
  dinámico en la raíz se traga cualquier URL inexistente antes del 404 y deja
  el sitio sin página de error real. Seis carpetas explícitas cuestan seis
  ficheros de cuatro líneas y no se llevan nada por delante.

  El contenido vive en `content/paginas-seo/aprender-a-bailar-desde-cero.ts`.
*/
const SLUG = "aprender-a-bailar-desde-cero";

export const metadata: Metadata = metadataPaginaSeo(SLUG);

export default function Page() {
  return <PaginaEntrada slug={SLUG} />;
}
