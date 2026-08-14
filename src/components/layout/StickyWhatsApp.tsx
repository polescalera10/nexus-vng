"use client";

import { useEffect, useState } from "react";
import { trackWhatsAppClick } from "@/lib/analytics";
import { buildWaLinkFromText } from "@/lib/whatsapp";
import { useWaPageContext } from "@/components/ui/WaPageContext";
import { WaGlyph } from "@/components/ui/WaGlyph";

/**
 * Botón WhatsApp sticky, siempre accesible en móvil.
 * Aparece tras pasar el hero (>560px de scroll) deslizándose desde abajo.
 *
 * Está en el layout de toda la web pública, así que es el CTA que más se
 * pulsa desde páginas distintas: el mensaje sale del contexto de la página
 * (intensivos, una modalidad concreta, un evento…), no de un texto fijo.
 */
export function StickyWhatsApp() {
  const [shown, setShown] = useState(false);
  const page = useWaPageContext();

  useEffect(() => {
    const onScroll = () => setShown((window.scrollY || window.pageYOffset || 0) > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={{ transform: shown ? "translateY(0)" : "translateY(140%)" }}
    >
      <a
        href={buildWaLinkFromText(page.message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("sticky", page.label)}
        className="pointer-events-auto relative flex max-w-full items-center justify-center gap-[11px] rounded-full bg-neon px-6 py-4 text-center font-body text-sm font-bold text-ink no-underline shadow-neon sm:px-7 sm:text-[15px]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-neon motion-safe:animate-[pulsering_2.6s_ease-out_infinite]"
        />
        <WaGlyph size={18} className="bg-ink" />
        Reserva tu clase de prueba
      </a>
    </div>
  );
}
