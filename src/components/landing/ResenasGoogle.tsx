"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResenasGoogle as Datos } from "@/lib/google-reviews";
import { MAX_RESENAS } from "@/lib/google-reviews";

function Estrellas({ n, className = "", label }: { n: number; className?: string; label?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={label ?? `${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`size-4 ${i <= n ? "text-star" : "text-white/20"}`} aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
          />
        </svg>
      ))}
    </span>
  );
}

export function formatNota(nota: number) {
  return nota.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "septiembre de 2026": estable aunque la página se regenere solo cada hora. */
function formatMes(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "Europe/Madrid" });
}

function Flecha({ dir }: { dir: "izq" | "der" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d={dir === "izq" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Carrusel de reseñas de la ficha de Google, ya pedidas en el servidor
 * (`lib/google-reviews.ts`) y pintadas en el HTML.
 *
 * Carrusel de scroll nativo con `scroll-snap`: en móvil se desliza con el dedo
 * y en escritorio tiene flechas. Sin autoplay (las reseñas se leen a su ritmo y
 * el movimiento solo es un problema de accesibilidad) y sin librerías.
 * Texto literal de cada autor y el criterio de selección a la vista (Ómnibus).
 */
export function ResenasGoogle({ datos }: { datos: Datos }) {
  const lista = useRef<HTMLUListElement>(null);
  const [extremos, setExtremos] = useState({ inicio: true, fin: false });

  const medir = useCallback(() => {
    const el = lista.current;
    if (!el) return;
    setExtremos({
      inicio: el.scrollLeft <= 4,
      fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      ro.disconnect();
    };
  }, [medir]);

  const mover = (sentido: 1 | -1) => {
    const el = lista.current;
    if (!el) return;
    const tarjeta = el.querySelector("li");
    const hueco = parseFloat(getComputedStyle(el).columnGap) || 16;
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + hueco : el.clientWidth * 0.8;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sentido * paso, behavior: suave ? "smooth" : "auto" });
  };

  // Si todas caben a la vez, las flechas sobran.
  const todoVisible = extremos.inicio && extremos.fin;
  const botonFlecha =
    "flex size-11 items-center justify-center rounded-full border border-white/12 bg-bg-panel text-text-strong transition-colors hover:border-neon/50 hover:text-neon disabled:cursor-default disabled:opacity-35 disabled:hover:border-white/12 disabled:hover:text-text-strong";

  return (
    <section
      aria-roledescription="carrusel"
      aria-labelledby="resenas-google-titulo"
      className="mt-[clamp(40px,6vw,64px)] space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 id="resenas-google-titulo" className="font-display text-[clamp(28px,4vw,40px)] leading-none text-text-strong">
            Lo que dicen en Google
          </h3>
          {datos.nota !== null && (
            <p className="mt-3 flex flex-wrap items-center gap-3 font-body text-sm text-text-muted">
              <span className="font-display text-3xl leading-none text-text-strong">{formatNota(datos.nota)}</span>
              {/* Las estrellas redondean (4,8 → 5): la etiqueta dice la nota real. */}
              <Estrellas n={Math.round(datos.nota)} label={`Nota media ${formatNota(datos.nota)} de 5`} />
              {datos.total !== null && <span>{datos.total} reseñas</span>}
            </p>
          )}
        </div>
        {!todoVisible && (
          <div className="flex gap-2">
            <button type="button" onClick={() => mover(-1)} disabled={extremos.inicio} aria-label="Reseña anterior" className={botonFlecha}>
              <Flecha dir="izq" />
            </button>
            <button type="button" onClick={() => mover(1)} disabled={extremos.fin} aria-label="Reseña siguiente" className={botonFlecha}>
              <Flecha dir="der" />
            </button>
          </div>
        )}
      </div>

      {/* tabIndex: con el foco en la lista, las flechas del teclado la desplazan. */}
      <ul
        ref={lista}
        tabIndex={0}
        aria-label="Reseñas"
        className="-mx-1 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-neon [&::-webkit-scrollbar]:hidden"
      >
        {datos.resenas.map((r, i) => {
          const mes = r.publicada ? formatMes(r.publicada) : null;
          return (
            <li
              key={`${r.autor}-${i}`}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${datos.resenas.length}`}
              className="flex shrink-0 basis-[85%] snap-start flex-col rounded-lg border border-white/8 bg-bg-panel p-5 shadow-soft sm:basis-[calc(50%-8px)] lg:basis-[calc((100%-32px)/3)]"
            >
              <div className="flex items-center gap-3">
                {r.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- la foto llega de nuestro proxy; next/image la optimizaría desde Google y el origen no está en remotePatterns.
                  <img src={r.avatar} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-full bg-bg-elevated object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-bg-elevated font-body font-bold text-text-strong">
                    {r.autor.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <span className="block truncate font-body text-[15px] font-semibold text-text-strong">{r.autor}</span>
                  {mes && r.publicada && (
                    <time dateTime={r.publicada} className="font-body text-xs text-text-muted">
                      {mes}
                    </time>
                  )}
                </div>
              </div>
              <Estrellas n={r.estrellas} className="mt-3" />
              {/* Texto literal del autor: sin recortar ni retocar (Directiva Ómnibus). */}
              <p className="mt-3 whitespace-pre-line font-body text-[14px] leading-relaxed text-text-body">{r.texto}</p>
            </li>
          );
        })}
      </ul>

      <p className="max-w-[70ch] font-body text-[13px] leading-relaxed text-text-muted">
        Reseñas publicadas por alumnos en nuestra ficha de Google, con el texto tal como lo escribieron. Mostramos
        hasta {MAX_RESENAS} de las más recientes que llevan comentario, sin filtrar por puntuación.
      </p>
    </section>
  );
}
