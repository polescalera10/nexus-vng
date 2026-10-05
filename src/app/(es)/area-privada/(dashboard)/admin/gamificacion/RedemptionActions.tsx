"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveRedemption } from "@/lib/actions/gamificacion";

/**
 * Entregar o cancelar un canje. Cancelar devuelve los puntos (trigger de BD).
 *
 * Al resolverse, los botones se cambian al momento por el resultado y se pide
 * un `router.refresh()` explícito. No basta con el `revalidatePath` de la
 * acción: en la CI del 05-10-2026 el servidor devolvía la lista ya vacía y el
 * router no la pintaba, y Pol habría visto un "Entregado" que no hace nada.
 */
export function RedemptionActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<"entregado" | "cancelado" | null>(null);

  const base =
    "inline-flex min-h-11 items-center justify-center rounded-sm px-3 font-body text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55 sm:min-h-9";

  function resolve(status: "entregado" | "cancelado") {
    startTransition(async () => {
      const res = await resolveRedemption(id, status);
      if (!res.ok) {
        setError(res.message ?? "No se ha podido actualizar.");
        return;
      }
      setResuelto(status);
      router.refresh();
    });
  }

  if (resuelto) {
    return (
      <p role="status" className="font-body text-[13px] font-semibold text-text-muted">
        {resuelto === "entregado" ? "✓ Entregado" : "Cancelado: puntos devueltos"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => resolve("entregado")}
        className={`${base} bg-accent text-ink hover:bg-accent/85`}
      >
        Entregado
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => resolve("cancelado")}
        className={`${base} border border-text-strong/15 text-text-body hover:bg-bg-elevated`}
      >
        Cancelar
      </button>
      {error && (
        <span role="alert" className="font-body text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
