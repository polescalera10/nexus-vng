"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/*
  El mapa marca las coordenadas de la ficha verificada de Google Business
  Profile (lib/site.ts), no una búsqueda por dirección: así el pin cae donde
  Google tiene el negocio. "Cómo llegar" abre la ficha, con reseñas y ruta.
*/
export const MAPA_EMBED_URL = `https://www.google.com/maps?q=${site.geo.latitude},${site.geo.longitude}&z=17&output=embed`;
export const MAPA_ENLACE_URL = site.google.mapsUrl;

/**
 * Mapa de la sala con fachada de dos clics, igual que los vídeos del diario
 * (`components/alumno/VideoEmbed.tsx`): el iframe de Google Maps no se monta
 * hasta que alguien lo pide, así que abrir /contacto no manda la IP del
 * visitante a Google (RGPD) ni carga un iframe pesado en móvil.
 *
 * El origen del iframe (`https://www.google.com`) está en `frame-src` de la CSP
 * (`next.config.ts`); si cambia la URL, cambia allí también.
 */
export function MapaFachada() {
  const [activo, setActivo] = useState(false);

  return (
    <figure className="overflow-hidden rounded-md border border-text-strong/10 bg-bg-elevated">
      <div className="relative aspect-[4/3] sm:aspect-video">
        {activo ? (
          <iframe
            src={MAPA_EMBED_URL}
            title={`Mapa de ${site.name} en ${site.nap.venue}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivo(true)}
            className="group absolute inset-0 flex size-full flex-col items-center justify-center gap-3 bg-bg-elevated transition-colors hover:bg-accent/6"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-accent text-ink shadow-neon transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                <path
                  d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="px-6 font-body text-sm font-semibold text-text-strong">Ver el mapa</span>
            <span className="px-6 text-center font-body text-xs text-text-muted">
              Se carga desde Google Maps al pulsar
            </span>
          </button>
        )}
      </div>
      <figcaption className="border-t border-text-strong/10 px-4 py-2.5 font-body text-sm">
        <a
          href={MAPA_ENLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-neon no-underline hover:underline"
        >
          Cómo llegar en Google Maps
        </a>
      </figcaption>
    </figure>
  );
}
