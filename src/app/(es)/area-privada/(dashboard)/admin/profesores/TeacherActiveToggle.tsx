"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleTeacherActive } from "@/lib/actions/teachers";

/**
 * Baja/reactivación del profesor con confirmación (sin borrado físico:
 * solo alterna `active`).
 */
export function TeacherActiveToggle({
  id,
  active,
  name,
}: {
  id: string;
  active: boolean;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    const message = active
      ? `¿Dar de baja a ${name}? Dejará de aparecer como profesor activo, pero se conserva su historial.`
      : `¿Reactivar a ${name}?`;
    if (!window.confirm(message)) return;

    startTransition(async () => {
      const result = await toggleTeacherActive(id, !active);
      setError(result.status === "error" ? (result.message ?? "Error inesperado.") : null);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant={active ? "danger" : "secondary"}
        size="sm"
        loading={pending}
        onClick={handleClick}
      >
        {active ? "Dar de baja" : "Reactivar"}
      </Button>
      {error && <p className="font-body text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
