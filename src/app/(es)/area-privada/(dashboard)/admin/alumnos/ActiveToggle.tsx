"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setStudentActive } from "@/lib/actions/students";

/** Dar de baja / reactivar con confirmación (baja lógica, sin borrado). */
export function ActiveToggle({
  studentId,
  studentName,
  active,
}: {
  studentId: string;
  studentName: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const message = active
      ? `¿Dar de baja a ${studentName}? Su ficha y su histórico se conservan.`
      : `¿Reactivar a ${studentName}?`;
    if (!window.confirm(message)) return;

    startTransition(async () => {
      const res = await setStudentActive(studentId, !active);
      if (!res.ok) window.alert(res.message ?? "No se ha podido actualizar.");
    });
  }

  return (
    <Button
      variant={active ? "danger" : "secondary"}
      loading={isPending}
      onClick={handleClick}
    >
      {active ? "Dar de baja" : "Reactivar"}
    </Button>
  );
}
