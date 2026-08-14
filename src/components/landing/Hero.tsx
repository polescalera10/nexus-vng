import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { hero } from "@/content/landing";

/** Divide el titular en la última frase para destacarla con el degradado NEXUS. */
function splitTitle(title: string): [string, string | null] {
  const idx = title.lastIndexOf(". ");
  if (idx === -1) return [title, null];
  return [title.slice(0, idx + 1), title.slice(idx + 2)];
}

export function Hero() {
  const [lead, highlight] = splitTitle(hero.title);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Fondo texturizado oscuro con zoom lento (decorativo). PLACEHOLDER: vídeo real. */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#131318_0_18px,#0c0c10_18px_36px)] motion-safe:animate-[slowzoom_22s_ease-in-out_infinite_alternate]" />
      {/* Luces de club: glow cian abajo + destello menta arriba, muy sutiles. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_100%,rgba(48,228,236,.16),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_0%,rgba(113,233,201,.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.6)_0%,rgba(10,10,10,.15)_35%,rgba(10,10,10,.45)_70%,rgba(10,10,10,.95)_100%)]" />
      {/* Marcador del vídeo pendiente (oculto en producción; reactivar como referencia si hace falta):
      <div className="absolute right-3.5 top-3.5 z-[5] rounded-md border border-white/25 px-2 py-1 font-mono text-[10px] tracking-[0.04em] text-white/55">
        [ vídeo · gente bailando ]
      </div>
      */}

      <Header />

      {/* dvh (no vh): en móvil el 100vh cuenta la barra del navegador que se
          repliega, y el CTA quedaba empujado fuera de la pantalla al cargar. */}
      <div className="container-nexus relative z-[2] flex min-h-dvh flex-col justify-end pb-[clamp(56px,9vh,110px)] pt-[110px] md:pt-[140px]">
        {/* El kicker vive DENTRO del h1, no encima.
            Visualmente no cambia nada, pero el encabezado principal de la home
            pasa a decir qué es esto y dónde está: el claim solo ("No vienes a
            una clase...") es buen copy y cero señal para una búsqueda. */}
        <h1 className="max-w-[16ch] text-balance font-display text-[clamp(48px,8.5vw,108px)] leading-[0.92] tracking-[0.005em] text-white">
          <Reveal as="span" className="mb-[22px] flex items-center gap-[9px] leading-normal">
            <span className="h-2 w-2 flex-none rounded-full bg-neon shadow-neon motion-safe:animate-[dotpulse_1.8s_ease-in-out_infinite]" />
            <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-neon-mint">
              {hero.kicker}
            </span>
          </Reveal>

          <Reveal as="span" delay={0.08} className="block">
            {lead}
            {highlight && (
              <>
                {" "}
                <span className="text-gradient-nexus">{highlight}</span>
              </>
            )}
          </Reveal>
        </h1>

        <Reveal delay={0.16}>
          <p className="mt-[22px] max-w-[48ch] font-body text-[clamp(16px,1.5vw,20px)] leading-relaxed text-white/85">
            {hero.subtitle}
          </p>
        </Reveal>

        <Reveal delay={0.24} className="mt-[30px] flex flex-wrap items-center gap-x-[22px] gap-y-4">
          <WaLink origin="hero" variant="red" className="px-7 py-[18px] text-base">
            {hero.cta}
          </WaLink>
          <span className="font-body text-sm text-white/70">{hero.ctaNote}</span>
        </Reveal>
      </div>
    </section>
  );
}
