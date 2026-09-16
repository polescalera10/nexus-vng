"use client";

import { useEffect, useRef, useState } from "react";
import { MapaFachada } from "@/components/ui/MapaFachada";
import { aPixel, limitarZoom, teselasVisibles, urlTesela, ZOOM_MAX, ZOOM_MIN } from "@/lib/mapa";
import { site } from "@/lib/site";

/** Clave pública de MapTiler, restringida en su panel a los dominios de la web. */
const CLAVE = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
const ZOOM_INICIAL = 16;

/**
 * Mapa de la sala, visible sin pulsar nada (petición de Pol, 16-09-2026).
 *
 * Visor propio sobre teselas de MapTiler, sin librería: lo único que hace falta
 * es colocar imágenes, arrastrar y hacer zoom, y así la home no carga los
 * 40–200 KB de Leaflet o MapLibre.
 *
 * Privacidad: las teselas las pide el navegador, así que MapTiler (empresa
 * europea, sin cookies) recibe la IP del visitante; está en la política de
 * privacidad. Para que solo ocurra con quien llega hasta el mapa, las teselas
 * no se piden hasta que el visor está a punto de entrar en pantalla.
 *
 * En móvil, el gesto vertical sigue moviendo la página (`touch-action: pan-y`)
 * y solo el horizontal arrastra el mapa: un mapa que atrapa el scroll es de lo
 * que más molesta en una web.
 *
 * Sin clave de MapTiler se queda la fachada de dos clics de Google Maps.
 */
export function MapaSala() {
  if (!CLAVE) return <MapaFachada />;
  return <Visor clave={CLAVE} />;
}

function Visor({ clave }: { clave: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(false);
  const [tam, setTam] = useState({ ancho: 0, alto: 0 });
  const [zoom, setZoom] = useState(ZOOM_INICIAL);
  // Desplazamiento del centro respecto a la sala, en píxeles del zoom actual.
  const [desp, setDesp] = useState({ x: 0, y: 0 });
  const arrastre = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActivo(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    const ro = new ResizeObserver(([e]) => {
      if (e) setTam({ ancho: e.contentRect.width, alto: e.contentRect.height });
    });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const sala = aPixel(site.geo.latitude, site.geo.longitude, zoom);
  const cx = sala.x + desp.x;
  const cy = sala.y + desp.y;
  const teselas = activo && tam.ancho > 0 ? teselasVisibles(cx, cy, tam.ancho, tam.alto, zoom) : [];
  const pin = { left: tam.ancho / 2 - desp.x, top: tam.alto / 2 - desp.y };

  const PASO_TECLADO = 64;
  const teclado = (e: React.KeyboardEvent) => {
    const mov: Record<string, [number, number]> = {
      ArrowLeft: [-PASO_TECLADO, 0],
      ArrowRight: [PASO_TECLADO, 0],
      ArrowUp: [0, -PASO_TECLADO],
      ArrowDown: [0, PASO_TECLADO],
    };
    const m = mov[e.key];
    if (m) {
      e.preventDefault();
      setDesp((d) => ({ x: d.x + m[0], y: d.y + m[1] }));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      cambiarZoom(1);
    } else if (e.key === "-") {
      e.preventDefault();
      cambiarZoom(-1);
    }
  };

  const cambiarZoom = (delta: number) => {
    const nuevo = limitarZoom(zoom + delta);
    if (nuevo === zoom) return;
    // Mantiene el mismo punto en el centro: el desplazamiento escala con el zoom.
    const factor = 2 ** (nuevo - zoom);
    setDesp((d) => ({ x: d.x * factor, y: d.y * factor }));
    setZoom(nuevo);
  };

  return (
    <figure className="overflow-hidden rounded-md border border-text-strong/10 bg-bg-elevated">
      <div
        ref={caja}
        role="application"
        aria-roledescription="mapa"
        aria-label={`Mapa con la ubicación de ${site.name}: ${site.nap.streetAddress}, ${site.nap.postalCode} ${site.nap.addressLocality}. Flechas para moverlo, más y menos para el zoom.`}
        tabIndex={0}
        onKeyDown={teclado}
        className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-neon active:cursor-grabbing sm:aspect-video"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          arrastre.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const a = arrastre.current;
          if (!a || a.id !== e.pointerId) return;
          const dx = e.clientX - a.x;
          const dy = e.pointerType === "touch" ? 0 : e.clientY - a.y;
          arrastre.current = { id: a.id, x: e.clientX, y: e.clientY };
          setDesp((d) => ({ x: d.x - dx, y: d.y - dy }));
        }}
        onPointerUp={() => (arrastre.current = null)}
        onPointerCancel={() => (arrastre.current = null)}
      >
        {teselas.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element -- teselas de mapa: se colocan por píxel y cambian con cada arrastre; next/image no aporta nada aquí.
          <img
            key={`${t.z}/${t.x}/${t.y}/${t.left}`}
            src={urlTesela(t, clave)}
            alt=""
            width={256}
            height={256}
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{ left: t.left, top: t.top, width: 256, height: 256 }}
          />
        ))}

        {/* Pin de la sala: la punta cae justo en la coordenada. */}
        <div className="pointer-events-none absolute" style={{ left: pin.left, top: pin.top }}>
          <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded-full bg-ink/90 px-3 py-1 font-body text-xs font-bold text-white shadow-soft">
              {site.name}
            </span>
            <svg viewBox="0 0 24 32" className="h-8 w-6 text-neon drop-shadow" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0Zm0 16.5a4.8 4.8 0 1 1 0-9.6 4.8 4.8 0 0 1 0 9.6Z"
              />
            </svg>
          </div>
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <BotonMapa etiqueta="Acercar" onClick={() => cambiarZoom(1)} disabled={zoom >= ZOOM_MAX}>
            +
          </BotonMapa>
          <BotonMapa etiqueta="Alejar" onClick={() => cambiarZoom(-1)} disabled={zoom <= ZOOM_MIN}>
            −
          </BotonMapa>
          <BotonMapa
            etiqueta="Volver a la sala"
            onClick={() => {
              setDesp({ x: 0, y: 0 });
              setZoom(ZOOM_INICIAL);
            }}
            disabled={desp.x === 0 && desp.y === 0 && zoom === ZOOM_INICIAL}
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" fill="currentColor" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </BotonMapa>
        </div>

        {/* Atribución obligatoria de MapTiler y OpenStreetMap. */}
        <p className="absolute bottom-0 right-0 rounded-tl bg-ink/80 px-1.5 py-0.5 font-body text-[10px] leading-tight text-white/75">
          <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:underline">
            © MapTiler
          </a>{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:underline">
            © OpenStreetMap
          </a>
        </p>
      </div>
      <figcaption className="border-t border-text-strong/10 px-4 py-2.5 font-body text-sm">
        <a
          href={site.google.mapsUrl}
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

function BotonMapa({
  etiqueta,
  onClick,
  disabled,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      disabled={disabled}
      // Los botones no deben empezar un arrastre del mapa.
      onPointerDown={(e) => e.stopPropagation()}
      className="flex size-11 items-center justify-center rounded-md border border-white/15 bg-ink/85 font-body text-xl leading-none text-white shadow-soft transition-colors hover:border-neon/60 hover:text-neon disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-white"
    >
      {children}
    </button>
  );
}
