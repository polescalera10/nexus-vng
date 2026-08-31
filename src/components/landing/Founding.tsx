import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Countdown } from "@/components/ui/Countdown";
import { WaLink } from "@/components/ui/WaLink";
import { founding } from "@/content/landing";
import { barraPct, tieneAforo, type FoundingSpots } from "@/lib/founding-spots";

/**
 * Bloque de oferta fundadora — dos columnas: tarjeta de la oferta + qué incluye.
 * Es EL bloque premium del sitio: titular con el degradado NEXUS, bordes y
 * detalles en neon-lime y glow menta sobre panel oscuro.
 * Urgencia honesta: la cuenta atrás y la barra de plazas SOLO se pintan si hay
 * datos reales — la fecha en content/landing.ts y las plazas en `leads`
 * (`getFoundingSpots()`). Sin recuento fiable, el bloque de plazas desaparece.
 */
export function Founding({ spots }: { spots: FoundingSpots }) {
  const { price, priceOld, deadline } = founding;
  const hasSpots = tieneAforo(spots);

  return (
    <section className="bg-bg-base relative overflow-hidden py-[clamp(70px,10vw,130px)] text-white">
      {/* Halo neón superior (degradado de marca, muy difuminado). */}
      <div className="pointer-events-none absolute -top-[140px] left-1/2 h-[380px] w-[680px] max-w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(113,233,201,.16),transparent_70%)]" />

      <div className="container-nexus relative z-[1] max-w-[960px]">
        <Reveal className="mb-10 text-center">
          <span className="font-body text-neon-lime block text-xs font-extrabold tracking-[0.2em] uppercase">
            {founding.kicker}
          </span>
          <h2 className="font-display mt-3.5 text-[clamp(36px,6vw,64px)] leading-[0.96] text-balance">
            <span className="text-gradient-nexus">{founding.title}</span>
          </h2>
          <p className="font-body mx-auto mt-3.5 max-w-[50ch] text-[clamp(16px,1.4vw,18px)] leading-relaxed text-white/72">
            {founding.subtitle}
          </p>
        </Reveal>

        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Columna izquierda: tarjeta de la oferta */}
          <Reveal
            delay={0.1}
            className="border-neon-lime/45 shadow-glow rounded-xl border-[1.5px] bg-[linear-gradient(180deg,#16161b,#0d0d10)] p-[clamp(24px,4vw,40px)]"
          >
            <div className="flex justify-center">
              <span className="border-neon-lime/40 bg-neon-lime/10 font-body text-neon-lime rounded-full border px-3.5 py-[7px] text-[11px] font-extrabold tracking-[0.12em] uppercase">
                {founding.badge}
              </span>
            </div>

            <div className="mt-[18px] flex items-baseline justify-center gap-2.5">
              <span className="font-display text-neon-mint text-[clamp(54px,9vw,76px)] leading-none">
                {price}
              </span>
              <span className="font-body text-[17px] text-white/65">/mes</span>
              {/* Cuota estándar tachada: solo cuando exista la cifra real. */}
              {priceOld && (
                <span className="font-body text-[19px] text-white/40 line-through">{priceOld}</span>
              )}
            </div>

            {/* Cuenta atrás: solo con fecha límite real. */}
            {deadline && (
              <>
                <div className="font-body mt-6 text-center text-xs font-semibold tracking-[0.05em] text-white/60 uppercase">
                  {founding.deadlineLabel}
                </div>
                <Countdown deadline={deadline} />
              </>
            )}

            {/* Barra de plazas: solo con aforo real. */}
            {hasSpots && (
              <div className="mt-6">
                <div className="font-body mb-2 flex justify-between text-xs text-white/65">
                  <span>Plazas fundadoras</span>
                  <span>
                    Quedan {spots.left} / {spots.total}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-white/8"
                  role="img"
                  aria-label={`Quedan ${spots.left} de ${spots.total} plazas fundadoras`}
                >
                  <div
                    className="from-neon-lime via-neon-mint to-neon h-full rounded-full bg-linear-to-r"
                    style={{ width: `${barraPct(spots.total - spots.left, spots.total)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Urgencia basada en hechos (aforo físico, periodo de apertura). */}
            <p className="font-body mt-6 text-center text-sm leading-relaxed text-white/70">
              {founding.urgencyNote}
            </p>

            <Link
              href="/socio-fundador"
              className="bg-neon-lime font-body text-ink shadow-glow mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md px-6 py-[18px] text-base font-bold no-underline transition-transform duration-200 hover:-translate-y-[3px] active:translate-y-0"
            >
              {founding.cta}
            </Link>
            <div className="mt-3 flex justify-center">
              <WaLink
                origin="founding"
                variant="outline"
                showGlyph={false}
                className="min-h-11 px-5 py-2.5 text-[13px]"
              >
                O pregúntanos por WhatsApp
              </WaLink>
            </div>
            <p className="font-body mt-3 text-center text-xs text-white/50">{founding.finePrint}</p>
          </Reveal>

          {/* Columna derecha: qué incluye la plaza fundadora */}
          <Reveal delay={0.2} className="space-y-6 text-left lg:pl-6">
            <h3 className="font-display text-neon-lime text-2xl tracking-wide uppercase">
              {founding.benefitsTitle}
            </h3>

            <p className="font-body text-[15px] leading-relaxed text-white/80">
              {founding.benefitsIntro}
            </p>

            <ul className="list-none space-y-4 p-0">
              {founding.benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3">
                  <span className="text-neon-lime mt-1 text-lg leading-none">✓</span>
                  <span className="font-body text-[14px] leading-relaxed text-white/85">
                    <strong className="text-white">{benefit.title}:</strong> {benefit.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-neon-lime/20 bg-neon-lime/5 font-body rounded-lg border p-4 text-[13px] leading-relaxed text-white/70">
              {founding.conditionNote}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
