import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportPage } from "@/components/layout/SupportPage";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { WaLink } from "@/components/ui/WaLink";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, blogPostingLd } from "@/components/seo/JsonLd";
import { getArticulo, listArticuloSlugs } from "@/content/blog";
import { modalidadesContenido } from "@/content/modalidades";
import { formatDate } from "@/lib/format";

/*
  Ficha de artículo. Solo existen las rutas de `content/blog.ts`
  (`dynamicParams = false`): cualquier otro slug es 404, no una página vacía
  con canónica propia — el mismo criterio que las fichas de profesor.
*/
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listArticuloSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) return { title: "Artículo no encontrado" };

  return {
    title: a.metaTitle,
    description: a.description,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      title: a.titulo,
      description: a.description,
      type: "article",
      publishedTime: a.publicado,
      modifiedTime: a.actualizado,
      images: [{ url: a.imagen.src, width: a.imagen.ancho, height: a.imagen.alto, alt: a.imagen.alt }],
    },
  };
}

export default async function ArticuloPage({ params }: Params) {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) notFound();

  // Disciplinas de las que habla el artículo: el enlace de ida. El de vuelta lo
  // pone la ficha (`articulosDeDisciplina`), así nunca queda huérfano.
  const disciplinas = a.disciplinas
    .map((s) => ({ slug: s, nombre: modalidadesContenido[s] ? s.replace(/-/g, " ") : null }))
    .filter((d): d is { slug: string; nombre: string } => d.nombre !== null);

  return (
    <SupportPage eyebrow="Blog" title={a.titulo} intro={a.resumen}>
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: a.titulo, path: `/blog/${a.slug}` },
          ]}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* min-w-0: sin él, la columna de la rejilla crece hasta el ancho
            mínimo de una tabla del artículo y la página desborda en móvil
            aunque la tabla tenga su propio scroll. */}
        <article className="min-w-0 rounded-lg border border-white/8 bg-bg-panel p-6 shadow-soft sm:p-8">
          <p className="font-body text-[13px] text-text-muted">
            Por{" "}
            {a.autor.profesorSlug ? (
              <Link
                href={`/profesores/${a.autor.profesorSlug}`}
                className="font-semibold text-neon no-underline hover:underline"
              >
                {a.autor.nombre}
              </Link>
            ) : (
              <span className="font-semibold text-text-strong">{a.autor.nombre}</span>
            )}{" "}
            · <time dateTime={a.publicado}>{formatDate(a.publicado)}</time>
            {a.actualizado !== a.publicado && (
              <> · actualizado el <time dateTime={a.actualizado}>{formatDate(a.actualizado)}</time></>
            )}
          </p>

          <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-md border border-white/8">
            <Image
              src={a.imagen.src}
              alt={a.imagen.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              priority
              className="object-cover"
            />
          </div>

          <div className="mt-6">
            <MarkdownRenderer content={a.cuerpo} />
          </div>
        </article>

        <aside className="space-y-6">
          <div className="h-fit rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card">
            <h2 className="font-display text-2xl text-text-strong">¿Lo pruebas?</h2>
            <p className="mt-2 font-body text-[15px] leading-relaxed text-text-muted">
              Cuéntanos qué te apetece bailar y qué días puedes, y te decimos en qué grupo encajas.
            </p>
            <WaLink origin="pagina" contextual variant="red" className="mt-6 w-full py-[15px] text-sm">
              Reservar clase de prueba
            </WaLink>
          </div>

          {disciplinas.length > 0 && (
            <nav className="rounded-lg border border-white/8 bg-bg-panel p-6">
              <h2 className="font-display text-xl text-text-strong">De esto hablamos aquí</h2>
              <ul className="mt-3 list-none space-y-2 p-0">
                {disciplinas.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/clases/${d.slug}`}
                      className="font-body text-[14px] font-semibold text-neon no-underline hover:underline"
                    >
                      Clases de {d.nombre} en Vilanova i la Geltrú
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

      <JsonLd
        data={blogPostingLd({
          slug: a.slug,
          titulo: a.titulo,
          description: a.description,
          publicado: a.publicado,
          actualizado: a.actualizado,
          autor: a.autor,
          imagen: a.imagen.src,
        })}
      />
    </SupportPage>
  );
}
