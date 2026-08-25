import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getLeaderboard,
  getPointMilestones,
  getRedemptions,
} from "@/lib/queries/gamificacion";
import { formatDateTime, formatPoints } from "@/lib/format";
import { RedemptionActions } from "./RedemptionActions";

export const metadata = { title: "Gamificación · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Resumen de la gamificación: quién va ganando, qué canjes hay pendientes de
 * entregar y accesos al catálogo. Los puntos se dan desde la ficha de cada
 * alumno, que es donde se sabe a quién.
 */
export default async function GamificacionPage() {
  await requireRole("admin");

  const [ranking, pendientes, hitos] = await Promise.all([
    getLeaderboard(10),
    getRedemptions("solicitado"),
    getPointMilestones(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Gamificación
          </h1>
          <p className="mt-1 font-body text-sm text-text-muted">
            Puntos por venir a clase, fiestas y congresos; premios para canjearlos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/area-privada/admin/gamificacion/premios" size="sm">
            Premios
          </Button>
          <Button
            href="/area-privada/admin/gamificacion/reglas"
            size="sm"
            variant="secondary"
          >
            Reglas de puntos
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card
          title="Canjes pendientes"
          action={<Badge variant={pendientes.length > 0 ? "warning" : "neutral"}>
            {pendientes.length}
          </Badge>}
        >
          {pendientes.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Nada pendiente de entregar.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pendientes.map((r) => (
                <li
                  key={r.id}
                  className="border-b border-text-strong/8 pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-body text-sm font-bold text-text-strong">
                    {r.studentName ?? "Alumno eliminado"}
                  </p>
                  <p className="font-body text-[13px] text-text-muted">
                    {r.rewardName ?? "Premio eliminado"} · {formatPoints(r.cost_points)}{" "}
                    puntos · {formatDateTime(r.requested_at)}
                  </p>
                  <div className="mt-2">
                    <RedemptionActions id={r.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Ranking de puntos">
          {ranking.length === 0 ? (
            <EmptyState
              title="Todavía no hay puntos"
              description="Da puntos desde la ficha de cada alumno y el ranking se llena solo."
            />
          ) : (
            <ol className="flex flex-col gap-2">
              {ranking.map((row, i) => (
                <li
                  key={row.studentId}
                  className="flex items-center justify-between gap-3 font-body text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-5 shrink-0 text-text-muted">{i + 1}.</span>
                    <Link
                      href={`/area-privada/admin/alumnos/${row.studentId}`}
                      className="truncate font-semibold text-text-strong hover:text-accent"
                    >
                      {row.fullName}
                    </Link>
                  </span>
                  <span className="shrink-0 font-bold text-accent">
                    {formatPoints(row.balance)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title="Hitos que avisan por WhatsApp" className="mt-4">
        {hitos.length === 0 ? (
          <p className="font-body text-sm text-text-muted">Sin hitos configurados.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {hitos.map((h) => (
              <li key={h.id}>
                <Badge variant={h.active ? "success" : "neutral"}>
                  {formatPoints(h.points)} · {h.label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-body text-xs text-text-muted">
          Al cruzar un hito se encola un mensaje en WhatsApp (tipo “Hito de puntos”).
          Lo hace un trigger de la base de datos, así que también se dispara con los
          puntos que se den desde fuera del panel.
        </p>
      </Card>
    </>
  );
}
