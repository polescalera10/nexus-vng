import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { WaLink } from "@/components/ui/WaLink";
import { SetWaPageContext } from "@/components/ui/WaPageContext";
import { waContextEvento } from "@/lib/wa-page-context";
import { getEventoBySlug, getEventoSlugs } from "@/lib/queries/eventos";
import { JsonLd, eventLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ogImages, metaDescripcion, primeraImagenMarkdown } from "@/lib/seo";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getEventoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventoBySlug(slug);
  if (!e) return { title: "Evento no encontrado" };

  const description = metaDescripcion(e.descripcion);
  // El template del layout raíz ya añade "· NEXUS VNG": poner aquí "Eventos
  // NEXUS VNG" dejaba la marca dos veces en el mismo title.
  const title = `${e.titulo} · Eventos`;
  const imagen = primeraImagenMarkdown(e.descripcion);

  return {
    title,
    description: description || undefined,
    alternates: { canonical: `/eventos/${e.slug}` },
    openGraph: {
      title: e.titulo,
      description: description || undefined,
      images: imagen ? [{ url: imagen }] : ogImages,
    },
  };
}

export default async function EventoDetailPage({ params }: Params) {
  const { slug } = await params;
  const e = await getEventoBySlug(slug);
  if (!e) notFound();

  // Formatear fecha para la cabecera (p. ej. sábado, 4 de julio de 2026, 21:00h)
  const dateObj = new Date(e.fecha);
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }) + "h";

  const fullDateTimeString = `${formattedDate} a las ${formattedTime}`;

  return (
    <SupportPage
      eyebrow={`Evento · ${e.tipo.toUpperCase()}`}
      title={e.titulo}
      intro={fullDateTimeString}
    >
      {/* Los CTA globales escriben sobre ESTE evento. */}
      <SetWaPageContext {...waContextEvento(e.slug ?? slug, e.titulo)} />
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Eventos", path: "/eventos" },
            { name: e.titulo, path: `/eventos/${e.slug ?? slug}` },
          ]}
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Contenido en Markdown */}
        <article className="bg-bg-panel rounded-lg border border-white/8 p-8 shadow-soft">
          <MarkdownRenderer content={e.descripcion || ""} />
        </article>

        {/* Barra lateral de Registro y FAQ corta */}
        <aside className="space-y-6">
          <div className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card h-fit">
            <h2 className="font-display text-2xl text-text-strong">¿Te animas a venir?</h2>
            <p className="mt-2 font-body text-[15px] text-text-muted leading-relaxed">
              Reserva tu plaza o consúltanos cualquier duda sobre este evento directamente por WhatsApp. Te responderemos encantados de inmediato.
            </p>
            <WaLink
              origin="pagina"
              contextual
              variant="red"
              className="mt-6 w-full py-[15px] text-sm"
            >
              Reservar mi plaza
            </WaLink>
          </div>

          <div className="rounded-lg border border-dashed border-white/15 bg-bg-elevated/60 p-6 font-body text-text-muted text-[14px]">
            <h3 className="font-semibold text-text-strong">Información clave:</h3>
            <ul className="mt-3 list-disc pl-4 space-y-2">
              <li><strong>Lugar:</strong> Gimnasio Aranha (Vilanova i la Geltrú).</li>
              <li><strong>Entrada:</strong> Abierta al público general y a todos los niveles de baile.</li>
              <li><strong>Código de vestimenta:</strong> Cómodo y adaptado para bailar sin problemas.</li>
            </ul>
          </div>
        </aside>
      </div>
      <JsonLd
        data={eventLd({
          titulo: e.titulo,
          descripcion: metaDescripcion(e.descripcion, 300),
          fecha: e.fecha,
          slug: e.slug ?? slug,
          imagen: primeraImagenMarkdown(e.descripcion),
        })}
      />
    </SupportPage>
  );
}
