import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_LANDING } from "@/components/layout/nav-items";
import { WaLink } from "@/components/ui/WaLink";
import Link from "next/link";

/**
 * Cabecera transparente sobre el hero (posición absoluta).
 * Usada por la landing. Otras páginas pueden usar SiteHeader (sólido).
 * En móvil los enlaces viven en MobileNav; el CTA de WhatsApp solo se pinta
 * a partir de md para no competir con el botón de menú en pantallas estrechas.
 */
// z-[75] en la cabecera: por encima del panel de MobileNav (z-[65], montado
// en <body>) para que la hamburguesa siga visible y pulsable con el menú abierto.
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-[75]">
      <div className="container-nexus flex items-center justify-between py-4 md:py-6">
        <Logo priority />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LANDING.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body hover:text-neon text-[13px] font-semibold text-white/75 no-underline transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* El envoltorio es el que oculta el CTA por debajo de md: `WaLink`
            lleva `inline-flex` en sus clases base y Tailwind v4 emite
            `.inline-flex` después de `.hidden`, así que un `hidden` puesto en
            su `className` pierde y el botón se pintaba también en móvil,
            compitiendo con la hamburguesa. */}
        <div className="hidden md:block">
          <WaLink
            origin="nav"
            contextual
            variant="outline"
            showGlyph={false}
            className="min-h-11 px-[18px] py-[9px] text-[13px] font-semibold"
          >
            WhatsApp
          </WaLink>
        </div>
        <MobileNav items={NAV_LANDING} />
      </div>
    </header>
  );
}
