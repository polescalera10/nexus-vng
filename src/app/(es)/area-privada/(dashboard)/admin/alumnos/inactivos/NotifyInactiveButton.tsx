"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sendAlumnoInactivo } from "@/lib/actions/whatsapp-events";

/**
 * Botón "Avisar por WhatsApp" de la lista de inactivos. Encola el evento
 * `alumno_inactivo` (envío real vía n8n) y marca la fila como enviada.
 */
export function NotifyInactiveButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleClick() {
    if (!window.confirm(`¿Enviar aviso de WhatsApp a ${studentName}?`)) return;

    startTransition(async () => {
      const res = await sendAlumnoInactivo(studentId);
      if (res.ok) setSent(true);
      else window.alert(res.message ?? "No se ha podido enviar el aviso.");
    });
  }

  if (sent) return <Badge variant="success">Aviso enviado</Badge>;

  return (
    <Button variant="secondary" size="sm" loading={isPending} onClick={handleClick}>
      Avisar por WhatsApp
    </Button>
  );
}
