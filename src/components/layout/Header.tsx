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
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="container-nexus flex items-center justify-between py-4 md:py-6">
        <Logo priority />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LANDING.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-[13px] font-semibold text-white/75 no-underline transition-colors hover:text-neon"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <WaLink
          origin="nav"
          contextual
          variant="outline"
          showGlyph={false}
          className="hidden min-h-11 px-[18px] py-[9px] text-[13px] font-semibold md:inline-flex"
        >
          WhatsApp
        </WaLink>
        <MobileNav items={NAV_LANDING} />
      </div>
    </header>
  );
}
