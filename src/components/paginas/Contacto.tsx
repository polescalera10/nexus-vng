import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { LeadForm } from "@/components/forms/LeadForm";
import { WaLink } from "@/components/ui/WaLink";
import { MapaSala } from "@/components/ui/MapaSala";
import { JsonLd, ORG_ID } from "@/components/seo/JsonLd";
import { diasSemana, horarioRegular, sesionesRegulares } from "@/content/horario-regular";
import { site, WHATSAPP_NUMBER } from "@/lib/site";
import { enlace, tieneVersion } from "@/i18n/rutas";
import { BCP47, type Locale } from "@/i18n/locales";
import { tDias, tMigas } from "@/i18n/textos/comun";
import { tContacto } from "@/i18n/textos/paginas";

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

function contactoLd(locale: Locale) {
  const url = `${site.url}${enlace("/contacto", locale)}`;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: tContacto[locale].schemaNombre(site.name),
    url,
    inLanguage: BCP47[locale],
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
          url,
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
}

/** Cuerpo de la página de contacto, compartido por `/contacto` y `/ca/contacte`. */
export function Contacto({ locale }: { locale: Locale }) {
  const t = tContacto[locale];
  const migas = tMigas[locale];
  const dias = tDias[locale];
  const local = locale === "ca" ? site.nap.venue.replace(/^Gimnasio/, "Gimnàs") : site.nap.venue;

  return (
    <SupportPage locale={locale} eyebrow={t.eyebrow} title={t.h1} intro={t.intro}>
      <div className="mb-8">
        <Breadcrumbs
          locale={locale}
          items={[
            { name: migas.inicio, path: enlace("/", locale) },
            { name: migas.contacto, path: enlace("/contacto", locale) },
          ]}
        />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-text-strong text-2xl">{t.escribenos}</h2>
            <p className="font-body text-text-muted mt-2 max-w-[46ch] text-[15px]">{t.escribenosTexto}</p>
            <WaLink origin="contacto" locale={locale} variant="red" className="mt-4 px-7 py-[15px]">
              {t.abrirWhatsapp}
            </WaLink>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-text-strong text-2xl">{t.cuando}</h2>
            <p className="font-body text-text-body max-w-[46ch] text-[15px] leading-relaxed">
              {t.cuandoAntes({
                primerDia: (dias[primerDia] ?? primerDia).toLowerCase(),
                ultimoDia: (dias[ultimoDia] ?? ultimoDia).toLowerCase(),
                apertura,
                cierre,
              })}{" "}
              <Link href={enlace("/horarios", locale)} className="text-neon font-semibold no-underline hover:underline">
                {t.parrilla}
              </Link>
              .
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-text-strong text-2xl">{t.respuesta}</h2>
            <p className="font-body text-text-body max-w-[46ch] text-[15px] leading-relaxed">{t.respuestaTexto}</p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-text-strong text-2xl">{t.donde}</h2>
            <address className="font-body text-text-muted mt-2 text-sm leading-7 not-italic">
              {local}
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
            <p className="font-body text-text-faint max-w-[46ch] text-[13px] leading-relaxed">{t.planta}</p>
            <div className="pt-3">
              <MapaSala locale={locale} />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel shadow-card rounded-lg border border-white/8 p-6 sm:p-8">
          <h2 className="font-display text-text-strong mb-4 text-2xl">{t.datos}</h2>
          <LeadForm origen="contacto" withModalidad withMensaje locale={locale} />
          <p className="font-body text-text-faint mt-4 text-[13px] leading-relaxed">
            {t.dudaRapida}{" "}
            <Link
              href="/faq"
              hrefLang={tieneVersion("/faq", locale) ? undefined : "es"}
              className="text-text-muted no-underline hover:underline"
            >
              {t.preguntas}
            </Link>
            .
          </p>
        </div>
      </div>

      <JsonLd data={contactoLd(locale)} />
    </SupportPage>
  );
}
