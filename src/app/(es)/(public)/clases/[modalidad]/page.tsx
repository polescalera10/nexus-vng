import type { Metadata } from "next";
import { Modalidad } from "@/components/paginas/Modalidad";
import { getModalidadBySlug, getModalidadSlugs } from "@/lib/queries/modalidades";
import { contenidoModalidad, metaModalidad } from "@/content/por-idioma";
import { ogImages } from "@/lib/seo";
import { tModalidad } from "@/i18n/textos/paginas";

export const revalidate = 3600;

type Params = { params: Promise<{ modalidad: string }> };

export async function generateStaticParams() {
  const slugs = await getModalidadSlugs();
  return slugs.map((modalidad) => ({ modalidad }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modalidad } = await params;
  const m = await getModalidadBySlug(modalidad);
  if (!m) return { title: "Clase no encontrada" };
  const contenido = contenidoModalidad(m.slug, "es");
  const t = tModalidad.es;
  // En el SERP va la meta con ciudad y acción; en el preview social, el lead
  // de marca, que se lee mejor fuera de Google.
  const description = metaModalidad(m.slug, "es") ?? contenido?.lead ?? m.descripcion ?? undefined;
  const ogDescription = contenido?.lead ?? description;
  /*
    El layout añade " · NEXUS VNG" (12 caracteres) y Google corta el title
    alrededor de los 60. Con nombres largos (Lady Style Bachata, Cía Bachata
    Lady) el municipio entero se pasaba, así que ahí se acorta a "Vilanova",
    que es como lo busca la gente. El H1 sí conserva el nombre completo.
  */
  const base = t.title(m.nombre);
  const titleLargo = `${base}Vilanova i la Geltrú`;

  return {
    title: titleLargo.length <= 48 ? titleLargo : `${base}Vilanova`,
    description,
    alternates: { canonical: `/clases/${m.slug}` },
    openGraph: { title: t.ogTitle(m.nombre), description: ogDescription, images: ogImages },
  };
}

export default async function ModalidadPage({ params }: Params) {
  const { modalidad } = await params;
  return <Modalidad slug={modalidad} locale="es" />;
}
