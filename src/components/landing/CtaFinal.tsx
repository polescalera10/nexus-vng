import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { landingEn } from "@/content/por-idioma";
import type { Locale } from "@/i18n/locales";

export function CtaFinal({ locale = "es" }: { locale?: Locale }) {
  const { ctaFinal } = landingEn(locale);
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-bg-panel py-[clamp(70px,10vw,130px)] text-white">
      {/* Foco de luz cian central: el último golpe de club antes del footer. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,rgba(48,228,236,.14),transparent_70%)]" />

      <div className="relative z-[1] mx-auto w-full max-w-[780px] px-[clamp(20px,5vw,56px)] text-center">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.2em] text-neon-mint">
          {ctaFinal.kicker}
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3.5 font-display text-[clamp(52px,12vw,110px)] leading-[0.9]">
            <span className="text-gradient-nexus">{ctaFinal.title}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 font-body text-[clamp(16px,1.5vw,19px)] leading-relaxed text-white/85">
            {ctaFinal.subtitle}
          </p>
        </Reveal>
        <Reveal delay={0.18} className="mt-[30px] flex justify-center">
          <WaLink origin="cta-final" locale={locale} variant="red" className="px-[34px] py-5 text-[clamp(16px,1.6vw,18px)]">
            {ctaFinal.cta}
          </WaLink>
        </Reveal>
        <p className="mt-3.5 font-body text-[13px] text-white/65">{ctaFinal.note}</p>
      </div>
    </section>
  );
}
