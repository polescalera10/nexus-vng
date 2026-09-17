"use client";

import { useState, useTransition } from "react";
import {
  promoteFromWaitlist,
  updateEnrollmentStatus,
} from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/Button";

/**
 * Botones de fila de matrícula (detalle de curso, solo admin):
 * baja y promoción desde lista de espera, con error inline.
 */

export function UnenrollButton({
  enrollmentId,
  studentName,
}: {
  enrollmentId: string;
  studentName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        loading={pending}
        className="text-danger hover:bg-danger/10"
        onClick={() => {
          if (!window.confirm(`¿Dar de baja a ${studentName} de este curso?`)) return;
          setError(null);
          startTransition(async () => {
            const res = await updateEnrollmentStatus(enrollmentId, "baja");
            if (res.status === "error") setError(res.message ?? "Error inesperado.");
          });
        }}
      >
        Baja
      </Button>
      {error && (
        <span role="alert" className="font-body text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </span>
  );
}

export function PromoteButton({ enrollmentId }: { enrollmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await promoteFromWaitlist(enrollmentId);
            if (res.status === "error") setError(res.message ?? "Error inesperado.");
          });
        }}
      >
        Pasar a activa
      </Button>
      {error && (
        <span role="alert" className="max-w-[32ch] text-right font-body text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
