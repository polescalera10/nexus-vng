import { Hero } from "@/components/landing/Hero";
import { IntroLocal } from "@/components/landing/IntroLocal";
import { ParaTi } from "@/components/landing/ParaTi";
import { PuntoDePartida } from "@/components/landing/PuntoDePartida";
import { Experiencia } from "@/components/landing/Experiencia";
import { Modalidades } from "@/components/landing/Modalidades";
// TODO: reactivar <Comunidad /> cuando haya fotos reales, reseñas de Google y nota media.
// import { Comunidad } from "@/components/landing/Comunidad";
import { Profesores } from "@/components/landing/Profesores";
import { Founding } from "@/components/landing/Founding";
import { Precios } from "@/components/landing/Precios";
import { ComoEmpezar } from "@/components/landing/ComoEmpezar";
import { Faq } from "@/components/landing/Faq";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";
import { getModalidades } from "@/lib/queries/modalidades";
import { getFoundingSpots } from "@/lib/queries/founding";
import { faqs } from "@/content/landing";

// ISR: la landing es estática y se revalida cada hora (modalidades editables).
export const revalidate = 3600;

export default async function HomePage() {
  const [modalidades, spots] = await Promise.all([getModalidades(), getFoundingSpots()]);

  return (
    <main>
      <Hero />
      <IntroLocal />
      <ParaTi />
      <Experiencia />
      <Modalidades modalidades={modalidades} />
      {/* Oculta hasta tener contenido real (fotos + reseñas): <Comunidad /> */}
      <Profesores />
      <Founding spots={spots} />
      {/* Precios "estándar": debajo del founding a propósito — cuando la promo
          fundadora se retire y se borre <Founding />, esta sección queda como
          el bloque de precios de referencia de la home. */}
      <section className="bg-bg-panel py-[clamp(56px,9vw,110px)]">
        <div className="container-nexus">
          <Precios />
        </div>
      </section>
      <ComoEmpezar />
      <PuntoDePartida />
      <Faq />
      <CtaFinal />
      <JsonLd data={faqLd(faqs)} />
    </main>
  );
}
