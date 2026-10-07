import { IconoPuntos } from "@/components/alumno/IconoPuntos";
import { formatPoints } from "@/lib/format";
import type { PointRule } from "@/types/database";

/**
 * Cómo se ganan puntos: una tarjeta por regla activa, de menos a más puntos
 * (a igualdad, el orden del panel).
 *
 * Lee `point_rules` (puntos, texto y tope), que es la misma fila que usa el
 * admin al dar puntos y el trigger del tope mensual: lo que se promete aquí y
 * lo que se paga no pueden separarse.
 */
export function ComoGanar({
  reglas,
  usosEsteMes,
}: {
  reglas: PointRule[];
  /** Apuntes de este mes por código de regla, solo para las que tienen tope. */
  usosEsteMes: Record<string, number>;
}) {
  if (reglas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-text-strong/15 p-5 font-body text-sm text-text-muted">
        Todavía no hay formas de ganar puntos publicadas.
      </p>
    );
  }

  // `sort` es estable: las reglas que empatan a puntos conservan su `orden`.
  const ordenadas = [...reglas].sort((a, b) => a.points - b.points);
  const hayRedes = reglas.some((r) => r.code === "story_instagram" || r.code === "reel_instagram");

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ordenadas.map((r) => {
          const usados = usosEsteMes[r.code] ?? 0;
          const lleno = r.monthly_limit !== null && usados >= r.monthly_limit;
          return (
            <li
              key={r.id}
              className="flex items-start gap-3 rounded-lg border border-text-strong/10 bg-bg-panel p-4"
            >
              <IconoPuntos name={r.icon ?? "estrella"} tono={lleno ? "muted" : "accent"} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-body text-[15px] font-bold leading-snug text-text-strong">
                    {r.label}
                  </h3>
                  <span className="shrink-0 font-body text-base font-bold text-accent tabular-nums">
                    +{formatPoints(r.points)}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 font-body text-[13px] leading-relaxed text-text-muted">
                    {r.description}
                  </p>
                )}
                {r.monthly_limit !== null && (
                  <p
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 font-body text-xs font-semibold ${
                      lleno ? "bg-warning/12 text-warning" : "bg-text-strong/6 text-text-body"
                    }`}
                  >
                    Máximo {r.monthly_limit} al mes · este mes llevas {usados}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {hayRedes && (
        <div className="mt-4 rounded-lg border border-accent/25 bg-accent/5 p-5">
          <h3 className="font-body text-[15px] font-bold text-text-strong">
            Para que cuenten tus stories y reels
          </h3>
          <ul className="mt-2.5 flex flex-col gap-2 font-body text-sm text-text-body">
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">✓</span>
              Tiene que ser contenido tuyo: lo grabas y lo publicas tú, en tu cuenta.
              Compartir o republicar lo que sube la cuenta de NEXUS no cuenta.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">✓</span>
              Desde una cuenta pública, etiquetando a @nexusvng. En los reels también
              puedes invitarnos como colaborador.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">✓</span>
              Marcada como colaboración (por ejemplo con #colaboración): si se publica a
              cambio de puntos, la ley lo considera publicidad.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">✓</span>
              Los reels tienen que seguir publicados al menos 7 días.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">✓</span>
              Enséñasela a tu profe o mándanos el enlace por WhatsApp y te sumamos los puntos.
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
