import { Reveal } from "@/components/ui/Reveal";
import { landingEn } from "@/content/por-idioma";
import type { Locale } from "@/i18n/locales";
import { tParaTi } from "@/i18n/textos/inicio";

export function ParaTi({ locale = "es" }: { locale?: Locale }) {
  const t = tParaTi[locale];
  const { levels } = landingEn(locale);
  return (
    <section className="bg-bg-base py-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          {t.kicker}
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3.5 max-w-[20ch] text-balance font-display text-[clamp(34px,5.5vw,66px)] leading-[0.98] text-text-strong">
            {t.titulo}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[62ch] font-body text-[clamp(16px,1.4vw,19px)] leading-relaxed text-text-body">
            {t.texto}
          </p>
        </Reveal>

        <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3">
          {levels.map((lv, i) => (
            <Reveal
              key={lv.n}
              delay={i * 0.06}
              className="rounded-md border border-white/8 bg-bg-panel p-5 shadow-soft transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-neon/30"
            >
              <div className="font-display text-3xl leading-none text-neon-mint">{lv.n}</div>
              <div className="mt-2 font-body text-sm font-semibold text-text-strong">{lv.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
