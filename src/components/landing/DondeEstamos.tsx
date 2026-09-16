import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { MapaSala } from "@/components/ui/MapaSala";
import { site } from "@/lib/site";

/**
 * "Dónde estamos" en la home: la dirección y el mapa de la sala.
 *
 * Va justo después de "Cómo empezar": el mapa es logística, lo mira quien ya
 * ha decidido venir. Las reseñas no van aquí sino en la sección de comunidad,
 * más arriba, donde todavía se está decidiendo (decisión del 16-09-2026).
 */
export function DondeEstamos() {
  return (
    <section aria-labelledby="donde-estamos-titulo" className="border-t border-white/5 bg-bg-panel py-[clamp(56px,9vw,110px)]">
      <div className="container-nexus grid items-center gap-[clamp(28px,5vw,56px)] lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon-mint">
            La sala
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="donde-estamos-titulo" className="mt-3 font-display text-[clamp(36px,6vw,64px)] leading-[0.95] text-text-strong">
              Dónde <span className="text-gradient-nexus">estamos</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <address className="mt-5 font-body text-base not-italic leading-7 text-text-body">
              <strong className="text-text-strong">{site.nap.venue}</strong>
              <br />
              {site.nap.streetAddress}
              <br />
              {site.nap.postalCode} {site.nap.addressLocality}, junto a {site.locality}
            </address>
            <p className="mt-4 max-w-[46ch] font-body text-[15px] leading-relaxed text-text-muted">
              Estamos en la primera planta del gimnasio. Si te cuesta encontrarnos, escríbenos y te
              guiamos. Los horarios de cada clase están en{" "}
              <Link href="/horarios" className="font-semibold text-neon no-underline hover:underline">
                la parrilla de la temporada
              </Link>
              .
            </p>
          </Reveal>
        </div>
        {/* Sin Reveal: el mapa se mide al montar y un contenedor oculto lo
            dejaría a 0 px hasta la primera animación. */}
        <MapaSala />
      </div>
    </section>
  );
}
