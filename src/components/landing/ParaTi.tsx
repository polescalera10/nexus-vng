import { Reveal } from "@/components/ui/Reveal";
import { landingEn } from "@/content/por-idioma";
import type { Locale } from "@/i18n/locales";
import { tParaTi } from "@/i18n/textos/inicio";

/**
 * "Esto es para ti": niveles + lo que se vive en clase.
 *
 * Hasta el 09-10-2026 "lo que vas a vivir" era una sección propia
 * (`Experiencia`), con tres tarjetas grandes y un cuadrado de color liso en el
 * sitio del icono, que en móvil parecía una imagen sin cargar. Las dos
 * secciones contaban lo mismo (hay sitio para ti, vas a progresar, vas a
 * encontrar gente) y sumaban ~1.600 px de scroll en móvil. Ahora es una sola.
 */
const ICONOS: Record<"progreso" | "comunidad" | "confianza", React.ReactNode> = {
  progreso: <path d="M4 19.5h4v-5H4v5ZM10 19.5h4v-9h-4v9ZM16 19.5h4v-14h-4v14Z" />,
  comunidad: (
    <>
      <circle cx="8" cy="8.5" r="3" />
      <circle cx="16.5" cy="9.5" r="2.5" />
      <path d="M2.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2M14.5 14.6c.6-.2 1.3-.3 2-.3 2.4 0 4.2 1.6 4.8 4.4" />
    </>
  ),
  confianza: (
    <path d="M12 3.5 13.9 9l5.6.2-4.4 3.5 1.6 5.4L12 15l-4.7 3.1 1.6-5.4-4.4-3.5L10.1 9 12 3.5Z" />
  ),
};

export function ParaTi({ locale = "es" }: { locale?: Locale }) {
  const t = tParaTi[locale];
  const { levels, experience } = landingEn(locale);
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

        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))]">
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

        <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-x-8 gap-y-6">
          {experience.map((e, i) => (
            <Reveal as="li" key={e.title} delay={i * 0.08} className="flex gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-neon/25 bg-neon/10 text-neon">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {ICONOS[e.icon]}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-[clamp(22px,2.2vw,26px)] leading-tight text-text-strong">{e.title}</h3>
                <p className="mt-1.5 font-body text-[15px] leading-relaxed text-text-muted">{e.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
