"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";
import { rutaEn } from "@/i18n/rutas";
import { tIdioma } from "@/i18n/textos/comun";

/**
 * Enlace a la misma página en el otro idioma (piloto en catalán, `rutas.ts`).
 *
 * - `cabecera` y `menu`: solo en páginas con pareja. Sin pareja no se pinta:
 *   mandar a alguien a la home del otro idioma desde una ficha lo saca de lo
 *   que estaba leyendo.
 * - `pie`: siempre. Sin pareja lleva a la home del otro idioma.
 *
 * `<a>` y no `<Link>`: cada idioma tiene su layout raíz y el cambio recarga la
 * página entera de todos modos (ver `RootShell`).
 */
export function SelectorIdioma({
  locale,
  variante,
  className,
}: {
  locale: Locale;
  variante: "cabecera" | "menu" | "pie";
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const otro: Locale = locale === "es" ? "ca" : "es";
  const pareja = rutaEn(pathname, otro);
  const destino = pareja ?? (variante === "pie" ? (otro === "ca" ? "/ca" : "/") : null);
  if (!destino) return null;

  const t = tIdioma[locale];
  return (
    <a
      href={destino}
      hrefLang={otro}
      lang={otro}
      data-testid={`selector-idioma-${variante}`}
      className={className}
    >
      {t[otro]}
    </a>
  );
}
