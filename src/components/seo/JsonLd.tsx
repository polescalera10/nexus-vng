import { sesionesRegulares } from "@/content/horario-regular";
import { precios } from "@/content/precios";
import { site } from "@/lib/site";

/** Día de la semana del cartel → schema.org DayOfWeek. */
const DIA_SCHEMA: Record<string, string> = {
  Lunes: "https://schema.org/Monday",
  Martes: "https://schema.org/Tuesday",
  Miércoles: "https://schema.org/Wednesday",
  Jueves: "https://schema.org/Thursday",
  Viernes: "https://schema.org/Friday",
};

/**
 * Horario de apertura derivado del cartel real: primera y última clase de cada
 * día. No se inventa nada — si un día no tiene clases, no aparece.
 */
function openingHours() {
  return Object.entries(DIA_SCHEMA)
    .map(([dia, dayOfWeek]) => {
      const horas = sesionesRegulares.filter((s) => s.dia === dia).map((s) => s.hora);
      if (horas.length === 0) return null;
      const orden = [...horas].sort();
      const apertura = orden[0]!;
      // Las clases duran una hora larga; se cierra a la hora en punto siguiente.
      const [h = 0, m = 0] = orden[orden.length - 1]!.split(":").map(Number);
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens: apertura,
        closes: `${String(h + 1 + (m >= 30 ? 1 : 0)).padStart(2, "0")}:00`,
      };
    })
    .filter(Boolean);
}

/**
 * Inserta un bloque JSON-LD. `data` debe ser serializable.
 *
 * ⚠️ `JSON.stringify` NO escapa `<`, así que un dato que contenga la secuencia
 * `</script>` cerraría el bloque y ejecutaría lo que viniera detrás (XSS). No
 * todo lo que llega aquí es estático: las páginas de eventos pasan `titulo` y
 * `descripcion` leídos de Supabase. `<` es JSON válido y schema.org lo
 * interpreta igual. Ver docs/auditoria-seguridad-2026-08-03.md (A3).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * Identificador único de la escuela como entidad.
 *
 * El bloque `DanceSchool` se repite en las 56 páginas (va en el layout raíz).
 * Sin `@id`, cada página declara una organización distinta y Google no las
 * consolida en una sola entidad. Con `@id`, el resto de bloques de la misma
 * página (`provider` del curso, `organizer` del evento, `worksFor` del
 * profesor, `offeredBy` de la oferta) se limitan a apuntar aquí en vez de
 * repetir el objeto entero.
 */
export const ORG_ID = `${site.url}/#organization`;

/** Referencia al nodo de la escuela. Solo resuelve si `localBusinessLd()` está en la misma página — lo está, vía layout raíz. */
export const orgRef = () => ({ "@id": ORG_ID });

/** Schema.org LocalBusiness — global (footer / home). */
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    "@id": ORG_ID,
    name: site.name,
    description: site.description,
    url: site.url,
    address: {
      "@type": "PostalAddress",
      // La calle se omite del schema hasta que esté confirmada en lib/site.ts.
      streetAddress: site.nap.streetAddress || undefined,
      addressLocality: site.nap.addressLocality,
      addressRegion: site.nap.addressRegion,
      postalCode: site.nap.postalCode,
      addressCountry: site.nap.addressCountry,
    },
    telephone: site.nap.telephoneDisplay,
    // Foto real del equipo: Google la usa en el panel de conocimiento y en el
    // resultado local. Absoluta, como exige schema.org.
    image: `${site.url}/images/equipo-nexus.png`,
    logo: `${site.url}/images/nexus-logo.png`,
    sameAs: [site.social.instagram, site.social.tiktok].filter(Boolean),
    // Rango de precio derivado del modelo real (35-100 €/mes), no inventado.
    // Guion simple, no raya tipográfica: algunos validadores no la digieren.
    priceRange: `${precios.base}-${precios.flat} €/${precios.periodo}`,
    currenciesAccepted: "EUR",
    areaServed: [
      { "@type": "City", name: "Vilanova i la Geltrú" },
      { "@type": "AdministrativeArea", name: "Garraf" },
    ],
    openingHoursSpecification: openingHours(),
    knowsLanguage: ["es-ES", "ca-ES"],
  };
}

