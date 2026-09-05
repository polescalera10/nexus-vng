"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Fuente = { src: string; poster: string };

type VideoLoopProps = {
  /** Fuente única, o una por tamaño de pantalla si la fuente vertical no sirve en escritorio. */
  fuente: Fuente | { movil: Fuente; desktop: Fuente; anchoDesktop?: number };
  alt: string;
  /** Dimensiones del póster para reservar el hueco (evita saltos de layout). */
  ancho: number;
  alto: number;
  /**
   * Clases del contenedor. Tiene que traer el posicionamiento Y el tamaño: las
   * dos capas van en `absolute`, así que sin eso el hueco mide cero. En flujo,
   * `relative aspect-[3/4]`; de fondo a pantalla completa, `absolute inset-0`.
   */
  className?: string;
  /** `true` solo en el póster del hero: es el LCP y tiene que ir con prioridad. */
  prioridad?: boolean;
  /** Zoom lento sobre la imagen y el vídeo (fondo del hero). */
  zoom?: boolean;
  sizes?: string;
};

const esUnica = (f: VideoLoopProps["fuente"]): f is Fuente => "src" in f;

/**
 * Vídeo decorativo en bucle, mudo y sin controles.
 *
 * El póster se pinta SIEMPRE como imagen normal y el `<video>` solo se monta
 * después, en el cliente. Es a propósito:
 *
 *  · El hero es el bloque LCP. Si el navegador tiene que descargar un MP4 para
 *    pintar el fondo, el LCP se va detrás del vídeo. Con el póster delante, lo
 *    que mide Lighthouse es un JPEG de 150 KB.
 *  · Respeta `prefers-reduced-motion`: quien lo tenga activado se queda con la
 *    imagen fija, que es exactamente lo que pide esa preferencia.
 *  · Respeta el modo ahorro de datos y las conexiones lentas (`saveData`,
 *    `effectiveType` 2g/3g): en móvil con datos escasos no se descarga nada.
 *
 * Además el vídeo solo se reproduce mientras está en pantalla: fuera del
 * viewport se pausa, para no gastar batería decodificando lo que nadie ve.
 */
export function VideoLoop({
  fuente,
  alt,
  ancho,
  alto,
  className = "",
  prioridad = false,
  zoom = false,
  sizes,
}: VideoLoopProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [activo, setActivo] = useState<Fuente | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // `connection` no está en el tipado estándar de Navigator.
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /^(slow-)?2g$|^3g$/.test(conn.effectiveType)) return;

    const elegida = esUnica(fuente)
      ? fuente
      : window.matchMedia(`(min-width: ${fuente.anchoDesktop ?? 768}px)`).matches
        ? fuente.desktop
        : fuente.movil;

    const el = contenedor.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActivo(elegida);
          // Pausar/reanudar según visibilidad. El `play()` devuelve una promesa
          // que puede rechazarse si el navegador bloquea la reproducción; se
          // ignora a propósito, porque el póster ya está debajo.
          const v = video.current;
          if (!v) continue;
          if (entry.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // `fuente` es un literal recreado en cada render del padre; el efecto solo
    // debe correr al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const poster = esUnica(fuente) ? fuente.poster : fuente.movil.poster;

  /* Las dos capas van en posición absoluta y el contenedor manda en el tamaño
     (una relación de aspecto, o `h-full` dentro de un padre que ya la tenga).
     Así el zoom escala la imagen y el vídeo sin agrandar nada que esté en el
     flujo: un elemento en flujo escalado se sale de la pantalla y el e2e de
     desbordamiento —con razón— lo canta. */
  const capa = `absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
    zoom ? "motion-safe:animate-[slowzoom_22s_ease-in-out_infinite_alternate]" : ""
  }`;

  return (
    <div ref={contenedor} className={`overflow-hidden ${className}`}>
      <Image
        src={activo?.poster ?? poster}
        alt={alt}
        width={ancho}
        height={alto}
        sizes={sizes}
        priority={prioridad}
        className={`${capa} ${listo ? "opacity-0" : "opacity-100"}`}
      />
      {activo && (
        <video
          ref={video}
          src={activo.src}
          poster={activo.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setListo(true)}
          className={`${capa} ${listo ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
