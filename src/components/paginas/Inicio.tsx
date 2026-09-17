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
import { DondeEstamos } from "@/components/landing/DondeEstamos";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";
import { getModalidades } from "@/lib/queries/modalidades";
import { getFoundingSpots } from "@/lib/queries/founding";
import { landingEn } from "@/content/por-idioma";
import { getResenasGoogle } from "@/lib/google-reviews";
import type { Locale } from "@/i18n/locales";

/** Cuerpo de la home, compartido por `/` y `/ca`. */
export async function Inicio({ locale }: { locale: Locale }) {
  const [modalidades, spots, resenas] = await Promise.all([
    getModalidades(),
    getFoundingSpots(),
    getResenasGoogle(),
  ]);
  const { faqs } = landingEn(locale);

  return (
    <main>
      <Hero locale={locale} valoracion={resenas ? { nota: resenas.nota, total: resenas.total } : null} />
      <IntroLocal locale={locale} />
      <ParaTi locale={locale} />
      <Experiencia locale={locale} />
      <Modalidades locale={locale} modalidades={modalidades} />
      {/* Fotos reales de clase y, debajo, el carrusel de reseñas de la ficha de
          Google (Featurable). Sin reseñas, solo las fotos. */}
      <Comunidad locale={locale} resenas={resenas} />
      <Profesores locale={locale} />
      <Founding locale={locale} spots={spots} />
      {/* Precios "estándar": debajo del founding a propósito — cuando la promo
          fundadora se retire y se borre <Founding />, esta sección queda como
          el bloque de precios de referencia de la home. */}
      <section className="bg-bg-panel py-[clamp(56px,9vw,110px)]">
        <div className="container-nexus">
          <Precios locale={locale} />
        </div>
      </section>
      <ComoEmpezar locale={locale} />
      {/* El mapa, justo cuando se le dice al visitante que venga a la sala. */}
      <DondeEstamos locale={locale} />
      {/* Enlaza a las landings de campaña, que solo existen en castellano. */}
      {locale === "es" && <PuntoDePartida />}
      <Faq locale={locale} />
      <CtaFinal locale={locale} />
      <JsonLd data={faqLd(faqs)} />
    </main>
  );
}