/**
 * Schema.org BreadcrumbList. `items` en orden jerárquico, del inicio a la
 * página actual; la última entrada es la propia página.
 */
export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/**
 * Schema.org Course — páginas de modalidad.
 *
 * `sesiones` alimenta `hasCourseInstance` con las clases reales del cartel:
 * sin al menos una instancia y una oferta, Google no considera la página
 * elegible para el resultado enriquecido de curso.
 */
export function courseLd(
  nombre: string,
  descripcion: string,
  slug: string,
  sesiones: Array<{ dia: string; hora: string; nivel?: string }> = [],
  /** Contenidos reales de la clase ("En clase aprenderás"), para `teaches`. */
  aprenderas: string[] = [],
) {
  // Niveles que existen de verdad en el cartel de esta disciplina.
  const niveles = [...new Set(sesiones.map((s) => s.nivel).filter(Boolean))] as string[];

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${site.url}/clases/${slug}#course`,
    name: `Clases de ${nombre.toLowerCase()} en ${site.locality}`,
    description: descripcion,
    url: `${site.url}/clases/${slug}`,
    inLanguage: "es-ES",
    about: nombre,
    image: `${site.url}/opengraph-image`,
    // Lo que se aprende, tal cual está escrito en la página: nada nuevo que
    // mantener sincronizado a mano.
    teaches: aprenderas.length > 0 ? aprenderas : undefined,
    educationalLevel: niveles.length > 0 ? niveles : undefined,
    provider: orgRef(),
    offers: {
      "@type": "Offer",
      category: "Subscription",
      price: precios.base,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${site.url}/clases/${slug}`,
    },
    hasCourseInstance: sesiones.map((s) => ({
      "@type": "CourseInstance",
      courseMode: "Onsite",
      courseWorkload: "PT1H",
      name: [nombre, s.nivel].filter(Boolean).join(" · "),
      courseSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: DIA_SCHEMA[s.dia],
        startTime: s.hora,
        scheduleTimezone: "Europe/Madrid",
      },
      location: {
        "@type": "Place",
        name: `${site.name} · ${site.nap.venue}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.nap.streetAddress || undefined,
          addressLocality: site.nap.addressLocality,
          postalCode: site.nap.postalCode,
          addressCountry: site.nap.addressCountry,
        },
      },
    })),
  };
}

/**
 * Schema.org Event — /eventos/[slug].
 *
 * `url` apunta a la ficha del evento, no al listado: Google pide una URL
 * propia por evento para plantearse el resultado enriquecido. `image` sale de
 * la primera imagen del propio Markdown de la ficha (si la hay), así que no
 * hay que mantener una lista aparte.
 */
export function eventLd(e: {
  titulo: string;
  descripcion?: string | null;
  fecha: string;
  slug?: string | null;
  /** Imagen destacada del evento (ruta absoluta o relativa al dominio). */
  imagen?: string | null;
}) {
  const url = e.slug ? `${site.url}/eventos/${e.slug}` : `${site.url}/eventos`;
  const imagen = e.imagen
    ? e.imagen.startsWith("http")
      ? e.imagen
      : `${site.url}${e.imagen}`
    : `${site.url}/opengraph-image`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.titulo,
    description: e.descripcion ?? undefined,
    startDate: e.fecha,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "es-ES",
    url,
    image: imagen,
    location: {
      "@type": "Place",
      name: `${site.name} · ${site.nap.venue}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.nap.streetAddress || undefined,
        addressLocality: site.nap.addressLocality,
        addressRegion: site.nap.addressRegion,
        postalCode: site.nap.postalCode,
        addressCountry: site.nap.addressCountry,
      },
    },
    organizer: orgRef(),
  };
}

/**
 * Schema.org ItemList de los cursos — /clases.
 *
 * Es lo que declara que esa página es el catálogo (y la vía para el carrusel
 * de cursos en el SERP). Cada elemento apunta por `@id` a la ficha, que es
 * donde vive el `Course` completo.
 */
export function courseListLd(modalidades: Array<{ slug: string; nombre: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Clases de baile en ${site.locality}`,
    itemListElement: modalidades.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/clases/${m.slug}`,
      name: `Clases de ${m.nombre.toLowerCase()} en ${site.locality}`,
    })),
  };
}

/** Schema.org FAQPage — /faq y bloque FAQ de la landing. */
export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
