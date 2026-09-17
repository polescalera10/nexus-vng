"use client";

import { useOptimistic, useTransition } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { updatePaymentStatus } from "@/lib/actions/students";
import { PAYMENT_STATUS_LABELS } from "@/lib/format";
import type { PaymentStatus } from "@/types/database";

/**
 * Toggle rápido de cuota (lista y fichas). Optimista: cambia al instante
 * y revierte solo si la Server Action falla (RLS o red).
 */
export function PaymentToggle({
  studentId,
  studentName,
  status,
}: {
  studentId: string;
  studentName: string;
  status: PaymentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);

  function handleChange(checked: boolean) {
    const next: PaymentStatus = checked ? "al_dia" : "pendiente";
    startTransition(async () => {
      setOptimistic(next);
      const res = await updatePaymentStatus(studentId, next);
      if (!res.ok) console.error("[PaymentToggle]", res.message);
    });
  }

  const alDia = optimistic === "al_dia";

  return (
    <div className="flex items-center gap-2">
      <Toggle
        checked={alDia}
        onChange={handleChange}
        disabled={isPending}
        label={`Cuota de ${studentName}: ${PAYMENT_STATUS_LABELS[optimistic]}`}
      />
      <span
        className={`font-body text-xs font-semibold ${alDia ? "text-accent" : "text-danger"}`}
      >
        {PAYMENT_STATUS_LABELS[optimistic]}
      </span>
    </div>
  );
}
