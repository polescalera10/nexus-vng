import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_SITE } from "@/components/layout/nav-items";
import { WaLink } from "@/components/ui/WaLink";
import Link from "next/link";

/**
 * Cabecera sólida para las páginas de soporte (no-landing).
 * En móvil los enlaces viven en MobileNav; el CTA de WhatsApp solo se pinta
 * a partir de md para no competir con el botón de menú en pantallas estrechas.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-ink/95 backdrop-blur">
      <div className="container-nexus flex items-center justify-between py-3 md:py-4">
        <Logo size={34} priority />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_SITE.map((item) => (
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
        <MobileNav items={NAV_SITE} />
      </div>
    </header>
  );
}
