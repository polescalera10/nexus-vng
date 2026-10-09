import { Analytics } from "@/components/analytics/Analytics";
import { Footer } from "@/components/layout/Footer";
import { StickyWhatsApp } from "@/components/layout/StickyWhatsApp";

/** Pie, WhatsApp sticky y analítica de las páginas en catalán. */
export default function PublicLayoutCa({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer locale="ca" />
      <StickyWhatsApp locale="ca" />
      <Analytics locale="ca" />
    </>
  );
}
