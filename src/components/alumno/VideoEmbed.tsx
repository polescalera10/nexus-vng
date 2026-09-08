"use client";

import { useState } from "react";
import { parseVideoUrl, VIDEO_PROVIDER_LABELS } from "@/lib/video";

/**
 * Reproductor del diario de clase.
 *
 * El iframe NO se monta al pintar la página: hasta que el alumno pulsa, no
 * sale una sola petición a YouTube/Vimeo/Drive. Es la fachada de dos clics que
 * pide el RGPD para embeds de terceros — el alumno está identificado y su IP
 * no tiene por qué llegar a Google porque haya abierto la ficha de su clase.
 * Además ahorra tres o cuatro iframes de golpe en una lista de sesiones.
 *
 * Si la URL no pasa la lista blanca de `lib/video.ts`, no se pinta nada: mejor
 * el hueco que un iframe a un dominio que nadie ha revisado.
 */
export function VideoEmbed({ url, titulo }: { url: string; titulo?: string | null }) {
  const [activo, setActivo] = useState(false);
  const video = parseVideoUrl(url);

  if (!video) return null;

  const proveedor = VIDEO_PROVIDER_LABELS[video.provider];

  return (
    <figure className="overflow-hidden rounded-md border border-text-strong/10 bg-bg-elevated">
      <div className="relative aspect-video">
        {activo ? (
          <iframe
            src={video.embedUrl}
            title={titulo || `Vídeo de la clase (${proveedor})`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
              <svg viewBox="0 0 24 24" className="ml-0.5 size-6" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="px-6 font-body text-sm font-semibold text-text-strong">
              {titulo || "Ver el vídeo"}
            </span>
            <span className="px-6 font-body text-xs text-text-muted">
              Se carga desde {proveedor} al darle al play
            </span>
          </button>
        )}
      </div>

      {titulo && activo && (
        <figcaption className="border-t border-text-strong/10 px-4 py-2.5 font-body text-sm text-text-body">
          {titulo}
        </figcaption>
      )}
    </figure>
  );
}
