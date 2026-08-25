"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { requestRedemption } from "@/lib/actions/gamificacion";
import { formatPoints } from "@/lib/format";
import type { Reward } from "@/types/database";

/**
 * Premios canjeables. El botón se desactiva sin saldo o sin unidades, pero la
 * comprobación de verdad la hace el trigger `reward_redemptions_apply` en la
 * base de datos: aquí solo se evita el clic inútil.
 */
export function RewardCatalog({
  rewards,
  balance,
}: {
  rewards: Reward[];
  balance: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; text: string } | null>(null);

  if (rewards.length === 0) {
    return (
      <p className="font-body text-sm text-text-muted">
        Todavía no hay premios publicados. Pronto habrá cosas que pedir con tus puntos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {mensaje && (
        <p
          role="status"
          className={`rounded-sm px-4 py-3 font-body text-sm ${
            mensaje.ok
              ? "border border-accent/30 bg-accent/10 text-accent"
              : "border border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {mensaje.text}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {rewards.map((r) => {
          const sinStock = r.stock !== null && r.stock < 1;
          const sinSaldo = balance < r.cost_points;
          const bloqueado = sinStock || sinSaldo || isPending;

          return (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-text-strong/10 bg-bg-panel p-4"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-body text-[15px] font-bold text-text-strong">
                  {r.name}
                </span>
                <Badge variant="success">{formatPoints(r.cost_points)} puntos</Badge>
                {sinStock && <Badge variant="neutral">Agotado</Badge>}
              </div>

              {r.description && (
                <p className="font-body text-[13px] text-text-muted">{r.description}</p>
              )}

              <button
                type="button"
                disabled={bloqueado}
                onClick={() =>
                  startTransition(async () => {
                    const res = await requestRedemption(r.id);
                    setMensaje({
                      ok: res.ok,
                      text:
                        res.message ??
                        (res.ok ? "Canje solicitado." : "No se ha podido canjear."),
                    });
                  })
                }
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 font-body text-sm font-bold text-ink transition-colors hover:bg-accent/85 disabled:pointer-events-none disabled:opacity-45"
              >
                {sinStock
                  ? "Agotado"
                  : sinSaldo
                    ? `Te faltan ${formatPoints(r.cost_points - balance)}`
                    : "Canjear"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
