import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { HorarioSemanal } from "@/components/landing/HorarioSemanal";
import { Negritas } from "@/components/ui/Negritas";
import { WaLink } from "@/components/ui/WaLink";
import { EnlacesDeEntrada } from "@/components/seo/EnlacesDeEntrada";
import { modalidadesFallback } from "@/content/landing";
import { modalidadesContenido } from "@/content/modalidades";
import { landingEn, nombreModalidad } from "@/content/por-idioma";
import { diasSemana, horarioRegular, sesionesRegulares } from "@/content/horario-regular";
import { enlace, tieneVersion } from "@/i18n/rutas";
import type { Locale } from "@/i18n/locales";
import { tDias, tIdioma, tMigas, tNiveles } from "@/i18n/textos/comun";
import { tHorarios } from "@/i18n/textos/paginas";

/**
 * Disciplinas del curso regular con sus clases reales, para la sección "Qué se
 * baila cada día". Cruza el cartel (`horario-regular`) con el mapa editorial
 * (`modalidades`), que es quien sabe qué estilos del cartel pertenecen a cada
 * página de disciplina. Si una disciplina no tiene clases esta temporada, no
 * aparece.
 */
const disciplinasConHorario = modalidadesFallback
  .map((m) => {
    const estilos = modalidadesContenido[m.slug]?.estilos ?? [];
    const sesiones = sesionesRegulares.filter((s) =>
      estilos.includes(s.estilo.replace(/\s+\d+$/, "").trim()),
    );
    return {
      slug: m.slug,
      nombre: m.nombre,
      sesiones,
      profes: [...new Set(sesiones.map((s) => s.profes))],
    };
  })
  .filter((d) => d.sesiones.length > 0);

/* Datos derivados del cartel oficial (nada escrito a mano aquí). */
export const primeraFranja = horarioRegular[0]?.hora ?? "";
export const ultimaFranja = horarioRegular[horarioRegular.length - 1]?.hora ?? "";
const primerDia = diasSemana[0] ?? "";
const ultimoDia = diasSemana[diasSemana.length - 1] ?? "";
const totalClases = sesionesRegulares.length;

/** Cuerpo de la página de horarios, compartido por `/horarios` y `/ca/horaris`. */
export function Horarios({ locale }: { locale: Locale }) {
  const t = tHorarios[locale];
  const migas = tMigas[locale];
  const dias = tDias[locale];
  const niveles = tNiveles[locale];
  const { levels } = landingEn(locale);
  const primero = dias[primerDia] ?? primerDia;
  const ultimo = dias[ultimoDia] ?? ultimoDia;

  return (
    <SupportPage
      locale={locale}
      eyebrow={t.eyebrow(primero, ultimo)}
      title={t.h1}
      intro={t.intro(totalClases, primero.toLowerCase(), ultimo.toLowerCase())}
    >
      <div className="mb-8">
        <Breadcrumbs
          locale={locale}
          items={[
            { name: migas.inicio, path: enlace("/", locale) },
            { name: migas.horarios, path: enlace("/horarios", locale) },
          ]}
        />
      </div>
      <div className="space-y-[clamp(48px,7vw,80px)]">
        {/* Parrilla real de la temporada — misma fuente que /clases. */}
        <section className="space-y-6">
          <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">{t.parrilla}</h2>
          <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">
            {t.parrillaIntro(primero.toLowerCase(), ultimo.toLowerCase(), primeraFranja, ultimaFranja)}
          </p>

          <HorarioSemanal locale={locale} />

          <p className="font-body text-text-muted max-w-[65ch] text-[15px] leading-relaxed">
            {t.saberAntes}{" "}
            <Link href={enlace("/clases", locale)} className="text-neon font-semibold no-underline hover:underline">
              {t.entraCurso}
            </Link>{" "}
            {t.abreDisciplina}{" "}
            <Link
              href={enlace("/clases#apuntarme", locale)}
              className="text-neon font-semibold no-underline hover:underline"
            >
              {t.tarifasFormulario}
            </Link>{" "}
            {t.ordenado}
          </p>
        </section>

        {/* Qué se baila cada día, por disciplina.
            Dos motivos: la parrilla es una tabla y casi no deja texto que
            indexar (esta página tenía 482 palabras siendo la quinta más
            enlazada del sitio), y las fichas de disciplina solo recibían
            enlaces del menú — aquí entran desde el cuerpo y con anchor
            descriptivo. Todo sale del cartel: no hay días ni horas a mano. */}
        <section className="space-y-6">
          <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">{t.queSeBaila}</h2>
          <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">{t.queSeBailaIntro}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {disciplinasConHorario.map((d) => {
              const destino = `/clases/${d.slug}`;
              const soloEs = !tieneVersion(destino, locale);
              return (
                <div key={d.slug} className="border-white/8 bg-bg-panel shadow-soft rounded-lg border p-5">
                  <h3 className="font-display text-text-strong text-2xl">
                    <Link
                      href={enlace(destino, locale)}
                      hrefLang={soloEs ? "es" : undefined}
                      className="text-inherit no-underline transition-colors hover:text-neon"
                    >
                      {t.clasesDe(nombreModalidad(d.nombre, locale))}
                    </Link>
                    {soloEs && (
                      <span className="font-body text-text-faint ml-2 text-xs">{tIdioma[locale].soloEs}</span>
                    )}
                  </h3>
                  <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">
                    {d.sesiones
                      .map((s) => {
                        const nivel = s.nivel ? (niveles[s.nivel] ?? s.nivel) : "";
                        return `${dias[s.dia] ?? s.dia} ${s.hora}${nivel ? ` (${nivel})` : ""}`;
                      })
                      .join(" · ")}
                  </p>
                  <p className="font-body text-text-faint mt-2 text-[13px]">{t.con(d.profes.join(", "))}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Niveles + CTA */}
        <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <h2 className="font-display text-text-strong text-3xl">{t.niveles}</h2>
            <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">
              <Negritas texto={t.nivelesTexto} className="text-text-strong" />
            </p>
            <ul className="space-y-3">
              {levels.map((l) => (
                <li key={l.n} className="flex items-center gap-4">
                  <span className="font-display text-neon-mint text-2xl">{l.n}</span>
                  <span className="font-body text-text-strong text-[15px] font-semibold">{l.label}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-text-muted max-w-[65ch] text-[15px] leading-relaxed">{t.noSabes}</p>
          </div>

          <aside className="bg-bg-panel shadow-card h-fit rounded-lg border border-white/8 p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-text-strong text-2xl">{t.hueco}</h2>
            <p className="font-body text-text-muted mt-2 text-[15px]">{t.huecoTexto}</p>
            <WaLink origin="pagina" contextual variant="red" className="mt-4 w-full py-[15px]">
              {t.consultar}
            </WaLink>
            <p className="font-body text-text-faint mt-3 text-[13px]">{t.nota}</p>
          </aside>
        </section>

        {/* Enlace de vuelta a las páginas de entrada que mandan aquí
            (content/paginas-seo). Solo en castellano: no tienen versión ca. */}
        {locale === "es" && (
          <EnlacesDeEntrada href="/horarios" titulo="Antes de mirar el cartel" />
        )}
      </div>
    </SupportPage>
  );
}
