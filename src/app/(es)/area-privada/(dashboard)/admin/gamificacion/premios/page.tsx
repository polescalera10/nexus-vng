import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getRewards } from "@/lib/queries/gamificacion";
import { formatPoints } from "@/lib/format";
import { RewardForm } from "./RewardForm";

export const metadata = { title: "Premios · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Catálogo de premios. La edición se hace en el mismo formulario de alta
 * (`?editar=<id>`): son cuatro campos y abrir una pantalla aparte para eso
 * añade un paso sin ganar nada.
 */
export default async function PremiosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");

  const sp = await searchParams;
  const editarId = Array.isArray(sp.editar) ? sp.editar[0] : sp.editar;

  const rewards = await getRewards();
  const editando = editarId ? rewards.find((r) => r.id === editarId) : undefined;
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
        Premios
      </h1>
      <p className="mt-2 max-w-[52ch] font-body text-base text-text-muted">
        Lo que los alumnos pueden pedir con sus puntos desde su área privada.
      </p>

      <Card title={editando ? `Editar “${editando.name}”` : "Nuevo premio"} className="mt-8">
        <RewardForm reward={editando} />
      </Card>

      <div className="mt-6">
        {rewards.length === 0 ? (
          <EmptyState
            title="Sin premios todavía"
            description="Crea el primero arriba: una camiseta, una clase gratis, una entrada a la fiesta…"
          />
        ) : (
          <ul className="divide-y divide-text-strong/8 rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
            {rewards.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-4">
                <span className="font-body text-[15px] font-bold text-text-strong">
                  {r.name}
                </span>
                <Badge variant="success">{formatPoints(r.cost_points)} puntos</Badge>
                {!r.active && <Badge variant="neutral">Retirado</Badge>}
                <span className="font-body text-[13px] text-text-muted">
                  {r.stock === null ? "Sin límite de unidades" : `${r.stock} disponibles`}
                </span>
                <Link
                  href={`/area-privada/admin/gamificacion/premios?editar=${r.id}`}
                  className="ml-auto font-body text-[13px] font-semibold text-accent hover:underline"
                >
                  Editar
                </Link>
                {r.description && (
                  <p className="w-full font-body text-[13px] text-text-muted">
                    {r.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
