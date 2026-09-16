import type { ResenasGoogle as Datos } from "@/lib/google-reviews";
import { MAX_RESENAS } from "@/lib/google-reviews";
import { site } from "@/lib/site";

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

/** "septiembre de 2026": estable aunque la página se regenere solo cada hora. */
function formatMes(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "Europe/Madrid" });
}

/**
 * Reseñas de la ficha de Google, ya pedidas en el servidor
 * (`lib/google-reviews.ts`). Texto literal de cada autor, con su nombre, foto y
 * enlace a su perfil, y el criterio de selección a la vista (Ómnibus).
 */
export function ResenasGoogle({ datos }: { datos: Datos }) {
  return (
    <section aria-labelledby="resenas-google-titulo" className="mt-[clamp(40px,6vw,64px)] space-y-6">
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
        <div className="flex flex-wrap gap-x-5">
          <a
            href={datos.fichaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-neon no-underline hover:underline"
          >
            Ver todas en Google Maps
          </a>
          <a
            href={site.google.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-text-muted no-underline hover:text-neon hover:underline"
          >
            Escribir una reseña
          </a>
        </div>
      </div>

      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4 p-0">
        {datos.resenas.map((r, i) => {
          const mes = r.publicada ? formatMes(r.publicada) : null;
          return (
            <li key={`${r.autor}-${i}`} className="flex flex-col rounded-lg border border-white/8 bg-bg-panel p-5 shadow-soft">
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

      <p className="max-w-[70ch] border-t border-white/8 pt-4 font-body text-[13px] leading-relaxed text-text-muted">
        Reseñas publicadas por alumnos en nuestra ficha de Google. Mostramos las {MAX_RESENAS} más recientes, sin
        filtrar por puntuación; todas las demás están en Google Maps.
      </p>
    </section>
  );
}
