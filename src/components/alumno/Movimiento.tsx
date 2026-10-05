import { IconoPuntos } from "@/components/alumno/IconoPuntos";
import { formatDate, formatPoints } from "@/lib/format";
import type { IconoPuntos as IconoNombre, PointEvent } from "@/types/database";

/**
 * Una fila del historial de puntos del alumno: icono, qué fue, cuándo y
 * cuánto. Lo que suma va en el color de acento; lo que resta, apagado y con
 * signo menos de verdad (−), para que se lea a la primera.
 */
export function Movimiento({
  event,
  icon,
}: {
  event: Pick<PointEvent, "id" | "points" | "concept" | "occurred_on" | "source">;
  icon: IconoNombre;
}) {
  const suma = event.points > 0;
  return (
    <li className="flex items-center gap-3 py-3">
      <IconoPuntos name={icon} size="sm" tono={suma ? "accent" : "muted"} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-body text-sm font-semibold text-text-strong">
          {event.concept}
        </span>
        <span className="block font-body text-xs text-text-muted">
          {formatDate(event.occurred_on)}
          {event.source === "canje" && " · Canje"}
        </span>
      </span>
      <span
        className={`shrink-0 font-body text-[15px] font-bold tabular-nums ${
          suma ? "text-accent" : "text-text-muted"
        }`}
      >
        {suma ? "+" : "−"}
        {formatPoints(Math.abs(event.points))}
      </span>
    </li>
  );
}
