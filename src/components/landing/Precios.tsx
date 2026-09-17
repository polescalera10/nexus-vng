import { Reveal } from "@/components/ui/Reveal";
import { precios, preciosTiers } from "@/content/precios";
import type { Locale } from "@/i18n/locales";
import { tPrecios } from "@/i18n/textos/comun";

/**
 * Bloque de precios del curso (35 € 1 estilo · +20 €/estilo extra · 100 €
 * tarifa plana). Tres tarjetas, lee de content/precios.ts. Vive en la home
 * (debajo del founding, para sobrevivir cuando se retire la promo) y en la
 * landing de clases.
 */
export function Precios({
  locale = "es",
  title = tPrecios[locale].titulo,
  intro = tPrecios[locale].intro,
}: {
  locale?: Locale;
  title?: string;
  intro?: string;
}) {
  const t = tPrecios[locale];
  return (
    <section className="space-y-8">
      <Reveal>
        <h2 className="font-display text-[clamp(28px,4vw,42px)] text-text-strong">{title}</h2>
        <p className="mt-3 max-w-[60ch] font-body text-base leading-relaxed text-text-muted">
          {intro}
        </p>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-3">
        {preciosTiers.map((tier, idx) => (
          <Reveal
            key={tier.estilos}
            delay={idx * 0.06}
            className={`flex flex-col rounded-lg border p-6 shadow-soft transition-all duration-300 ${
              tier.destacado
                ? "border-neon/50 bg-neon/[0.06] shadow-card"
                : "border-white/8 bg-bg-panel hover:border-neon/30"
            }`}
          >
            {tier.destacado && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-neon/15 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-neon">
                {t.masPopular}
              </span>
            )}
            <h3 className="font-display text-xl text-text-strong">{t.tiers[idx]?.estilos ?? tier.estilos}</h3>
            <p className="mt-3 font-display text-[clamp(32px,5vw,44px)] leading-none text-gradient-nexus">
              {tier.prefijo}
              {tier.precio}&nbsp;€
              <span className="font-body text-sm font-semibold text-text-muted">
                /{t.periodo}
              </span>
            </p>
            <p className="mt-3 font-body text-[13px] leading-relaxed text-text-muted">{t.tiers[idx]?.nota ?? tier.nota}</p>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="font-body text-[13px] text-text-faint">
          {t.modelo(precios.base, precios.estiloExtra, precios.flat)}
        </p>
      </Reveal>
    </section>
  );
}
