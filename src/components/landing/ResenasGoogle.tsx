"use client";

import { useEffect, useRef, useState } from "react";
import { Roboto } from "next/font/google";
import type { ResenasGoogle as Datos } from "@/lib/google-reviews";

/*
  La atribución "Google Maps" tiene que ir en Roboto (condiciones de Places).
  next/font la sirve desde nuestro dominio: no hay petición a Google Fonts.
*/
const roboto = Roboto({ subsets: ["latin"], weight: "400", display: "swap" });

type Estado = { fase: "esperando" } | { fase: "cargando" } | { fase: "vacio" } | { fase: "listo"; datos: Datos };

function Estrellas({ n, className = "", label }: { n: number; className?: string; label?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={label ?? `${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`size-4 ${i <= n ? "text-neon-lime" : "text-white/20"}`} aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
          />
        </svg>
      ))}
    </span>
  );
}

function formatNota(nota: number) {
  return nota.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Reseñas de Google, pedidas a `/api/resenas` cuando el bloque está a punto de
 * entrar en pantalla: así solo se paga una llamada a Places por quien llega
 * hasta aquí. Sin reseñas (sin clave, cuota agotada o error), no se pinta nada.
 */
export function ResenasGoogle() {
  const contenedor = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>({ fase: "esperando" });

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    let cancelado = false;

    const cargar = async () => {
      setEstado({ fase: "cargando" });
      try {
        const res = await fetch("/api/resenas", { cache: "no-store" });
        if (cancelado) return;
        if (res.status !== 200) return setEstado({ fase: "vacio" });
        setEstado({ fase: "listo", datos: (await res.json()) as Datos });
      } catch {
        if (!cancelado) setEstado({ fase: "vacio" });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void cargar();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => {
      cancelado = true;
      observer.disconnect();
    };
  }, []);

  if (estado.fase === "vacio") return null;

  return (
    <div ref={contenedor} aria-live="polite" className="mt-[clamp(40px,6vw,64px)]">
      {estado.fase !== "listo" ? (
        // Hueco reservado mientras llega la respuesta, para no empujar la página.
        <div className="min-h-24" aria-hidden="true" />
      ) : (
        <Bloque datos={estado.datos} />
      )}
    </div>
  );
}

function Bloque({ datos }: { datos: Datos }) {
  return (
    <section aria-labelledby="resenas-google-titulo" className="space-y-6">
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
        <a
          href={datos.fichaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-neon no-underline hover:underline"
        >
          Ver todas en Google Maps
        </a>
      </div>

      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4 p-0">
        {datos.resenas.map((r, i) => (
          <li key={`${r.autor}-${i}`} className="flex flex-col rounded-lg border border-white/8 bg-bg-panel p-5 shadow-soft">
            <div className="flex items-center gap-3">
              {r.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- la foto llega de nuestro proxy sin caché; next/image la guardaría, y Places no lo permite.
                <img src={r.avatar} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-full bg-bg-elevated object-cover" />
              ) : (
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-bg-elevated font-body font-bold text-text-strong">
                  {r.autor.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                {r.autorUrl ? (
                  <a
                    href={r.autorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-body text-[15px] font-semibold text-text-strong no-underline hover:text-neon"
                  >
                    {r.autor}
                  </a>
                ) : (
                  <span className="block truncate font-body text-[15px] font-semibold text-text-strong">{r.autor}</span>
                )}
                {r.cuando && (
                  <time dateTime={r.publicada ?? undefined} className="font-body text-xs text-text-muted">
                    {r.cuando}
                  </time>
                )}
              </div>
            </div>
            <Estrellas n={r.estrellas} className="mt-3" />
            {/* Texto literal del autor: sin recortar ni retocar (Directiva Ómnibus). */}
            <p className="mt-3 whitespace-pre-line font-body text-[14px] leading-relaxed text-text-body">{r.texto}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <p className="max-w-[62ch] font-body text-[13px] leading-relaxed text-text-muted">
          Reseñas publicadas por alumnos en nuestra ficha de Google. Google muestra aquí hasta cinco, las que
          considera más relevantes; el resto está en Google Maps.
        </p>
        <span className={`${roboto.className} text-[12px] text-text-muted`}>Google Maps</span>
      </div>
    </section>
  );
}
