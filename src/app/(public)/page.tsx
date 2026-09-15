import { Hero } from "@/components/landing/Hero";
import { IntroLocal } from "@/components/landing/IntroLocal";
import { ParaTi } from "@/components/landing/ParaTi";
import { PuntoDePartida } from "@/components/landing/PuntoDePartida";
import { Experiencia } from "@/components/landing/Experiencia";
import { Modalidades } from "@/components/landing/Modalidades";
import { Comunidad } from "@/components/landing/Comunidad";
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
import type { Metadata } from "next";

/*
  Meta propia de la home, con acción al final. No se toca `site.description`:
  además de la meta por defecto del layout, es la `description` del
  `DanceSchool` en el JSON-LD, y ahí no pinta una llamada a WhatsApp.
  Solo se declara `description`: Next fusiona por clave con el layout, así que
  title, canonical y openGraph siguen saliendo de allí.
*/
export const metadata: Metadata = {
  description:
    "Escuela de baile en Vilanova i la Geltrú: salsa cubana, bachata, reparto, heels y más, con grupos desde cero. Reserva tu clase de prueba por WhatsApp.",
};

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
      {/* Fotos reales desde 05-09-2026. El bloque de reseñas sigue condicionado
          a que existan reseñas verificadas de Google (content/landing.ts). */}
      <Comunidad />
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
