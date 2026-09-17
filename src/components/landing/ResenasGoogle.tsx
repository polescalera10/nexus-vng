"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ResenasGoogle as Datos } from "@/lib/google-reviews";
import { MAX_RESENAS } from "@/lib/google-reviews";
import { BCP47, type Locale } from "@/i18n/locales";
import { tResenas } from "@/i18n/textos/comun";

type Textos = (typeof tResenas)["es"];

/** Cada cuánto avanza el carrusel solo. */
export const AUTOPLAY_MS = 6000;
/** Tras tocarlo (flechas, arrastre, rueda), cuánto espera antes de seguir solo. */
export const REANUDAR_MS = 10000;

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

export function formatNota(nota: number, locale: Locale = "es") {
  return nota.toLocaleString(BCP47[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "septiembre de 2026": estable aunque la página se regenere solo cada hora. */
function formatMes(iso: string, locale: Locale) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(BCP47[locale], { month: "long", year: "numeric", timeZone: "Europe/Madrid" });
}

function Icono({ tipo }: { tipo: "izq" | "der" | "pausa" | "play" }) {
  if (tipo === "pausa") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (tipo === "play") {
    return (
      <svg viewBox="0 0 24 24" className="ml-0.5 size-4" aria-hidden="true">
        <path d="M7 5v14l12-7z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d={tipo === "izq" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Lo que avanza el carrusel: una tarjeta más el hueco entre tarjetas. */
function pasoDe(el: HTMLElement): number {
  const tarjeta = el.querySelector("li");
  const hueco = parseFloat(getComputedStyle(el).columnGap) || 16;
  return tarjeta ? tarjeta.getBoundingClientRect().width + hueco : el.clientWidth * 0.8;
}

function prefiereMenosMovimiento() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Líneas visibles de cada reseña antes de "Leer más": fijan la altura de las tarjetas. */
export const LINEAS_VISIBLES = 6;

/**
 * Texto de una reseña con altura fija. Si no cabe, se corta a la vista con
 * "Leer más" y, al abrirlo, el texto completo se lee DENTRO de la tarjeta con
 * scroll: la tarjeta no crece y el carrusel no salta. El texto nunca se
 * recorta en el HTML: está entero, literal (Directiva Ómnibus); el corte es
 * solo visual.
 */
function TextoResena({
  texto,
  onAbrir,
  t,
}: {
  texto: string;
  onAbrir: (abierto: boolean) => void;
  t: Textos;
}) {
  const id = useId();
  const caja = useRef<HTMLParagraphElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [noCabe, setNoCabe] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      // Con el texto abierto no se mide: su altura ya es la del hueco.
      if (!el.classList.contains("line-clamp-none")) setNoCabe(el.scrollHeight > el.clientHeight + 1);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [texto]);

  // El aviso al carrusel va fuera del actualizador de estado: React puede
  // ejecutarlo dos veces y el contador de reseñas abiertas se descuadraría.
  const alternar = () => {
    const nuevo = !abierto;
    setAbierto(nuevo);
    onAbrir(nuevo);
  };

  return (
    <div className="mt-3 flex flex-1 flex-col">
      <p
        id={id}
        ref={caja}
        tabIndex={abierto ? 0 : undefined}
        style={{ height: `calc(1.625em * ${LINEAS_VISIBLES})` }}
        className={`whitespace-pre-line font-body text-[14px] leading-relaxed text-text-body ${
          abierto ? "line-clamp-none overflow-y-auto overscroll-contain pr-1" : `line-clamp-6 overflow-hidden`
        }`}
      >
        {texto}
      </p>
      {noCabe || abierto ? (
        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierto}
          aria-controls={id}
          className="mt-1 inline-flex min-h-11 items-center self-start font-body text-sm font-semibold text-neon hover:underline"
        >
          {abierto ? t.leerMenos : t.leerMas}
        </button>
      ) : (
        // Mismo hueco que el botón, para que todas las tarjetas midan igual.
        <span aria-hidden="true" className="mt-1 block min-h-11" />
      )}
    </div>
  );
}

/**
 * Carrusel de reseñas de la ficha de Google, ya pedidas en el servidor
 * (`lib/google-reviews.ts`) y pintadas en el HTML.
 *
 * Scroll nativo con `scroll-snap`, sin librerías: en móvil se desliza con el
 * dedo y en escritorio tiene flechas. Avanza solo (petición de Pol, 16-09-2026)
 * con las condiciones de WCAG 2.2.2 para contenido que se mueve solo:
 *   · botón de pausa/reproducir siempre visible;
 *   · se para con el ratón encima, con el foco dentro y al tocarlo, y retoma
 *     unos segundos después de soltarlo;
 *   · no se mueve fuera de pantalla, con la pestaña oculta ni con
 *     "reducir movimiento" activado en el sistema;
 *   · mientras avanza solo, los lectores de pantalla no anuncian cada cambio.
 * Texto literal de cada autor y el criterio de selección a la vista (Ómnibus).
 */
export function ResenasGoogle({ datos, locale = "es" }: { datos: Datos; locale?: Locale }) {
  const t = tResenas[locale];
  const bloque = useRef<HTMLElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [extremos, setExtremos] = useState({ inicio: true, fin: false });
  // Pausa elegida con el botón: manda sobre todo lo demás.
  const [pausado, setPausado] = useState(false);
  const [reducido, setReducido] = useState(false);
  const [enPantalla, setEnPantalla] = useState(false);
  const [encima, setEncima] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  // Reseñas abiertas con "Leer más": mientras alguien lee, no se mueve.
  const [abiertas, setAbiertas] = useState(0);
  const alAbrir = useCallback((abierto: boolean) => setAbiertas((n) => Math.max(0, n + (abierto ? 1 : -1))), []);
  // Momento del último gesto del usuario; el autoplay espera REANUDAR_MS.
  const ultimoGesto = useRef(0);
  // El propio autoplay también dispara `scroll`: no debe contar como gesto.
  const moviendoSolo = useRef(false);

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
    const sec = bloque.current;
    if (!el || !sec) return;
    medir();
    setReducido(prefiereMenosMovimiento());
    el.addEventListener("scroll", medir, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    const io = new IntersectionObserver((entries) => setEnPantalla(entries.some((e) => e.isIntersecting)), {
      threshold: 0.3,
    });
    io.observe(sec);
    return () => {
      el.removeEventListener("scroll", medir);
      ro.disconnect();
      io.disconnect();
    };
  }, [medir]);

  const mover = (sentido: 1 | -1, porUsuario = true) => {
    const el = lista.current;
    if (!el) return;
    if (porUsuario) ultimoGesto.current = Date.now();
    el.scrollBy({ left: sentido * pasoDe(el), behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
  };

  const todoVisible = extremos.inicio && extremos.fin;
  const autoplayActivo = !pausado && !reducido && !todoVisible && enPantalla && !encima && !conFoco && abiertas === 0;

  useEffect(() => {
    if (!autoplayActivo) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - ultimoGesto.current < REANUDAR_MS) return;
      const el = lista.current;
      if (!el) return;
      moviendoSolo.current = true;
      const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      // Al llegar al final vuelve al principio, en vez de quedarse parado.
      if (alFinal) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: pasoDe(el), behavior: "smooth" });
      window.setTimeout(() => (moviendoSolo.current = false), 900);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplayActivo]);

  const gesto = () => {
    if (!moviendoSolo.current) ultimoGesto.current = Date.now();
  };

  const botonRedondo =
    "flex size-11 items-center justify-center rounded-full border border-white/12 bg-bg-panel text-text-strong transition-colors hover:border-neon/50 hover:text-neon disabled:cursor-default disabled:opacity-35 disabled:hover:border-white/12 disabled:hover:text-text-strong";

  return (
    <section
      ref={bloque}
      aria-roledescription={t.carrusel}
      aria-labelledby="resenas-google-titulo"
      className="mt-[clamp(40px,6vw,64px)] space-y-6"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={(e) => {
        // Solo el foco de teclado pausa: con el ratón, pulsar una flecha deja
        // el foco en el botón y el carrusel ya no volvería a moverse solo.
        let deTeclado = true;
        try {
          deTeclado = (e.target as HTMLElement).matches(":focus-visible");
        } catch {
          // Navegadores sin :focus-visible: se pausa, que es lo prudente.
        }
        if (deTeclado) setConFoco(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setConFoco(false);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 id="resenas-google-titulo" className="font-display text-[clamp(28px,4vw,40px)] leading-none text-text-strong">
            {t.titulo}
          </h3>
          {datos.nota !== null && (
            <p className="mt-3 flex flex-wrap items-center gap-3 font-body text-sm text-text-muted">
              <span className="font-display text-3xl leading-none text-text-strong">{formatNota(datos.nota, locale)}</span>
              {/* Las estrellas redondean (4,8 → 5): la etiqueta dice la nota real. */}
              <Estrellas n={Math.round(datos.nota)} label={t.notaMedia(formatNota(datos.nota, locale))} />
              {datos.total !== null && <span>{t.total(datos.total)}</span>}
            </p>
          )}
        </div>
        {!todoVisible && (
          <div className="flex gap-2">
            {!reducido && (
              <button
                type="button"
                onClick={() => setPausado((p) => !p)}
                aria-pressed={pausado}
                aria-label={pausado ? t.reanudar : t.pausar}
                className={botonRedondo}
              >
                <Icono tipo={pausado ? "play" : "pausa"} />
              </button>
            )}
            <button type="button" onClick={() => mover(-1)} disabled={extremos.inicio} aria-label={t.anterior} className={botonRedondo}>
              <Icono tipo="izq" />
            </button>
            <button type="button" onClick={() => mover(1)} disabled={extremos.fin} aria-label={t.siguiente} className={botonRedondo}>
              <Icono tipo="der" />
            </button>
          </div>
        )}
      </div>

      {/* tabIndex: con el foco en la lista, las flechas del teclado la desplazan. */}
      <ul
        ref={lista}
        tabIndex={0}
        aria-label={t.lista}
        aria-live={autoplayActivo ? "off" : "polite"}
        onPointerDown={gesto}
        onWheel={gesto}
        onTouchStart={gesto}
        className="-mx-1 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-neon [&::-webkit-scrollbar]:hidden"
      >
        {datos.resenas.map((r, i) => {
          const mes = r.publicada ? formatMes(r.publicada, locale) : null;
          return (
            <li
              key={`${r.autor}-${i}`}
              aria-roledescription={t.diapositiva}
              aria-label={t.posicion(i + 1, datos.resenas.length)}
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
              <Estrellas n={r.estrellas} className="mt-3" label={t.estrellas(r.estrellas)} />
              {/* Texto literal del autor: sin recortar ni retocar (Directiva Ómnibus). */}
              <TextoResena texto={r.texto} onAbrir={alAbrir} t={t} />
            </li>
          );
        })}
      </ul>

      <p className="max-w-[70ch] font-body text-[13px] leading-relaxed text-text-muted">
        {t.aviso(MAX_RESENAS)}
      </p>
    </section>
  );
}
