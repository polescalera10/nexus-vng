import { Reveal } from "@/components/ui/Reveal";
import { landingEn } from "@/content/por-idioma";
import type { Locale } from "@/i18n/locales";
import { tExperiencia } from "@/i18n/textos/inicio";

export function Experiencia({ locale = "es" }: { locale?: Locale }) {
  const t = tExperiencia[locale];
  const { experience } = landingEn(locale);
  return (
    <section className="bg-bg-panel py-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          {t.kicker}
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3.5 max-w-[18ch] text-balance font-display text-[clamp(34px,5.5vw,66px)] leading-[0.98] text-text-strong">
            {t.titulo}
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-[18px]">
          {experience.map((e, i) => (
            <Reveal
              key={e.title}
              delay={i * 0.08}
              className="rounded-lg border border-white/6 bg-bg-elevated p-[30px] shadow-card transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-neon/25"
            >
              <span className={`block h-10 w-10 rounded-sm ${e.accent}`} />
              <h3 className="mb-2.5 mt-[18px] font-display text-[clamp(24px,2.4vw,30px)] text-text-strong">
                {e.title}
              </h3>
              <p className="font-body text-base leading-relaxed text-text-muted">{e.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
