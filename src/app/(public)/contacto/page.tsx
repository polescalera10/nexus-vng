import type { Metadata } from "next";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { LeadForm } from "@/components/forms/LeadForm";
import { WaLink } from "@/components/ui/WaLink";
import { JsonLd, ORG_ID } from "@/components/seo/JsonLd";
import { diasSemana, horarioRegular, sesionesRegulares } from "@/content/horario-regular";
import { site, WHATSAPP_NUMBER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta con NEXUS VNG, escuela de baile en Vilanova i la Geltrú: WhatsApp, teléfono y formulario para reservar tu clase de prueba y elegir grupo.",
  alternates: { canonical: "/contacto" },
};

/* ------------------------------------------------------------------ *
 * Horario de atención — derivado del cartel real, no inventado.
 * Estamos en la sala mientras hay clase: de la primera franja del cartel
 * hasta una hora después de la última (las clases duran una hora).
 * ------------------------------------------------------------------ */

const DIA_SCHEMA: Record<string, string> = {
  Lunes: "https://schema.org/Monday",
  Martes: "https://schema.org/Tuesday",
  Miércoles: "https://schema.org/Wednesday",
  Jueves: "https://schema.org/Thursday",
  Viernes: "https://schema.org/Friday",
};

const franjas = [...horarioRegular.map((f) => f.hora)].sort();
const apertura = franjas[0] ?? "";
const ultimaClase = franjas[franjas.length - 1] ?? "";

function unaHoraMas(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const cierre = unaHoraMas(ultimaClase);
const diasConClase = diasSemana.filter((d) => sesionesRegulares.some((s) => s.dia === d));
const primerDia = diasConClase[0] ?? "";
const ultimoDia = diasConClase[diasConClase.length - 1] ?? "";

const contactoLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contacto · ${site.name}`,
  url: `${site.url}/contacto`,
  inLanguage: "es-ES",
  mainEntity: {
    "@type": "DanceSchool",
    // Mismo @id que el bloque global del layout: así esta ficha de contacto
    // enriquece la entidad existente en vez de declarar una segunda escuela.
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    telephone: site.nap.telephoneDisplay,
    address: {
      "@type": "PostalAddress",
      // La calle se omite hasta que esté confirmada en lib/site.ts.
      streetAddress: site.nap.streetAddress || undefined,
      addressLocality: site.nap.addressLocality,
      addressRegion: site.nap.addressRegion,
      postalCode: site.nap.postalCode,
      addressCountry: site.nap.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: site.nap.telephoneDisplay,
        url: `${site.url}/contacto`,
        areaServed: ["Vilanova i la Geltrú", "Garraf"],
        availableLanguage: ["es-ES", "ca-ES"],
        hoursAvailable: diasConClase.map((dia) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: DIA_SCHEMA[dia],
          opens: apertura,
          closes: cierre,
        })),
      },
      {
        "@type": "ContactPoint",
        contactType: "reservations",
        telephone: site.nap.telephoneDisplay,
        url: `https://wa.me/${WHATSAPP_NUMBER}`,
        areaServed: ["Vilanova i la Geltrú", "Garraf"],
        availableLanguage: ["es-ES", "ca-ES"],
      },
    ],
  },
};

export default function ContactoPage() {
  return (
    <SupportPage
      eyebrow="Hablemos"
      title="Contacto"
      intro="La vía más rápida es WhatsApp: nos cuentas qué quieres bailar y qué días puedes, y te decimos qué grupo encaja. Si lo prefieres, déjanos tus datos y te escribimos nosotros."
    >
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Contacto", path: "/contacto" },
          ]}
        />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-text-strong text-2xl">Escríbenos</h2>
            <p className="font-body text-text-muted mt-2 max-w-[46ch] text-[15px]">
              Reserva tu primera clase de prueba y da tus primeros pasos con nosotros. No hace falta
              que sepas qué estilo quieres ni en qué nivel estás: para eso escribimos.
            </p>
            <WaLink origin="contacto" variant="red" className="mt-4 px-7 py-[15px]">
              Abrir WhatsApp
            </WaLink>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-text-strong text-2xl">Cuándo nos encuentras</h2>
            <p className="font-body text-text-body max-w-[46ch] text-[15px] leading-relaxed">
              Estamos en la sala de {primerDia.toLowerCase()} a {ultimoDia.toLowerCase()}, de{" "}
              {apertura} a {cierre}: es el horario de clases de la temporada 26·27. Puedes verlo
              entero en{" "}
              <Link href="/horarios" className="text-neon font-semibold no-underline hover:underline">
                la parrilla de horarios
              </Link>
              .
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-text-strong text-2xl">Cuándo te respondemos</h2>
            <p className="font-body text-text-body max-w-[46ch] text-[15px] leading-relaxed">
              Somos un equipo pequeño y damos clase por las tardes, así que no prometemos un plazo
              exacto. Lo habitual: si escribes durante la franja de clases, te contestamos al
              terminar la sesión; el resto del día lo miramos en cuanto tenemos un hueco. Ningún
              mensaje se queda sin respuesta.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-text-strong text-2xl">Dónde estamos</h2>
            <address className="font-body text-text-muted mt-2 text-sm leading-7 not-italic">
              {site.nap.venue}
              {/* La calle solo se pinta cuando esté confirmada en lib/site.ts. */}
              {site.nap.streetAddress && (
                <>
                  <br />
                  {site.nap.streetAddress}
                </>
              )}
              <br />
              {site.nap.postalCode} {site.nap.addressLocality} ({site.nap.addressRegion})
              <br />
              {site.nap.telephoneDisplay}
            </address>
            <p className="font-body text-text-faint max-w-[46ch] text-[13px] leading-relaxed">
              Escríbenos por WhatsApp y te mandamos la ubicación exacta y cómo llegar a la sala.
            </p>
          </div>
        </div>

        <div className="bg-bg-panel shadow-card rounded-lg border border-white/8 p-6 sm:p-8">
          <h2 className="font-display text-text-strong mb-4 text-2xl">Déjanos tus datos</h2>
          <LeadForm origen="contacto" withModalidad withMensaje />
          <p className="font-body text-text-faint mt-4 text-[13px] leading-relaxed">
            ¿Solo quieres resolver una duda rápida? Muchas están ya contestadas en{" "}
            <Link href="/faq" className="text-text-muted no-underline hover:underline">
              las preguntas frecuentes
            </Link>
            .
          </p>
        </div>
      </div>

      <JsonLd data={contactoLd} />
    </SupportPage>
  );
}
