import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { WaLink } from "@/components/ui/WaLink";
import { articulos, articulosOrdenados } from "@/content/blog";
import { robotsListado } from "@/lib/indexable";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog de baile en Vilanova i la Geltrú",
  description:
    "Guías sobre salsa cubana, bachata y empezar a bailar, escritas por los profes de NEXUS VNG en Vilanova i la Geltrú. Sin postureo y con lo que pasa en clase.",
  alternates: { canonical: "/blog" },
  // Sin artículos publicados no hay nada que indexar (misma regla que /eventos).
  robots: robotsListado(articulos.length),
};

export default function BlogPage() {
  const lista = articulosOrdenados();

  return (
    <SupportPage
      eyebrow="Guías de la escuela"
      title="Blog de baile en Vilanova i la Geltrú"
      intro="Lo que preguntáis antes de la primera clase, contestado con calma: qué baile elegir, cómo funciona una clase y qué pasa si vienes sin pareja."
    >
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
          ]}
        />
      </div>

      {lista.length > 0 ? (
        <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6 p-0">
          {lista.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}`}
                className="group block overflow-hidden rounded-lg border border-white/8 bg-bg-panel text-inherit no-underline shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-neon/30 hover:shadow-card"
              >
                <div className="relative h-48 overflow-hidden bg-bg-elevated">
                  <Image
                    src={a.imagen.src}
                    alt={a.imagen.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6">
                  <time
                    dateTime={a.publicado}
                    className="font-body text-xs font-semibold uppercase tracking-wide text-neon-mint"
                  >
                    {formatDate(a.publicado)}
                  </time>
                  <h2 className="mt-1 font-display text-2xl text-text-strong transition-colors group-hover:text-neon">
                    {a.titulo}
                  </h2>
                  <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">
                    {a.resumen}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="max-w-[60ch] space-y-4">
          <p className="font-body text-base leading-relaxed text-text-body">
            Estamos escribiendo las primeras guías. Mientras tanto, en{" "}
            <Link href="/faq" className="font-semibold text-neon no-underline hover:underline">
              las preguntas frecuentes
            </Link>{" "}
            están resueltas las dudas que más nos llegan, y en{" "}
            <Link href="/clases" className="font-semibold text-neon no-underline hover:underline">
              clases
            </Link>{" "}
            tienes cada disciplina explicada por dentro.
          </p>
          <WaLink origin="pagina" variant="red" className="px-7 py-[15px]">
            Preguntar por WhatsApp
          </WaLink>
        </div>
      )}
    </SupportPage>
  );
}
