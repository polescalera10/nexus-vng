import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { HeroFondo } from "@/components/ui/HeroFondo";
import { HorarioSemanal } from "@/components/landing/HorarioSemanal";
import { Precios } from "@/components/landing/Precios";
import { InterestLeadForm, type InterestGroup } from "@/components/forms/InterestLeadForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, courseListLd } from "@/components/seo/JsonLd";
import { EnlacesDeEntrada } from "@/components/seo/EnlacesDeEntrada";
import { cursoRegularGrupos, sesionesRegulares } from "@/content/horario-regular";
import { portadaAnchaModalidad } from "@/content/media";
import { altEn, descripcionModalidad, nombreModalidad } from "@/content/por-idioma";
import { getModalidades } from "@/lib/queries/modalidades";
import { enlace, tieneVersion } from "@/i18n/rutas";
import type { Locale } from "@/i18n/locales";
import { tDias, tEstilo, tIdioma, tMigas, tNiveles } from "@/i18n/textos/comun";
import { tClases } from "@/i18n/textos/paginas";

const ACENTOS = ["text-neon", "text-neon-mint", "text-neon-lime"];

/**
 * Casillas del formulario en el idioma de la página. Los `value` no cambian:
 * son los que se guardan en `leads.intereses` y los que lee el panel.
 */
function gruposEn(locale: Locale): InterestGroup[] {
  if (locale === "es") return cursoRegularGrupos;
  const t = tClases[locale];
  const dias = tDias[locale];
  const niveles = tNiveles[locale];
  const estilo = tEstilo[locale].estilo;
  return cursoRegularGrupos.map((grupo, i) => {
    const esDudas = i === cursoRegularGrupos.length - 1;
    if (esDudas) {
      return {
        label: t.grupoDudas,
        options: grupo.options.map((o) => ({ value: o.value, ...t.opcionDudas })),
      };
    }
    return {
      label: dias[grupo.label] ?? grupo.label,
      options: grupo.options.map((o) => {
        const sesion = sesionesRegulares.find((s) => s.value === o.value);
        const nivel = sesion?.nivel ? (niveles[sesion.nivel] ?? sesion.nivel) : undefined;
        return {
          value: o.value,
          label: estilo(o.label),
          meta: o.meta,
          hint: [nivel, sesion?.profes].filter(Boolean).join(" · "),
        };
      }),
    };
  });
}

