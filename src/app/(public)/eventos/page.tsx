import type { Metadata } from "next";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { JsonLd, eventLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { site } from "@/lib/site";
import { getEventos } from "@/lib/queries/eventos";
import type { Evento } from "@/types/database";

export const metadata: Metadata = {
  title: "Eventos de Baile",
  description: "Fiestas, masterclasses y socials de NEXUS VNG en Vilanova i la Geltrú: las citas donde se practica lo de clase y se conoce al resto de la comunidad.",
  alternates: { canonical: "/eventos" },
};

// Revalidar cada hora
export const revalidate = 3600;

const COVER_IMAGES: Record<string, string> = {
  "fiesta-social-mensual": "/images/social_dance_event.png",
  "masterclass-bachata": "/images/bachata_masterclass.png",
};

/**
 * Duración en horas por tipo de evento, SOLO donde está publicada en la propia
 * ficha ("de 19:00h a 21:00h", "hasta las 01:30h"). Los tipos sin duración
 * documentada no llevan `endDate`: preferimos un schema incompleto a una hora
 * de cierre inventada.
 */
const DURACION_H: Partial<Record<Evento["tipo"], number>> = {
  social: 4.5,
  masterclass: 2,
};

/**
 * Suma horas a una fecha sin zona ("2026-07-04T21:00:00") y devuelve el mismo
 * formato local. Se parsea y se formatea con los mismos getters locales, así
 * que el resultado no depende de la zona del servidor de build.
 */
function sumarHoras(fecha: string, horas: number): string | undefined {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setMinutes(d.getMinutes() + Math.round(horas * 60));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * `Event` completo de una ficha: parte del helper común y le añade lo que este
 * listado sí conoce — imagen real, hora de fin derivada y dirección completa.
 */
function eventoLdCompleto(e: Evento, cover: string | null) {
  const horas = DURACION_H[e.tipo];
  const endDate = horas ? sumarHoras(e.fecha, horas) : undefined;

  return {
    ...eventLd({ titulo: e.titulo, descripcion: e.descripcion, fecha: e.fecha }),
    ...(endDate ? { endDate } : {}),
    ...(cover ? { image: [`${site.url}${cover}`] } : {}),
    ...(e.slug ? { url: `${site.url}/eventos/${e.slug}` } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "es-ES",
    location: {
      "@type": "Place",
      name: `${site.name} · ${site.nap.venue}`,
      address: {
        "@type": "PostalAddress",
        // La calle sigue pendiente de confirmar en lib/site.ts; vacía no se emite.
        streetAddress: site.nap.streetAddress || undefined,
        addressLocality: site.nap.addressLocality,
        addressRegion: site.nap.addressRegion,
        postalCode: site.nap.postalCode,
        addressCountry: site.nap.addressCountry,
      },
    },
  };
}

export default async function EventosPage() {
  const eventos = await getEventos();

  return (
    <SupportPage
      eyebrow="La comunidad en vivo"
      title="Eventos"
      intro="Fiestas, masterclasses y socials donde la escuela se convierte en pista."
    >
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Eventos", path: "/eventos" },
        ]}
      />

      <ul className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6 p-0 list-none">
        {eventos.map((e) => {
          const cover = (e.slug ? COVER_IMAGES[e.slug] : null) ?? null;
          
          return (
            <li key={e.id}>
              <Link
                href={`/eventos/${e.slug}`}
                className="group overflow-hidden rounded-lg border border-white/8 bg-bg-panel shadow-soft hover:border-neon/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300 block no-underline text-inherit"
              >
                {/* Cabecera de la tarjeta con imagen o fallback */}
                <div className="overflow-hidden h-48 relative bg-bg-elevated">
                  {cover ? (
                    <img
                      src={cover}
                      alt={e.titulo}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <PhotoPlaceholder label={`[ ${e.tipo} ]`} tint="mix" className="h-full p-3" />
                  )}
                  <span className="absolute top-3 left-3 bg-neon text-ink text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {e.tipo}
                  </span>
                </div>

                <div className="p-6">
                  <time className="font-body text-xs font-semibold uppercase tracking-wide text-neon-mint">
                    {new Date(e.fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}h
                  </time>
                  <h2 className="mt-1 font-display text-2xl text-text-strong group-hover:text-neon transition-colors">
                    {e.titulo}
                  </h2>
                  <p className="mt-2 font-body text-[14px] text-text-muted line-clamp-2 leading-relaxed">
                    {e.descripcion?.replace(/[#*_[\]]/g, "")}
                  </p>
                  <span className="mt-4 inline-block font-body text-[13px] font-bold text-neon group-hover:underline">
                    Ver más detalles &rarr;
                  </span>
                </div>
              </Link>
              <JsonLd data={eventoLdCompleto(e, cover)} />
            </li>
          );
        })}
      </ul>
      {/* Estado vacío honesto cuando no hay eventos publicados. */}
      {eventos.length === 0 && (
        <p className="max-w-[60ch] font-body text-base leading-relaxed text-text-body">
          Estamos preparando el calendario de fiestas, socials y masterclasses. Síguenos en
          Instagram o escríbenos por WhatsApp y te avisamos del próximo evento.
        </p>
      )}

      {/*
        Nota interna (oculta en producción): los eventos se sincronizan desde la
        tabla `eventos` de Supabase — añade socials o masterclasses ahí y
        aparecen automáticamente.
      */}
    </SupportPage>
  );
}
