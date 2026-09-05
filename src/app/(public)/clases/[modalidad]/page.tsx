import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { Galeria } from "@/components/ui/Galeria";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { SetWaPageContext } from "@/components/ui/WaPageContext";
import { waContextModalidad } from "@/lib/wa-page-context";
import { JsonLd, courseLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getModalidades, getModalidadBySlug, getModalidadSlugs } from "@/lib/queries/modalidades";
import { mediaModalidades } from "@/content/media";
import { modalidadesContenido } from "@/content/modalidades";
import { sesionesRegulares } from "@/content/horario-regular";
import { precios } from "@/content/precios";
import { profesoresDe } from "@/content/profesores";
import { ogImages } from "@/lib/seo";
import { founding } from "@/content/landing";
import { site } from "@/lib/site";

export const revalidate = 3600;

type Params = { params: Promise<{ modalidad: string }> };

/** "Salsa 1" → "Salsa": el nombre de disciplina sin el número de nivel. */
const baseEstilo = (estilo: string) => estilo.replace(/\s+\d+$/, "").trim();

export async function generateStaticParams() {
  const slugs = await getModalidadSlugs();
  return slugs.map((modalidad) => ({ modalidad }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modalidad } = await params;
  const m = await getModalidadBySlug(modalidad);
  if (!m) return { title: "Clase no encontrada" };
  const contenido = modalidadesContenido[m.slug];
  const description = contenido?.lead ?? m.descripcion ?? undefined;
  return {
    title: `Clases de ${m.nombre} en Vilanova i la Geltrú`,
    description,
    alternates: { canonical: `/clases/${m.slug}` },
    openGraph: { title: `Clases de ${m.nombre}`, description, images: ogImages },
  };
}

export default async function ModalidadPage({ params }: Params) {
  const { modalidad } = await params;
  const m = await getModalidadBySlug(modalidad);
  if (!m) notFound();

  // Contenido editorial largo (content/modalidades.ts). Puede no existir si la
  // modalidad se creó en la BD sin redactar aún su página.
  const contenido = modalidadesContenido[m.slug];
  const todas = await getModalidades();
  const otras = todas.filter((o) => o.slug !== m.slug);
  const nombrePorSlug = new Map(todas.map((o) => [o.slug, o.nombre]));

  // Clases REALES de esta disciplina en el cartel semanal, grupos de compañía
  // incluidos: cuentan como una clase regular más.
  const sesiones = contenido
    ? sesionesRegulares.filter((s) => contenido.estilos.includes(baseEstilo(s.estilo)))
    : [];

  // Profesores que la imparten, derivados del cartel (content/profesores.ts).
  const profes = profesoresDe(m.slug);

  // Enlaces cruzados: solo a disciplinas que existen y están activas.
  const relacionadas = (contenido?.relacionadas ?? []).filter((r) => nombrePorSlug.has(r.slug));

  // Material audiovisual de ESTA disciplina, si se llegó a grabar. Puede no
  // haberlo: ver la cabecera de content/media.ts.
  const media = mediaModalidades[m.slug];

  return (
    <SupportPage
      /* El h1 lleva la consulta completa ("Clases de bachata en Vilanova i la
         Geltrú"), no solo el nombre del estilo: title, h1 y URL apuntando a lo
         mismo es la señal on-page más básica y aquí el h1 se la estaba
         saltando. El nombre corto se mantiene como kicker. */
      eyebrow={m.nombre}
      title={`Clases de ${m.nombre.toLowerCase()} en ${site.locality}`}
      intro={contenido?.lead ?? m.descripcion ?? undefined}
    >
      {/* Los CTA globales (sticky, cabecera, footer) escriben sobre ESTA disciplina. */}
      <SetWaPageContext {...waContextModalidad(m.slug, m.nombre)} />
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Clases", path: "/clases" },
          { name: m.nombre, path: `/clases/${m.slug}` },
        ]}
      />

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
                <h2 className="font-display text-3xl text-text-strong">En clase aprenderás</h2>
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
                <h2 className="font-display text-3xl text-text-strong">Cómo es una clase</h2>
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
                  {sesiones.length > 0 ? `Horario y precio de ${m.nombre}` : `Precio de ${m.nombre}`}
                </h2>

                {sesiones.length > 0 && (
                  <>
                    <p className="max-w-[65ch] font-body text-[15px] leading-relaxed text-text-muted">
                      Estas son las clases de {m.nombre.toLowerCase()} de la temporada 26·27 en
                      Vilanova i la Geltrú. El número indica el nivel: 0 desde cero absoluto, 1
                      iniciación, 2 intermedio.
                    </p>
                    <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-3 p-0">
                      {sesiones.map((s) => (
                        <li
                          key={s.value}
                          className="rounded-lg border border-white/8 bg-bg-panel p-4 shadow-soft"
                        >
                          <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-neon-mint">
                            {s.dia}
                          </p>
                          <p className="mt-1 font-display text-2xl leading-none text-text-strong">
                            {s.hora}
                          </p>
                          <p className="mt-2 font-body text-[14px] font-semibold text-text-body">
                            {s.estilo}
                            {s.nivel && (
                              <span className="font-normal text-text-muted"> · {s.nivel}</span>
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
                    <strong className="text-neon-mint">
                      {precios.base} €/{precios.periodo}
                    </strong>{" "}
                    por una disciplina. Cada estilo adicional suma {precios.estiloExtra} €/
                    {precios.periodo}, y con {precios.flat} €/{precios.periodo} tienes la tarifa
                    plana con todos los estilos. Sin matrícula y sin permanencia.
                  </p>
                  <p className="mt-2 font-body text-[13px] leading-relaxed text-text-muted">
                    ¿Vas a venir varios días? La{" "}
                    <Link
                      href="/socio-fundador"
                      className="font-semibold text-neon no-underline hover:underline"
                    >
                      plaza de socio fundador
                    </Link>{" "}
                    deja todas las disciplinas de tu nivel en {founding.price}/mes. También puedes
                    ver el{" "}
                    <Link
                      href="/clases#horario"
                      className="font-semibold text-neon no-underline hover:underline"
                    >
                      horario completo de la semana
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>

              {/* Qué te llevas */}
              <Reveal as="section" className="space-y-5">
                <h2 className="font-display text-3xl text-text-strong">Qué te llevas</h2>
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
                <h2 className="relative font-display text-3xl text-white">¿Es para ti?</h2>
                <p className="relative mt-3 max-w-[65ch] font-body text-[15px] leading-relaxed text-white/85">
                  {contenido.paraTi}
                </p>
                <WaLink origin="pagina" contextual variant="red" className="relative mt-6 min-h-12 px-7 py-[15px]">
                  Probar una clase de {m.nombre}
                </WaLink>
              </Reveal>

              {/* Quién la imparte: se deriva del cartel, no se escribe a mano. */}
              {profes.length > 0 && (
                <Reveal as="section" className="space-y-5">
                  <h2 className="font-display text-text-strong text-3xl">
                    Quién imparte {m.nombre}
                  </h2>
                  <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-4 p-0">
                    {profes.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/profesores/${p.slug}`} className="group block no-underline">
                          <div className="bg-bg-elevated overflow-hidden rounded-lg">
                            <Image
                              src={p.foto}
                              alt={p.fotoAlt}
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
                            {p.claim}
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
                  <h2 className="font-display text-3xl text-text-strong">
                    Si te gusta {m.nombre}, prueba también
                  </h2>
                  <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 p-0">
                    {relacionadas.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/clases/${r.slug}`}
                          className="group flex h-full flex-col rounded-lg border border-white/8 bg-bg-panel p-5 text-inherit no-underline shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-neon/30 hover:shadow-card"
                        >
                          <h3 className="font-display text-xl text-text-strong transition-colors group-hover:text-neon">
                            {nombrePorSlug.get(r.slug)}
                          </h3>
                          <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">
                            {r.text}
                          </p>
                          <span className="mt-4 inline-block font-body text-[13px] font-bold text-neon group-hover:underline">
                            Ver {nombrePorSlug.get(r.slug)} &rarr;
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </>
          ) : (
            // Modalidad nueva en la BD sin contenido editorial todavía: layout genérico.
            <p className="max-w-[70ch] font-body text-base leading-relaxed text-text-body">
              {m.descripcion}
            </p>
          )}

          {/* Galería de la disciplina: fotogramas de clases reales de este
              estilo. Solo aparece si hay material grabado (content/media.ts). */}
          {media && (
            <Reveal as="section" className="space-y-5">
              <h2 className="font-display text-3xl text-text-strong">
                Una clase de {m.nombre.toLowerCase()}, por dentro
              </h2>
              <p className="max-w-[65ch] font-body text-[15px] leading-relaxed text-text-muted">
                Vídeo y fotos de clases reales en la sala de {site.locality}. Ni banco de imágenes
                ni montajes: es lo que te vas a encontrar.
              </p>
              <Galeria imagenes={media.galeria} video={media.loop} altVideo={media.portada.alt} />
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
              alt={media.portadaAncha.alt}
              width={media.portadaAncha.ancho}
              height={media.portadaAncha.alto}
              sizes="(max-width: 1024px) 100vw, 380px"
              className="bg-bg-elevated aspect-[4/3] w-full rounded-lg border border-white/8 object-cover"
            />
          )}
          <div className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card">
            <h2 className="font-display text-2xl text-text-strong">¿Te animas?</h2>
            <p className="mt-2 font-body text-[15px] text-text-muted">
              Reserva tu primera clase de prueba. Escríbenos y te asignamos el grupo ideal para tu
              nivel.
            </p>
            <WaLink origin="pagina" contextual variant="red" className="mt-4 min-h-12 w-full py-[15px]">
              Probar {m.nombre}
            </WaLink>
            <p className="mt-4 border-t border-white/8 pt-4 font-body text-[13px] leading-relaxed text-text-muted">
              Desde <strong className="text-text-strong">{precios.base} €/mes</strong> por una
              disciplina. Tarifa fundadora:{" "}
              <strong className="text-text-strong">{founding.price}/mes</strong> con acceso a todas
              las disciplinas de tu nivel — {m.nombre} incluida.
            </p>
          </div>

          {otras.length > 0 && (
            <nav className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-soft" aria-label="Otras disciplinas">
              <h2 className="font-body text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
                Otras disciplinas
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {otras.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/clases/${o.slug}`}
                      className="inline-block rounded-full border border-white/12 px-3.5 py-[7px] font-body text-[13px] font-semibold text-text-body no-underline transition-colors hover:border-neon hover:text-neon"
                    >
                      {o.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
      <JsonLd
        data={courseLd(
          m.nombre,
          contenido?.lead ?? m.descripcion ?? "",
          m.slug,
          // Cuando la disciplina agrupa varios estilos del cartel (Lady Salsa y
          // Bachata Lady, por ejemplo), el estilo distingue las instancias que
          // no tienen número de nivel.
          sesiones.map((s) => ({
            dia: s.dia,
            hora: s.hora,
            nivel: s.nivel ?? (contenido && contenido.estilos.length > 1 ? s.estilo : undefined),
          })),
          contenido?.aprenderas ?? [],
        )}
      />
    </SupportPage>
  );
}