/** Cuerpo de la página del curso regular, compartido por `/clases` y `/ca/classes`. */
export async function Clases({ locale }: { locale: Locale }) {
  const modalidades = await getModalidades();
  const t = tClases[locale];
  const migas = tMigas[locale];

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        {/* Hero de ventas */}
        <section className="bg-bg-panel relative overflow-hidden border-b border-white/6 pt-[clamp(48px,8vw,80px)] pb-[clamp(48px,8vw,88px)]">
          <HeroFondo />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgba(113,233,201,.12),transparent_70%)]" />
          <div className="container-nexus relative z-[1]">
            <Reveal
              as="span"
              className="font-body text-neon-mint block text-xs font-bold tracking-[0.18em] uppercase"
            >
              {t.eyebrow}
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-display mt-3 max-w-[18ch] text-[clamp(40px,7vw,80px)] leading-[0.92] text-balance">
                {t.h1} <span className="text-gradient-nexus">{t.h1Destacado}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="font-body mt-5 max-w-[56ch] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-white/80">
                <strong className="font-bold text-white">{t.introFuerte}</strong> {t.intro}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#apuntarme"
                  className="bg-neon font-body text-ink shadow-neon inline-flex items-center justify-center rounded-md px-7 py-[15px] text-base font-bold no-underline transition-transform duration-200 hover:-translate-y-0.5"
                >
                  {t.apuntarme}
                </a>
                <span className="font-body text-sm text-white/60">{t.desde}</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Migas: declaran la jerarquía Inicio → Clases → disciplina, que hasta
            ahora solo existía en las fichas hijas. */}
        <div className="bg-bg-base pt-7">
          <div className="container-nexus">
            <Breadcrumbs
              locale={locale}
              items={[
                { name: migas.inicio, path: enlace("/", locale) },
                { name: migas.clases, path: enlace("/clases", locale) },
              ]}
            />
          </div>
        </div>

        {/* Por qué apuntarse */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Reveal>
              <h2 className="font-display text-text-strong max-w-[24ch] text-[clamp(28px,4vw,44px)] leading-tight">
                {t.porQue}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {t.razones.map((r, idx) => (
                <Reveal
                  key={r.title}
                  delay={idx * 0.06}
                  className="bg-bg-panel shadow-soft rounded-lg border border-white/8 p-6"
                >
                  <div className={`font-display text-2xl font-bold ${ACENTOS[idx] ?? ""}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-display text-text-strong mt-3 text-xl">{r.title}</h3>
                  <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">{r.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Estilos que puedes bailar (cards → detalle SEO) */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">{t.estilos}</h2>
              <p className="font-body text-text-muted mt-3 max-w-[60ch] text-base">{t.estilosIntro}</p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modalidades.map((m, idx) => {
                /* Foto solo de las disciplinas grabadas (content/media.ts). Las
                   demás se quedan con el degradado de marca en el mismo hueco:
                   así todas las tarjetas miden igual y la rejilla no cojea. */
                const portada = portadaAnchaModalidad(m.slug);
                const nombre = nombreModalidad(m.nombre, locale);
                const destino = `/clases/${m.slug}`;
                const soloEs = !tieneVersion(destino, locale);

                return (
                  <Reveal
                    key={m.slug}
                    delay={idx * 0.05}
                    className="bg-bg-base shadow-soft hover:border-neon/30 hover:shadow-card flex flex-col justify-between overflow-hidden rounded-lg border border-white/8 transition-all duration-300 hover:-translate-y-1"
                  >
                    {portada ? (
                      <Image
                        src={portada.src}
                        alt={altEn(portada.src, portada.alt, locale)}
                        width={portada.ancho}
                        height={portada.alto}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        className="bg-bg-elevated aspect-[4/3] w-full bg-[repeating-linear-gradient(135deg,rgba(48,228,236,.10)_0_14px,rgba(48,228,236,.03)_14px_28px)]"
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="font-display text-text-strong mb-2 text-2xl">{nombre}</h3>
                        <p className="font-body text-text-muted mb-6 text-[14px] leading-relaxed">
                          {descripcionModalidad(m, locale)}
                        </p>
                      </div>
                      {/* Anchor descriptivo, no "Ver más": el texto del enlace es
                          de lo poco que le dice a Google de qué va el destino. */}
                      <Link
                        href={enlace(destino, locale)}
                        hrefLang={soloEs ? "es" : undefined}
                        className="font-body text-neon mt-auto inline-flex items-center text-sm font-bold no-underline hover:underline"
                      >
                        {t.enlaceClase(nombre)} &rarr;
                        {soloEs && (
                          <span className="text-text-faint ml-2 text-xs font-normal">{tIdioma[locale].soloEs}</span>
                        )}
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Horario de la temporada */}
        <section id="horario" className="bg-bg-base scroll-mt-24 py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">{t.horario}</h2>
              <p className="font-body text-text-muted mt-3 max-w-[60ch] text-base">{t.horarioIntro}</p>
            </Reveal>

            {/* Fuente única de la parrilla: el mismo componente que usa
                /horarios. Antes este marcado estaba duplicado aquí. */}
            <HorarioSemanal locale={locale} />
          </div>
        </section>

        {/* Precios */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Precios locale={locale} />
          </div>
        </section>

        {/* Páginas de entrada que enlazan al catálogo. El enlace de vuelta
            (content/paginas-seo), solo en castellano: no tienen versión ca. */}
        {locale === "es" && (
          <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
            <div className="container-nexus">
              <EnlacesDeEntrada href="/clases" titulo="Las dudas de antes de elegir clase" />
            </div>
          </section>
        )}

        {/* Formulario */}
        <section id="apuntarme" className="bg-bg-base scroll-mt-24 py-[clamp(48px,8vw,96px)]">
          <div className="container-nexus grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <Reveal>
                <h2 className="font-display text-text-strong text-[clamp(30px,4.5vw,48px)] leading-tight">
                  {t.apuntate}
                </h2>
              </Reveal>
              <Reveal delay={0.06}>
                <p className="font-body text-text-muted max-w-[52ch] text-base leading-relaxed">
                  {t.apuntateIntro}
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="font-body text-text-muted text-sm">
                  {t.preguntarAntes}{" "}
                  <WaLink
                    origin="pagina"
                    contextual
                    variant="outline"
                    showGlyph={false}
                    className="px-4 py-2 text-sm"
                  >
                    {t.escribenos}
                  </WaLink>
                </p>
              </Reveal>
            </div>

            <Reveal
              delay={0.1}
              className="bg-bg-panel shadow-card rounded-xl border border-white/8 p-6 sm:p-8"
            >
              <InterestLeadForm
                locale={locale}
                origen="curso-regular"
                groups={gruposEn(locale)}
                submitLabel={t.submit}
                interesesLabel={t.interesesLabel}
                interesesHelp={t.interesesHelp}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <JsonLd
        data={courseListLd(
          modalidades.map((m) => ({ slug: m.slug, nombre: nombreModalidad(m.nombre, locale) })),
          locale,
        )}
      />
    </>
  );
}
