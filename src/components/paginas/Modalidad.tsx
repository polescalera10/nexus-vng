import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { Galeria } from "@/components/ui/Galeria";
import { Negritas } from "@/components/ui/Negritas";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { SetWaPageContext } from "@/components/ui/WaPageContext";
import { waContextModalidad } from "@/lib/wa-page-context";
import { JsonLd, courseLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getModalidades, getModalidadBySlug } from "@/lib/queries/modalidades";
import { mediaModalidades } from "@/content/media";
import { articulosDeDisciplina } from "@/content/blog";
import { EnlacesDeEntrada } from "@/components/seo/EnlacesDeEntrada";
import { sesionesRegulares } from "@/content/horario-regular";
import { precios } from "@/content/precios";
import { profesoresDe } from "@/content/profesores";
import { founding } from "@/content/landing";
import { altEn, claimProfesor, contenidoModalidad, nombreModalidad } from "@/content/por-idioma";
import { site } from "@/lib/site";
import { enlace, tieneVersion } from "@/i18n/rutas";
import type { Locale } from "@/i18n/locales";
import { tDias, tEstilo, tIdioma, tMigas, tNiveles } from "@/i18n/textos/comun";
import { tModalidad } from "@/i18n/textos/paginas";

/** "Salsa 1" → "Salsa": el nombre de disciplina sin el número de nivel. */
const baseEstilo = (estilo: string) => estilo.replace(/\s+\d+$/, "").trim();

const TARJETA =
  "group flex h-full flex-col rounded-lg border border-white/8 bg-bg-panel p-5 text-inherit no-underline shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-neon/30 hover:shadow-card";

