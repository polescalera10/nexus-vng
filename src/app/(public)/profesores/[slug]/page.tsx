import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { WaLink } from "@/components/ui/WaLink";
import { SetWaPageContext } from "@/components/ui/WaPageContext";
import { waContextProfesor } from "@/lib/wa-page-context";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, orgRef } from "@/components/seo/JsonLd";
import {
  clasesDe,
  companerosDe,
  getProfesor,
  listProfesorSlugs,
  modalidadesDe,
  profesores,
  type Profesor,
} from "@/content/profesores";
import { site } from "@/lib/site";

/*
  Ficha individual de profesor. Estuvo desactivada (404 para todo) mientras no
  hubo datos reales: servía un placeholder con canónica propia para cualquier
  slug inventado, que era espacio infinito de URLs indexables vacías.

  Ahora se generan solo las 5 rutas del equipo real; cualquier otro slug sigue
  devolviendo 404. Todo lo que se afirma sale de `content/profesores.ts` y del
  cartel de horarios — nada de bios ni trayectorias inventadas.
*/

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listProfesorSlugs().map((slug) => ({ slug }));
}

/**
 * Schema.org Person. Solo campos verificables: nombre, foto, qué imparte y
 * dónde trabaja. Sin `award`, `alumniOf` ni titulaciones que nadie ha confirmado.
 */
function personLd(profe: Profesor) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profe.nombre,
    url: `${site.url}/profesores/${profe.slug}`,
    image: `${site.url}${profe.foto}`,
    // Neutro a propósito: el equipo es mixto y la plantilla ponía "Profesor de
    // baile" también en las fichas de ellas.
    jobTitle: "Profesor/a de baile",
    description: profe.claim,
    knowsAbout: modalidadesDe(profe.nombre).map((m) => m.nombre),
    // Referencia al nodo de la escuela (layout raíz) en vez de repetir la
    // organización entera: así Google ve una sola entidad, no seis.
    worksFor: orgRef(),
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const profe = getProfesor(slug);
  if (!profe) return { title: "Página no encontrada" };

  const nombres = modalidadesDe(profe.nombre).map((m) => m.nombre.toLowerCase());

  /*
    Dos arreglos en una: el title deja de decir "Profesor de baile" (la
    plantilla lo ponía también en las fichas de ellas) y pasa a llevar las
    disciplinas, que además es lo que alguien busca. Y la descripción se
    acorta: listar cinco disciplinas se comía los 155 caracteres útiles y el
    SERP la cortaba (la ficha de Ana Aylén iba a 172).
  */
  const cardinal = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho"];
  const disciplinas =
    nombres.length > 2
      ? `${cardinal[nombres.length] ?? nombres.length} disciplinas`
      : nombres.join(" y ") || "clases de baile";
  const disciplinasTitle =
    nombres.length > 2 ? "Clases de baile" : `Clases de ${nombres.join(" y ")}`;

  return {
    title: `${profe.nombre} · ${nombres.length > 0 ? disciplinasTitle : "Equipo"}`,
    description: `${profe.nombre} imparte ${disciplinas} en NEXUS VNG, ${site.locality}. Sus clases, días y niveles, y cómo reservar tu clase de prueba.`,
    alternates: { canonical: `/profesores/${profe.slug}` },
    openGraph: {
      title: `${profe.nombre} · NEXUS VNG`,
      images: [{ url: profe.foto, width: profe.ancho, height: profe.alto, alt: profe.fotoAlt }],
    },
  };
}

