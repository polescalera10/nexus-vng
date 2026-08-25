"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { deleteEvento, toggleEventoPublico } from "@/lib/actions/eventos";

/**
 * Publicar/despublicar y borrar desde el listado.
 * El borrado pide confirmación porque es el único destructivo del panel: un
 * evento no se "desactiva", desaparece.
 */
export function EventoRowActions({
  id,
  titulo,
  publico,
}: {
  id: string;
  titulo: string;
  publico: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useOptimistic(publico);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action =
    "inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-3 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated disabled:pointer-events-none disabled:opacity-55 sm:min-h-9";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        className={action}
        onClick={() =>
          startTransition(async () => {
            setVisible(!visible);
            const res = await toggleEventoPublico(id, !visible);
            if (!res.ok) setError(res.message ?? "No se ha podido actualizar.");
          })
        }
      >
        {visible ? "Despublicar" : "Publicar"}
      </button>

      {confirmando ? (
        <>
          <button
            type="button"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-danger px-3 font-body text-[13px] font-bold text-ink sm:min-h-9"
            onClick={() =>
              startTransition(async () => {
                const res = await deleteEvento(id);
                if (!res.ok) {
                  setError(res.message ?? "No se ha podido borrar.");
                  setConfirmando(false);
                  return;
                }
                router.refresh();
              })
            }
          >
            Borrar «{titulo}»
          </button>
          <button
            type="button"
            className={action}
            onClick={() => setConfirmando(false)}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={isPending}
          className={action}
          onClick={() => setConfirmando(true)}
        >
          Borrar
        </button>
      )}

      {error && (
        <span role="alert" className="font-body text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
