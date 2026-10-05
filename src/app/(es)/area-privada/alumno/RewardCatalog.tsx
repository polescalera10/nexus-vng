"use client";

import { useRef, useState, useTransition } from "react";
import { BarraProgreso } from "@/components/alumno/BarraProgreso";
import { IconoPuntos } from "@/components/alumno/IconoPuntos";
import { requestRedemption } from "@/lib/actions/gamificacion";
import { formatPoints } from "@/lib/format";
import { progreso, REDEEM_LIMIT_LABELS } from "@/lib/puntos";
import type { Reward } from "@/types/database";

export type PremioDelCatalogo = Pick<
  Reward,
  "id" | "name" | "description" | "cost_points" | "icon" | "redeem_limit" | "stock"
> & {
  /** Fecha ya formateada hasta la que el tope lo bloquea, o null si se puede pedir. */
  bloqueadoHasta: string | null;
};

type Estado =
  | { fase: "confirmar"; premio: PremioDelCatalogo }
  | { fase: "hecho"; premio: PremioDelCatalogo; mensaje: string }
  | { fase: "error"; premio: PremioDelCatalogo; mensaje: string };

/**
 * Catálogo de premios con canje en dos pasos.
 *
 * El botón de cada tarjeta dice siempre por qué se puede o no se puede pedir
 * ("Te faltan 350", "Disponible el 5 ene 2027", "Agotado"), y al pulsarlo se
 * abre una confirmación con lo que cuesta y lo que queda: un canje descuenta
 * puntos al momento y no hay "deshacer" para el alumno.
 *
 * La comprobación de verdad (saldo, stock, tope) la hace el trigger
 * `reward_redemptions_apply` en la base de datos: aquí solo se evita el clic
 * inútil. El diálogo es un `<dialog>` nativo: foco atrapado y Escape gratis.
 */