/** Cuerpo de la ficha de disciplina, compartido por `/clases/[slug]` y `/ca/classes/[slug]`. */
export async function Modalidad({ slug, locale }: { slug: string; locale: Locale }) {
  const m = await getModalidadBySlug(slug);
  if (!m) notFound();

  const t = tModalidad[locale];
  const migas = tMigas[locale];
  const marcaEs = tIdioma[locale].soloEs;
  const dias = tDias[locale];
  const niveles = tNiveles[locale];
  const estilo = tEstilo[locale].estilo;
  const nombre = nombreModalidad(m.nombre, locale);
  const nivelVisible = (n?: string) => (n ? (niveles[n] ?? n) : undefined);

  // Contenido editorial largo (content/modalidades.ts). Puede no existir si la
  // modalidad se creó en la BD sin redactar aún su página.
  const contenido = contenidoModalidad(m.slug, locale);
  const todas = await getModalidades();
  const otras = todas.filter((o) => o.slug !== m.slug);
  const nombrePorSlug = new Map(todas.map((o) => [o.slug, nombreModalidad(o.nombre, locale)]));

  // Clases REALES de esta disciplina en el cartel semanal, grupos de compañía
  // incluidos: cuentan como una clase regular más.
  const sesiones = contenido
    ? sesionesRegulares.filter((s) => contenido.estilos.includes(baseEstilo(s.estilo)))
    : [];

  // Profesores que la imparten, derivados del cartel (content/profesores.ts).
  const profes = profesoresDe(m.slug);

  // Enlaces cruzados: solo a disciplinas que existen y están activas.
  const relacionadas = (contenido?.relacionadas ?? []).filter((r) => nombrePorSlug.has(r.slug));
  const delBlog = articulosDeDisciplina(m.slug);

  // Material audiovisual de ESTA disciplina, si se llegó a grabar. Puede no
  // haberlo: ver la cabecera de content/media.ts.
  const media = mediaModalidades[m.slug];
  const ruta = enlace(`/clases/${m.slug}`, locale);
  const destinoEs = (path: string) => (tieneVersion(path, locale) ? undefined : "es");

  return (
    <SupportPage
      locale={locale}
      /* El h1 lleva la consulta completa ("Clases de bachata en Vilanova i la
         Geltrú"), no solo el nombre del estilo: title, h1 y URL apuntando a lo
         mismo es la señal on-page más básica y aquí el h1 se la estaba
         saltando. El nombre corto se mantiene como kicker. */
      eyebrow={nombre}
      title={contenido?.seo?.h1 ?? t.h1(nombre, site.locality)}
      intro={contenido?.lead ?? m.descripcion ?? undefined}
    >
      {/* Los CTA globales (sticky, cabecera, footer) escriben sobre ESTA disciplina. */}
      <SetWaPageContext {...waContextModalidad(m.slug, m.nombre, locale)} />
      <Breadcrumbs
        locale={locale}
        items={[
          { name: migas.inicio, path: enlace("/", locale) },
          { name: migas.clases, path: enlace("/clases", locale) },
          { name: nombre, path: ruta },
        ]}
      />

      {/* Aviso de desvío: quien busca la CLASE y cae en el grupo de compañía
          tiene aquí el enlace bueno antes de leer nada más. */}
      {contenido?.seo?.aviso && locale === "es" && (
        <div className="mt-6 rounded-lg border border-neon/25 bg-bg-elevated/60 p-4">
          <p className="font-body text-[15px] leading-relaxed text-text-body">
            {contenido.seo.aviso.texto}{" "}
            <Link
              href={contenido.seo.aviso.enlace.href}
              className="font-semibold text-neon no-underline hover:underline"
            >
              {contenido.seo.aviso.enlace.label} &rarr;
            </Link>
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-12">
          {contenido ? (
            <>
              {/* ¿Qué es? */}
              <Reveal as="section" className="space-y-4">
                <h2 className="font-display text-3xl text-text-strong">{contenido.queEsTitle}</h2>
                {contenido.queEs.map((p) => (
                  <p key={p.slice(0, 32)} className="max-w-[70ch] font-body text-base leading-relaxed text-text-body">
                    {p}
                  </p>
                ))}
              </Reveal>

              {/* En clase aprenderás */}
              <Reveal as="section" className="space-y-4">
                <h2 className="font-display text-3xl text-text-strong">{t.aprenderas}</h2>
                <ul className="space-y-3">
                  {contenido.aprenderas.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-[7px] h-2 w-2 flex-none rounded-full bg-neon" aria-hidden />
                      <span className="max-w-[65ch] font-body text-[15px] leading-relaxed text-text-body">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Cómo es una clase */}
              <Reveal as="section" className="space-y-4">
                <h2 className="font-display text-3xl text-text-strong">{t.comoEs}</h2>
                {contenido.comoEsLaClase.map((p) => (
                  <p key={p.slice(0, 32)} className="max-w-[70ch] font-body text-base leading-relaxed text-text-body">
                    {p}
                  </p>
                ))}
              </Reveal>

              {/* Horario real de la disciplina + precio. Si la disciplina no
                  está en el cartel, no se pinta la parrilla vacía. */}
              <Reveal as="section" className="space-y-5">
                <h2 className="font-display text-3xl text-text-strong">
                  {sesiones.length > 0 ? t.horarioYPrecio(nombre) : t.precio(nombre)}
                </h2>

                {sesiones.length > 0 && (
                  <>
                    <p className="max-w-[65ch] font-body text-[15px] leading-relaxed text-text-muted">
                      {t.sesionesIntro(nombre)}
                    </p>
                    <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-3 p-0">
                      {sesiones.map((s) => (
                        <li
                          key={s.value}
                          className="rounded-lg border border-white/8 bg-bg-panel p-4 shadow-soft"
                        >
                          <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-neon-mint">
                            {dias[s.dia] ?? s.dia}
                          </p>
                          <p className="mt-1 font-display text-2xl leading-none text-text-strong">
                            {s.hora}
                          </p>
                          <p className="mt-2 font-body text-[14px] font-semibold text-text-body">
                            {estilo(s.estilo)}
                            {s.nivel && (
                              <span className="font-normal text-text-muted"> · {nivelVisible(s.nivel)}</span>
                            )}
                          </p>
                          <p className="mt-0.5 font-body text-[13px] text-text-muted">{s.profes}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="rounded-lg border border-neon-mint/20 bg-bg-panel p-5">
                  <p className="font-body text-[15px] leading-relaxed text-text-body">
                    <Negritas
                      className="text-neon-mint"
                      texto={t.precioTexto({
                        base: precios.base,
                        extra: precios.estiloExtra,
                        flat: precios.flat,
                        periodo: precios.periodo,
                      })}
                    />
                  </p>
                  <p className="mt-2 font-body text-[13px] leading-relaxed text-text-muted">
                    {t.variosDias}{" "}
                    <Link
                      href="/socio-fundador"
                      hrefLang={destinoEs("/socio-fundador")}
                      className="font-semibold text-neon no-underline hover:underline"
                    >
                      {t.plazaFundador}
                    </Link>{" "}
                    {t.dejaTodas(founding.price)}{" "}
                    <Link
                      href={enlace("/clases#horario", locale)}
                      className="font-semibold text-neon no-underline hover:underline"
                    >
                      {t.horarioCompleto}
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>

              {/* Qué te llevas */}
              <Reveal as="section" className="space-y-5">
                <h2 className="font-display text-3xl text-text-strong">{t.teLlevas}</h2>
                <div className="space-y-5">
                  {contenido.beneficios.map((b) => (
                    <div key={b.title} className="max-w-[70ch]">
                      <h3 className="font-body text-[16px] font-bold normal-case tracking-normal text-text-strong">
                        {b.title}
                      </h3>
                      <p className="mt-1 font-body text-[15px] leading-relaxed text-text-body">{b.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* ¿Es para ti? — cierre persuasivo */}
              <Reveal as="section" className="relative overflow-hidden rounded-lg border border-neon/20 bg-bg-panel p-[clamp(24px,4vw,40px)] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(48,228,236,.10),transparent_70%)]" />
                <h2 className="relative font-display text-3xl text-white">{t.esParaTi}</h2>
                <p className="relative mt-3 max-w-[65ch] font-body text-[15px] leading-relaxed text-white/85">
                  {contenido.paraTi}
                </p>
                <WaLink origin="pagina" contextual variant="red" className="relative mt-6 min-h-12 px-7 py-[15px]">
                  {t.probarClase(nombre)}
                </WaLink>
              </Reveal>

              {/* Quién la imparte: se deriva del cartel, no se escribe a mano. */}
              {profes.length > 0 && (
                <Reveal as="section" className="space-y-5">
                  <h2 className="font-display text-text-strong text-3xl">{t.quienImparte(nombre)}</h2>
                  <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-4 p-0">
                    {profes.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/profesores/${p.slug}`}
                          hrefLang={destinoEs(`/profesores/${p.slug}`)}
                          className="group block no-underline"
                        >
                          <div className="bg-bg-elevated overflow-hidden rounded-lg">
                            <Image
                              src={p.foto}
                              alt={altEn(`profesor:${p.slug}`, p.fotoAlt, locale)}
                              width={p.ancho}
                              height={p.alto}
                              sizes="(max-width: 640px) 45vw, 200px"
                              className="aspect-[3/4] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <h3 className="font-display text-text-strong group-hover:text-neon mt-2 text-xl transition-colors">
                            {p.nombre}
                          </h3>
                          <p className="font-body text-text-muted mt-0.5 text-[13px] leading-snug">
                            {claimProfesor(p.slug, p.claim, locale)}
                            {destinoEs(`/profesores/${p.slug}`) && (
                              <span className="text-text-faint ml-1">{marcaEs}</span>
                            )}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {/* Enlaces cruzados entre disciplinas */}
              {relacionadas.length > 0 && (
                <Reveal as="section" className="space-y-5">
                  <h2 className="font-display text-3xl text-text-strong">{t.tambien(nombre)}</h2>
                  <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 p-0">
                    {relacionadas.map((r) => {
                      const destino = `/clases/${r.slug}`;
                      return (
                        <li key={r.slug}>
                          <Link href={enlace(destino, locale)} hrefLang={destinoEs(destino)} className={TARJETA}>
                            <h3 className="font-display text-xl text-text-strong transition-colors group-hover:text-neon">
                              {nombrePorSlug.get(r.slug)}
                            </h3>
                            <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">{r.text}</p>
                            <span className="mt-4 inline-block font-body text-[13px] font-bold text-neon group-hover:underline">
                              {t.ver(nombrePorSlug.get(r.slug) ?? "")} &rarr;
                              {destinoEs(destino) && (
                                <span className="text-text-faint ml-2 font-normal">{marcaEs}</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              )}

              {/* Del blog: el enlace de vuelta del artículo a su disciplina.
                  Sin artículos de esta disciplina no se pinta nada. */}
              {delBlog.length > 0 && (
                <Reveal as="section" className="space-y-5">
                  <h2 className="font-display text-3xl text-text-strong">{t.delBlog(nombre)}</h2>
                  <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 p-0">
                    {delBlog.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/blog/${a.slug}`}
                          hrefLang={locale === "es" ? undefined : "es"}
                          className={TARJETA}
                        >
                          <h3 className="font-display text-xl text-text-strong transition-colors group-hover:text-neon">
                            {a.titulo}
                          </h3>
                          <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">{a.resumen}</p>
                          <span className="mt-4 inline-block font-body text-[13px] font-bold text-neon group-hover:underline">
                            {t.leerGuia} &rarr;
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {/* Enlace de vuelta hacia las páginas de entrada que hablan de
                  esta disciplina (content/paginas-seo). Solo en castellano:
                  esas URLs no tienen versión catalana. */}
              {locale === "es" && (
                <Reveal as="div">
                  <EnlacesDeEntrada
                    href={`/clases/${m.slug}`}
                    titulo={`Antes de apuntarte a ${nombre.toLocaleLowerCase("es-ES")}`}
                  />
                </Reveal>
              )}
            </>
          ) : (
            // Modalidad nueva en la BD sin contenido editorial todavía: layout genérico.
            <p className="max-w-[70ch] font-body text-base leading-relaxed text-text-body">{m.descripcion}</p>
          )}

          {/* Galería de la disciplina: fotogramas de clases reales de este
              estilo. Solo aparece si hay material grabado (content/media.ts). */}
          {media && (
            <Reveal as="section" className="space-y-5">
              <h2 className="font-display text-3xl text-text-strong">{t.porDentro(nombre)}</h2>
              <p className="max-w-[65ch] font-body text-[15px] leading-relaxed text-text-muted">
                {t.porDentroTexto(site.locality)}
              </p>
              <Galeria
                imagenes={media.galeria.map((img) => ({ ...img, alt: altEn(img.src, img.alt, locale) }))}
                video={media.loop}
                altVideo={altEn(media.portada.src, media.portada.alt, locale)}
              />
            </Reveal>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          {/* Foto de la disciplina sobre la tarjeta de CTA. Apaisada a
              propósito: la columna es `sticky` y un 3:4 la dejaría más alta
              que la pantalla, con la mitad inferior imposible de ver. */}
          {media && (
            <Image
              src={media.portadaAncha.src}
              alt={altEn(media.portadaAncha.src, media.portadaAncha.alt, locale)}
              width={media.portadaAncha.ancho}
              height={media.portadaAncha.alto}
              sizes="(max-width: 1024px) 100vw, 380px"
              className="bg-bg-elevated aspect-[4/3] w-full rounded-lg border border-white/8 object-cover"
            />
          )}
          <div className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card">
            <h2 className="font-display text-2xl text-text-strong">{t.teAnimas}</h2>
            <p className="mt-2 font-body text-[15px] text-text-muted">{t.teAnimasTexto}</p>
            <WaLink origin="pagina" contextual variant="red" className="mt-4 min-h-12 w-full py-[15px]">
              {t.probar(nombre)}
            </WaLink>
            <p className="mt-4 border-t border-white/8 pt-4 font-body text-[13px] leading-relaxed text-text-muted">
              <Negritas
                className="text-text-strong"
                texto={t.desdeAside({ base: precios.base, fundador: founding.price, nombre })}
              />
            </p>
          </div>

          {otras.length > 0 && (
            <nav className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-soft" aria-label={t.otras}>
              <h2 className="font-body text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{t.otras}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {otras.map((o) => {
                  const destino = `/clases/${o.slug}`;
                  return (
                    <li key={o.slug}>
                      <Link
                        href={enlace(destino, locale)}
                        hrefLang={destinoEs(destino)}
                        className="inline-block rounded-full border border-white/12 px-3.5 py-[7px] font-body text-[13px] font-semibold text-text-body no-underline transition-colors hover:border-neon hover:text-neon"
                      >
                        {nombrePorSlug.get(o.slug)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </aside>
      </div>
      <JsonLd
        data={courseLd(
          nombre,
          contenido?.lead ?? m.descripcion ?? "",
          m.slug,
          // Cuando la disciplina agrupa varios estilos del cartel (Lady Salsa y
          // Bachata Lady, por ejemplo), el estilo distingue las instancias que
          // no tienen número de nivel.
          sesiones.map((s) => ({
            dia: s.dia,
            hora: s.hora,
            nivel:
              nivelVisible(s.nivel) ??
              (contenido && contenido.estilos.length > 1 ? estilo(s.estilo) : undefined),
          })),
          contenido?.aprenderas ?? [],
          locale,
        )}
      />
    </SupportPage>
  );
}
