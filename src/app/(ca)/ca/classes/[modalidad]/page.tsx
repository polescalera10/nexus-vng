import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Modalidad } from "@/components/paginas/Modalidad";
import { getModalidadBySlug } from "@/lib/queries/modalidades";
import { contenidoModalidad, metaModalidad, nombreModalidad } from "@/content/por-idioma";
import { alternatesDe, MODALIDADES_CA } from "@/i18n/rutas";
import { ogImages } from "@/lib/seo";
import { tModalidad } from "@/i18n/textos/paginas";

export const revalidate = 3600;

/** Solo las disciplinas del piloto: el resto no tiene ficha en catalán. */
export const dynamicParams = false;

type Params = { params: Promise<{ modalidad: string }> };

export function generateStaticParams() {
  return MODALIDADES_CA.map((modalidad) => ({ modalidad }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modalidad } = await params;
  const m = await getModalidadBySlug(modalidad);
  if (!m) return { title: "Classe no trobada" };
  const contenido = contenidoModalidad(m.slug, "ca");
  const t = tModalidad.ca;
  const nombre = nombreModalidad(m.nombre, "ca");
  const description = metaModalidad(m.slug, "ca") ?? contenido?.lead ?? undefined;
  // Misma regla de longitud que la ficha en castellano (48 + « · NEXUS VNG»).
  const base = t.title(nombre);
  const titleLargo = `${base}Vilanova i la Geltrú`;
  const title = titleLargo.length <= 48 ? titleLargo : `${base}Vilanova`;

  return {
    title,
    description,
    alternates: alternatesDe(`/ca/classes/${m.slug}`),
    openGraph: { title: t.ogTitle(nombre), description: contenido?.lead ?? description, images: ogImages },
  };
}

export default async function ModalitatPage({ params }: Params) {
  const { modalidad } = await params;
  if (!MODALIDADES_CA.includes(modalidad)) notFound();
  return <Modalidad slug={modalidad} locale="ca" />;
}
