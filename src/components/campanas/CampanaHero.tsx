import { RevealEager } from "@/components/ui/RevealEager";
import { WaLink } from "@/components/ui/WaLink";

/**
 * Hero de landing de campaña: una columna, foco total en el CTA de WhatsApp.
 * El headline nombra el dolor en las primeras palabras (contenido por props).
 */
export function CampanaHero({
  headline,
  subhead,
  ctaLabel,
  mensajeWhatsapp,
}: {
  headline: string;
  subhead: string;
  ctaLabel: string;
  mensajeWhatsapp: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_100%,rgba(48,228,236,.16),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_0%,rgba(113,233,201,.08),transparent_70%)]" />

      <div className="container-nexus relative z-[1] flex flex-col items-start py-[clamp(56px,13vw,110px)]">
        {/* RevealEager (CSS), no Reveal: el h1 es el LCP de la campaña y con
            Framer Motion no se pinta hasta que hidrata. Misma animación. */}
        <RevealEager>
          <h1 className="max-w-[18ch] text-balance font-display text-[clamp(36px,9vw,64px)] leading-[0.96] text-white">
            {headline}
          </h1>
        </RevealEager>
        <RevealEager delay={0.08}>
          <p className="mt-5 max-w-[46ch] font-body text-[clamp(16px,2vw,19px)] leading-relaxed text-white/85">
            {subhead}
          </p>
        </RevealEager>
        <RevealEager delay={0.16} className="mt-8 flex flex-col items-start gap-3">
          <WaLink origin="campana" extra={mensajeWhatsapp} variant="red" className="px-7 py-[18px] text-base">
            {ctaLabel}
          </WaLink>
          <span className="font-body text-sm text-white/65">Clase de prueba, sin compromiso.</span>
        </RevealEager>
      </div>
    </section>
  );
}
