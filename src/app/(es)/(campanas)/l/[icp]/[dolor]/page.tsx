import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampana, listCampanaParams } from "@/content/campanas";
import { ogImages } from "@/lib/seo";
import { CampanaHero } from "@/components/campanas/CampanaHero";
import { CampanaAgitacion } from "@/components/campanas/CampanaAgitacion";
import { AntesDespues } from "@/components/campanas/AntesDespues";
import { ClaseRecomendada } from "@/components/campanas/ClaseRecomendada";
import { DolorSolucion } from "@/components/campanas/DolorSolucion";
import { ComoFunciona } from "@/components/campanas/ComoFunciona";
import { CampanaObjecion } from "@/components/campanas/CampanaObjecion";
import { PruebaSocial } from "@/components/campanas/PruebaSocial";
import { CampanaFounding } from "@/components/campanas/CampanaFounding";
import { CampanaFaq } from "@/components/campanas/CampanaFaq";
import { CampanaCta } from "@/components/campanas/CampanaCta";
import { CampanaSticky } from "@/components/campanas/CampanaSticky";

export const revalidate = 3600;

type Params = { params: Promise<{ icp: string; dolor: string }> };

/** Genera las 30 rutas /l/[icp]/[dolor] a partir del mapa de contenido. */
export async function generateStaticParams() {
  return listCampanaParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { icp, dolor } = await params;
  const c = getCampana(icp, dolor);
  if (!c) return { title: "Página no encontrada" };

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    // Canónica propia OBLIGATORIA: sin ella heredan la del layout raíz ("/") y
    // Google descartaría las 30 landings en favor de la home. Se mantiene
    // autorreferencial aun con `noindex`: canonicalizarlas a /clases mandaría
    // dos señales contradictorias.
    alternates: { canonical: `/l/${icp}/${dolor}` },
    /**
     * FUERA DEL ÍNDICE, dentro de las campañas.
     *
     * Estas 30 páginas nacieron para tráfico de pago; en agosto de 2026 se
     * abrieron a orgánico y la auditoría del 14-08-2026 midió el resultado:
     * 0,94 de similitud media de texto entre ellas (misma plantilla, mismos 4
     * H2, mismo bloque de FAQ), 0 enlaces internos entrantes y el 54 % de las
     * URLs indexables del dominio. Es contenido escalado de bajo valor, y ese
     * castigo lo aplica Google al sitio entero: arrastraba a las páginas que
     * sí valen (/clases/*).
     *
     * `follow` a propósito: siguen repartiendo su autoridad hacia el sitio.
     * NO bloquearlas en robots.txt — si no se pueden rastrear, no se puede
     * leer este `noindex` y se quedarían indexadas sin remedio.
     *
     * Para volver a orgánico hay que hacerlas únicas de verdad (consolidar en
     * 5-6 páginas con contenido propio), no quitar esta línea.
     */
    robots: { index: false, follow: true },
    openGraph: { title: c.metaTitle, description: c.metaDescription, images: ogImages },
  };
}

export default async function CampanaPage({ params }: Params) {
  const { icp, dolor } = await params;
  const c = getCampana(icp, dolor);
  if (!c) notFound();

  return (
    <>
      <CampanaHero
        headline={c.headline}
        subhead={c.subhead}
        ctaLabel={c.ctaHero}
        mensajeWhatsapp={c.mensajeWhatsapp}
      />
      {/* PAS: agitar el dolor → contraste antes/después → la clase que lo resuelve. */}
      <CampanaAgitacion kicker={c.agitacion.kicker} parrafos={c.agitacion.parrafos} />
      <AntesDespues data={c.antesDespues} />
      <ClaseRecomendada clase={c.clase} mensajeWhatsapp={c.mensajeWhatsapp} />
      <DolorSolucion items={c.dolorSolucion} />
      <ComoFunciona />
      <CampanaObjecion pregunta={c.objecion.pregunta} respuesta={c.objecion.respuesta} />
      {c.pruebaSocial && <PruebaSocial texto={c.pruebaSocial} />}
      <CampanaFounding mensajeWhatsapp={c.mensajeWhatsapp} />
      <CampanaFaq items={c.faqExtra} />
      <CampanaCta
        cierreEmocional={c.cierreEmocional}
        ctaLabel={c.ctaHero}
        mensajeWhatsapp={c.mensajeWhatsapp}
        icp={icp}
        dolor={dolor}
      />
      <CampanaSticky mensaje={c.mensajeWhatsapp} />
    </>
  );
}
