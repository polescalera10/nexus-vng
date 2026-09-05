import Image from "next/image";
import { RevealEager } from "@/components/ui/RevealEager";
import { WaLink } from "@/components/ui/WaLink";
import { heroVideo } from "@/content/media";

/**
 * Hero de landing de campaña: una columna, foco total en el CTA de WhatsApp.
 * El headline nombra el dolor en las primeras palabras (contenido por props).
 *
 * De fondo va la MISMA foto de clase que el hero de la home, pero solo la foto:
 * aquí no se monta el vídeo. Son 30 landings de tráfico pagado y el trabajo del
 * bloque es que el titular y el botón se pinten cuanto antes; un MP4 de fondo
 * juega en contra de eso sin aportar nada al mensaje.
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
      <Image
        src={heroVideo.desktop.poster}
        alt=""
        width={heroVideo.desktop.ancho}
        height={heroVideo.desktop.alto}
        sizes="100vw"
        priority
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Velo: el titular es el LCP y tiene que mantener el contraste AA sobre
          una foto con suelo blanco y focos. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.82)_0%,rgba(10,10,10,.66)_50%,rgba(10,10,10,.9)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_100%,rgba(48,228,236,.16),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_0%,rgba(113,233,201,.08),transparent_70%)]" />

      <div className="container-nexus relative z-[1] flex flex-col items-start py-[clamp(56px,13vw,110px)]">
        {/* RevealEager (CSS), no Reveal: el h1 es el LCP de la campaña y con
            Framer Motion no se pinta hasta que hidrata. Misma animación. */}
        <RevealEager lcp>
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
