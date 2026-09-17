import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPointRules } from "@/lib/queries/gamificacion";
import { POINT_SOURCE_LABELS, formatPoints } from "@/lib/format";
import { PointRuleForm } from "./PointRuleForm";

export const metadata = { title: "Reglas de puntos · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Catálogo de motivos que dan puntos. No aplican nada por su cuenta: son los
 * atajos que salen al dar puntos desde la ficha de un alumno, para que dos
 * fiestas distintas no acaben valiendo 25 y 30 puntos por descuido.
 */
export default async function ReglasPuntosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");

  const sp = await searchParams;
  const editarId = Array.isArray(sp.editar) ? sp.editar[0] : sp.editar;

  const rules = await getPointRules();
  const editando = editarId ? rules.find((r) => r.id === editarId) : undefined;
  if (editarId && !editando) notFound();

  return (
    <>
      <Link
        href="/area-privada/admin/gamificacion"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Gamificación
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Reglas de puntos
      </h1>
      <p className="mt-2 max-w-[56ch] font-body text-base text-text-muted">
        Cuánto vale cada cosa. Son atajos para dar puntos con criterio; el apunte
        sigue haciéndolo una persona desde la ficha del alumno.
      </p>

      <Card
        title={editando ? `Editar “${editando.label}”` : "Nueva regla"}
        className="mt-8"
      >
        <PointRuleForm rule={editando} />
      </Card>

      <div className="mt-6">
        {rules.length === 0 ? (
          <EmptyState title="Sin reglas" description="Crea la primera arriba." />
        ) : (
          <ul className="divide-y divide-text-strong/8 rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
            {rules.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-4"
              >
                <span className="font-body text-[15px] font-bold text-text-strong">
                  {r.label}
                </span>
                <Badge variant={r.points >= 0 ? "success" : "danger"}>
                  {r.points >= 0 ? "+" : ""}
                  {formatPoints(r.points)}
                </Badge>
                <Badge>{POINT_SOURCE_LABELS[r.source]}</Badge>
                {!r.active && <Badge variant="neutral">Desactivada</Badge>}
                <code className="font-body text-xs text-text-muted">{r.code}</code>
                <Link
                  href={`/area-privada/admin/gamificacion/reglas?editar=${r.id}`}
                  className="ml-auto font-body text-[13px] font-semibold text-accent hover:underline"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