export default async function ProfesorPage({ params }: Params) {
  const { slug } = await params;
  const profe = getProfesor(slug);
  if (!profe) notFound();

  const clases = clasesDe(profe.nombre);
  const disciplinas = modalidadesDe(profe.nombre);
  const companeros = companerosDe(profe.nombre);
  const otros = profesores.filter((p) => p.slug !== profe.slug);

  return (
    <SupportPage eyebrow="Equipo NEXUS VNG" title={profe.nombre} intro={profe.claim}>
      {/* Los CTA globales escriben sobre ESTE profe. */}
      <SetWaPageContext {...waContextProfesor(profe.slug, profe.nombre)} />
      <div className="space-y-[clamp(48px,7vw,80px)]">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Profesores", path: "/profesores" },
            { name: profe.nombre, path: `/profesores/${profe.slug}` },
          ]}
        />

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
          {/* `self-start` es imprescindible: por defecto el grid estira el
              <figure> a la altura de la columna de texto, y como la imagen
              tiene una proporción fija quedaba una franja de fondo vacía
              debajo — más marco que foto. En móvil, 3/4 a ancho completo se
              come la pantalla, así que ahí va más apaisada. */}
          <figure className="bg-bg-elevated m-0 self-start overflow-hidden rounded-xl lg:sticky lg:top-24">
            <Image
              src={profe.foto}
              alt={profe.fotoAlt}
              width={profe.ancho}
              height={profe.alto}
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className="aspect-[4/5] w-full object-cover object-top sm:aspect-[3/4]"
            />
          </figure>

          <div className="space-y-8">
            {profe.bio && (
              <section className="space-y-4">
                <h2 className="font-display text-text-strong text-3xl">Quién es {profe.nombre}</h2>
                {profe.bio.map((parrafo) => (
                  <p
                    key={parrafo.slice(0, 24)}
                    className="font-body text-text-body max-w-[65ch] text-base leading-relaxed"
                  >
                    {parrafo}
                  </p>
                ))}
              </section>
            )}

            {clases.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-text-strong text-3xl">
                  Sus clases esta temporada
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {clases.map((clase) => (
                    <li
                      key={clase.value}
                      className="border-white/8 bg-bg-panel rounded-lg border px-4 py-3"
                    >
                      <p className="font-body text-text-strong text-[15px] font-bold">
                        {clase.estilo}
                      </p>
                      <p className="font-body text-text-muted mt-1 text-[13px]">
                        {clase.dia} · {clase.hora}
                        {clase.nivel ? ` · ${clase.nivel}` : ""}
                      </p>
                      {clase.profes !== profe.nombre && (
                        <p className="font-body text-text-faint mt-1 text-[12px]">
                          Con {clase.profes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="font-body text-text-muted text-[13px]">
                  Datos del cartel de la temporada 26·27 —{" "}
                  <Link href="/horarios" className="text-neon underline underline-offset-2">
                    ver el horario completo
                  </Link>
                  .
                </p>
              </section>
            )}

            {disciplinas.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-text-strong text-3xl">Qué imparte</h2>
                <ul className="flex flex-wrap gap-2.5">
                  {disciplinas.map((d) => (
                    <li key={d.slug}>
                      <Link
                        href={`/clases/${d.slug}`}
                        className="border-white/12 bg-bg-elevated font-body text-text-body hover:border-neon/50 hover:text-neon inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[13px] font-semibold no-underline transition-colors"
                      >
                        {d.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
                {companeros.length > 0 && (
                  <p className="font-body text-text-muted max-w-[60ch] text-[15px] leading-relaxed">
                    En los grupos de baile en pareja da clase con {companeros.join(" y ")}: dos
                    profesores en la sala significa que siempre hay alguien mirando tu lado del
                    paso.
                  </p>
                )}
              </section>
            )}

            <div className="border-white/8 bg-bg-panel shadow-card rounded-lg border p-6">
              <h2 className="font-display text-text-strong text-2xl">
                Conócele en una clase de prueba
              </h2>
              <p className="font-body text-text-muted mt-2 text-[15px]">
                Escríbenos y te decimos en qué grupo de {profe.nombre} encajas mejor según tu nivel
                y tu disponibilidad.
              </p>
              <WaLink origin="pagina" contextual variant="red" className="mt-4 w-full py-[15px]">
                Reservar clase de prueba
              </WaLink>
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <h2 className="font-display text-text-strong text-3xl">El resto del equipo</h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-4">
            {otros.map((p) => (
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
                  <p className="font-display text-text-strong group-hover:text-neon mt-2 text-xl transition-colors">
                    {p.nombre}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <JsonLd data={personLd(profe)} />
    </SupportPage>
  );
}
