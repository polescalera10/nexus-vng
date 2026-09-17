import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, formatPoints, formatRelative } from "@/lib/format";
import type { RedemptionListItem } from "@/lib/queries/gamificacion";
import { RedemptionActions } from "../gamificacion/RedemptionActions";

/**
 * Notificaciones del admin: lo que alguien ha pedido y espera respuesta.
 *
 * De momento, canjes de premios. Un canje pedido ya ha descontado los puntos
 * del alumno (el trigger `reward_redemptions_apply` de la 0027), así que hay
 * alguien esperando su premio desde el momento en que aparece aquí: si esto
 * solo se viera entrando a Gamificación, se quedaría sin ver durante días.
 *
 * Se resuelve desde aquí mismo, con los mismos botones del módulo, para no
 * obligar a navegar a otra pantalla para dar un "Entregado".
 */
export function Notificaciones({ canjes }: { canjes: RedemptionListItem[] }) {
  const hay = canjes.length > 0;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2 font-body text-[15px] font-bold text-text-strong">
          Notificaciones
          {hay && <Badge variant="warning">{canjes.length}</Badge>}
        </h2>
        <Link
          href="/area-privada/admin/gamificacion"
          className="font-body text-[13px] font-semibold text-accent hover:underline"
        >
          Gamificación
        </Link>
      </div>

      {!hay ? (
        <p className="rounded-lg border border-text-strong/8 bg-bg-panel px-5 py-4 font-body text-sm text-text-muted shadow-soft">
          Nada pendiente. Aquí aparecerán los premios que pidan los alumnos.
        </p>
      ) : (
        <ul className="divide-y divide-text-strong/8 rounded-lg border border-warning/30 bg-warning/8 shadow-soft">
          {canjes.map((r) => (
            <li key={r.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="font-body text-sm text-text-strong">
                    <strong className="font-bold">
                      {r.studentName ?? "Alumno eliminado"}
                    </strong>{" "}
                    ha pedido{" "}
                    <strong className="font-bold">
                      {r.rewardName ?? "un premio eliminado"}
                    </strong>
                  </p>
                  <p className="mt-0.5 font-body text-[13px] text-text-muted">
                    {formatPoints(r.cost_points)} puntos ·{" "}
                    <time dateTime={r.requested_at} title={formatDateTime(r.requested_at)}>
                      {formatRelative(r.requested_at)}
                    </time>
                  </p>
                </div>
                <RedemptionActions id={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
