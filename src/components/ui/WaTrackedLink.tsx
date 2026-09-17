"use client";

import { trackWhatsAppClick } from "@/lib/analytics";
import { buildWaLink, buildWaLinkFromText, type WaOrigin } from "@/lib/whatsapp";
import { useWaPageContext } from "@/components/ui/WaPageContext";
import type { Locale } from "@/i18n/locales";

/**
 * Enlace a WhatsApp sin estilos propios, para los sitios que ya traen su
 * clase (píldoras del footer, etc.). Misma medición que `WaLink`: emite
 * `whatsapp_click` con el origen del CTA, y con `contextual` toma el mensaje
 * de la página que se está mirando.
 */
export function WaTrackedLink({
  origin,
  extra,
  contextual = false,
  locale = "es",
  className,
  children,
}: {
  origin: WaOrigin;
  extra?: string;
  contextual?: boolean;
  /** Idioma del mensaje de los CTA no contextuales (los contextuales lo sacan de la ruta). */
  locale?: Locale;
  className?: string;
  children: React.ReactNode;
}) {
  const page = useWaPageContext();
  const href = contextual ? buildWaLinkFromText(page.message) : buildWaLink(origin, extra, locale);
  const label = contextual ? page.label : extra;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackWhatsAppClick(origin, label)}
    >
      {children}
    </a>
  );
}
