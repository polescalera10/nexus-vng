import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { founding } from "@/content/landing";

/** Oferta fundadora, versión compacta de una columna para landing de campaña. */
export function CampanaFounding({ mensajeWhatsapp }: { mensajeWhatsapp: string }) {
  return (
    <section className="bg-bg-base py-[clamp(56px,9vw,100px)] text-white">
      <div className="container-nexus max-w-[560px]">
        <Reveal className="rounded-xl border-[1.5px] border-neon-lime/45 bg-[linear-gradient(180deg,#16161b,#0d0d10)] p-[clamp(24px,5vw,40px)] text-center shadow-glow">
          <span className="rounded-full border border-neon-lime/40 bg-neon-lime/10 px-3.5 py-[7px] font-body text-[11px] font-extrabold uppercase tracking-[0.12em] text-neon-lime">
            {founding.badge}
          </span>

          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="font-display text-[clamp(46px,10vw,64px)] leading-none text-neon-mint">
              {founding.price}
            </span>
            <span className="font-body text-base text-white/65">al mes</span>
          </div>

          <p className="mt-4 font-body text-sm leading-relaxed text-white/70">{founding.urgencyNote}</p>

          <WaLink origin="campana" extra={mensajeWhatsapp} variant="gold" className="mt-6 w-full py-[16px] text-base">
            {founding.cta}
          </WaLink>
          <p className="mt-3 font-body text-xs text-white/50">{founding.finePrint}</p>
        </Reveal>
      </div>
    </section>
  );
}