export function RewardCatalog({
  premios,
  balance,
}: {
  premios: PremioDelCatalogo[];
  balance: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [isPending, startTransition] = useTransition();

  if (premios.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-text-strong/15 p-5 font-body text-sm text-text-muted">
        Todavía no hay premios publicados. Pronto habrá cosas que pedir con tus puntos.
      </p>
    );
  }

  function abrir(premio: PremioDelCatalogo) {
    setEstado({ fase: "confirmar", premio });
    dialogRef.current?.showModal();
  }

  function cerrar() {
    dialogRef.current?.close();
  }

  function confirmar(premio: PremioDelCatalogo) {
    startTransition(async () => {
      const res = await requestRedemption(premio.id);
      setEstado(
        res.ok
          ? {
              fase: "hecho",
              premio,
              mensaje: res.message ?? "Canje pedido. Te escribimos para dártelo.",
            }
          : { fase: "error", premio, mensaje: res.message ?? "No se ha podido canjear." },
      );
    });
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2">
        {premios.map((p) => {
          const agotado = p.stock !== null && p.stock < 1;
          const falta = p.cost_points - balance;
          const alcanza = falta <= 0;
          const pedible = alcanza && !agotado && !p.bloqueadoHasta;

          return (
            <li
              key={p.id}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${
                pedible
                  ? "border-accent/35 bg-accent/5"
                  : "border-text-strong/10 bg-bg-panel"
              }`}
            >
              <div className="flex items-start gap-3">
                <IconoPuntos
                  name={p.icon ?? "regalo"}
                  tono={p.icon === "corona" ? "lime" : pedible ? "accent" : "muted"}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-body text-[15px] font-bold leading-snug text-text-strong">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 font-body text-sm font-bold text-accent tabular-nums">
                    {formatPoints(p.cost_points)} puntos
                  </p>
                </div>
              </div>

              {p.description && (
                <p className="font-body text-[13px] leading-relaxed text-text-muted">
                  {p.description}
                </p>
              )}

              {(p.redeem_limit || p.stock !== null) && (
                <p className="flex flex-wrap gap-1.5">
                  {p.redeem_limit && (
                    <span className="rounded-full bg-text-strong/6 px-2.5 py-1 font-body text-xs font-semibold text-text-body">
                      {REDEEM_LIMIT_LABELS[p.redeem_limit]}
                    </span>
                  )}
                  {p.stock !== null && !agotado && (
                    <span className="rounded-full bg-text-strong/6 px-2.5 py-1 font-body text-xs font-semibold text-text-body">
                      Quedan {p.stock}
                    </span>
                  )}
                </p>
              )}

              {!alcanza && !agotado && (
                <BarraProgreso
                  grosor="sm"
                  valor={progreso(balance, p.cost_points)}
                  etiqueta={`Progreso hacia ${p.name}`}
                />
              )}

              <button
                type="button"
                disabled={!pedible || isPending}
                onClick={() => abrir(p)}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 font-body text-sm font-bold text-ink transition-colors hover:bg-accent/85 disabled:pointer-events-none disabled:bg-text-strong/8 disabled:text-text-muted"
              >
                {agotado
                  ? "Agotado"
                  : p.bloqueadoHasta
                    ? `Disponible el ${p.bloqueadoHasta}`
                    : !alcanza
                      ? `Te faltan ${formatPoints(falta)}`
                      : "Canjear"}
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby="canje-titulo"
        onClose={() => setEstado(null)}
        className="m-0 mt-auto w-full max-w-none rounded-t-lg border border-text-strong/10 bg-bg-panel p-0 text-text-body backdrop:bg-ink/75 sm:m-auto sm:max-w-md sm:rounded-lg"
      >
        {estado && (
          <div className="flex flex-col gap-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3">
              <IconoPuntos
                name={estado.premio.icon ?? "regalo"}
                size="lg"
                tono={estado.fase === "hecho" ? "lime" : "accent"}
              />
              <h2 id="canje-titulo" className="font-display text-2xl text-text-strong">
                {estado.fase === "hecho"
                  ? "¡Hecho!"
                  : estado.fase === "error"
                    ? "No ha podido ser"
                    : "¿Lo canjeas?"}
              </h2>
            </div>

            {estado.fase === "confirmar" && (
              <>
                <p className="font-body text-[15px] text-text-body">
                  Canjeas <strong className="text-text-strong">{estado.premio.name}</strong>{" "}
                  por{" "}
                  <strong className="text-text-strong">
                    {formatPoints(estado.premio.cost_points)} puntos
                  </strong>
                  . Te quedarán{" "}
                  <strong className="text-text-strong">
                    {formatPoints(balance - estado.premio.cost_points)}
                  </strong>
                  .
                </p>
                {estado.premio.description && (
                  <p className="font-body text-sm text-text-muted">
                    {estado.premio.description}
                  </p>
                )}
                {estado.premio.redeem_limit && (
                  <p className="font-body text-sm text-text-muted">
                    Este premio se puede pedir{" "}
                    {REDEEM_LIMIT_LABELS[estado.premio.redeem_limit].toLowerCase()}.
                  </p>
                )}
                <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cerrar}
                    disabled={isPending}
                    className="inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-5 font-body text-sm font-semibold text-text-body hover:bg-bg-elevated"
                  >
                    Ahora no
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmar(estado.premio)}
                    disabled={isPending}
                    className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 font-body text-sm font-bold text-ink hover:bg-accent/85 disabled:opacity-55"
                  >
                    {isPending ? "Canjeando…" : "Sí, canjear"}
                  </button>
                </div>
              </>
            )}

            {estado.fase !== "confirmar" && (
              <>
                <p
                  role="status"
                  className={`font-body text-[15px] ${
                    estado.fase === "hecho" ? "text-text-body" : "text-danger"
                  }`}
                >
                  {estado.mensaje}
                </p>
                <button
                  type="button"
                  onClick={cerrar}
                  className="mt-2 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 font-body text-sm font-bold text-ink hover:bg-accent/85"
                >
                  Entendido
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
