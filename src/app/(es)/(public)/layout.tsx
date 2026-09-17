import { Analytics } from "@/components/analytics/Analytics";
import { Footer } from "@/components/layout/Footer";
import { StickyWhatsApp } from "@/components/layout/StickyWhatsApp";

/**
 * Layout de la web pública: contenido + footer global + WhatsApp sticky.
 * La cabecera la pone cada página (transparente en la landing, sólida en el
 * resto vía SiteHeader) para encajar con su hero.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
      <StickyWhatsApp />
      <Analytics />
    </>
  );
}
