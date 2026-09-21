import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { SetWaPageContext } from "@/components/ui/WaPageContext";
import { getPaginaSeo } from "@/content/paginas-seo";
import { sesionesRegulares } from "@/content/horario-regular";
import { waContextPaginaSeo } from "@/lib/wa-page-context";

/** "Salsa 1" → "Salsa": el cartel guarda el nivel en el nombre del estilo. */
const baseEstilo = (estilo: string) => estilo.replace(/\s+\d+$/, "").trim();

/**
 * Cuerpo de las páginas de entrada SEO (`/[slug]`, registro en
 * `content/paginas-seo.ts`).
 *
 * Comparte el armazón (migas, CTA, schema) con el resto del sitio, pero NO el
 * cuerpo: cada página trae su Markdown escrito entero y su propio bloque de
 * preguntas. Esa es la diferencia con las landings `/l/` que se sacaron del
 * índice: allí la plantilla rellenaba variables, aquí la plantilla solo pinta.
 *
 * Schema: `FAQPage` + `BreadcrumbList`. Nunca `Course`, que vive en la ficha
 * de disciplina y duplicarlo partiría la señal en dos URLs.
 */
export function PaginaEntrada({ slug }: { slug: string }) {
  const p = getPaginaSeo(slug);
  if (!p) notFound();

  // Clases REALES del cartel que tocan esta página. Nunca se escriben días ni
  // horas en el cuerpo: si cambia el cartel, cambia esta tabla sola.
  const sesiones =
    p.estilosHorario.length > 0
      ? sesionesRegulares.filter((s) => p.estilosHorario.includes(baseEstilo(s.estilo)))
      : [];

  return (
    <SupportPage eyebrow={p.eyebrow} title={p.h1} intro={p.lead}>
      {/* Los CTA globales (sticky, cabecera, footer) escriben sobre ESTA página. */}
      <SetWaPageContext {...waContextPaginaSeo(p.slug)} />

      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: p.h1, path: `/${p.slug}` },
          ]}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* min-w-0: sin él la columna crece hasta el ancho mínimo de la tabla
            del cuerpo y la página desborda en móvil. */}
        <article className="min-w-0 rounded-lg border border-white/8 bg-bg-panel p-6 shadow-soft sm:p-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-white/8">
            <Image
              src={p.imagen.src}
              alt={p.imagen.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              priority
              className="object-cover"
            />
          </div>

          <div className="mt-6">
            <MarkdownRenderer content={p.cuerpo} />
          </div>

          {sesiones.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-[clamp(24px,3.2vw,32px)] text-text-strong">
                Horario de estas clases
              </h2>
              <p className="mt-2 font-body text-[15px] leading-relaxed text-text-muted">
                Del cartel de la temporada 26·27. Cada clase dura una hora.
              </p>
              <ul className="mt-4 list-none space-y-2 p-0">
                {sesiones.map((s) => (
                  <li
                    key={s.value}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/8 pb-2"
                  >
                    <span className="font-body text-[15px] font-semibold text-text-strong">
                      {s.estilo}
                    </span>
                    <span className="font-mono text-[13px] text-neon-mint">
                      {s.dia} {s.hora}
                    </span>
                    {s.nivel && (
                      <span className="font-body text-[13px] text-text-muted">{s.nivel}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-body text-[14px]">
                <Link href="/horarios" className="font-semibold text-neon no-underline hover:underline">
                  Ver el cartel completo de la semana →
                </Link>
              </p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-display text-[clamp(24px,3.2vw,32px)] text-text-strong">
              Preguntas frecuentes
            </h2>
            <div className="mt-4">
              {p.faq.map((item) => (
                <details key={item.q} className="group border-b border-white/10">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <h3 className="m-0 font-body text-[clamp(16px,1.6vw,18px)] font-semibold text-text-strong">
                      {item.q}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="flex-none font-body text-[28px] leading-none text-neon transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-[18px] font-body text-base leading-relaxed text-text-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-6">
          <Reveal as="div" className="h-fit rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card">
            <h2 className="font-display text-2xl text-text-strong">¿Lo pruebas?</h2>
            <p className="mt-2 font-body text-[15px] leading-relaxed text-text-muted">
              Cuéntanos qué te apetece bailar y qué días puedes, y te decimos en qué grupo encajas.
            </p>
            <WaLink origin="pagina" contextual variant="red" className="mt-6 w-full py-[15px] text-sm">
              Reservar clase de prueba
            </WaLink>
          </Reveal>

          <nav className="rounded-lg border border-white/8 bg-bg-panel p-6">
            <h2 className="font-display text-xl text-text-strong">Sigue por aquí</h2>
            <ul className="mt-3 list-none space-y-4 p-0">
              {p.enlaces.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    className="font-body text-[14px] font-semibold text-neon no-underline hover:underline"
                  >
                    {e.label}
                  </Link>
                  <p className="mt-1 font-body text-[13px] leading-relaxed text-text-muted">
                    {e.texto}
                  </p>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <JsonLd data={faqLd(p.faq)} />
    </SupportPage>
  );
}
