"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  sendBroadcast,
  type BroadcastFormState,
} from "@/lib/actions/whatsapp-events";

const initialState: BroadcastFormState = { status: "idle" };

type AudienceOption = { id: string; recipients: number };

/**
 * Composer de broadcast: curso concreto O nivel concreto + mensaje libre.
 * Muestra el nº de destinatarios de la opción elegida y pide confirmación
 * antes de enviar. El envío real lo hace n8n (esto solo encola el evento).
 */
export function BroadcastForm({
  courses,
  niveles,
}: {
  courses: (AudienceOption & { name: string })[];
  niveles: (AudienceOption & { nombre: string })[];
}) {
  const [state, formAction, pending] = useActionState(sendBroadcast, initialState);
  const [target, setTarget] = useState<"curso" | "nivel">("curso");
  const [courseId, setCourseId] = useState("");
  const [nivelId, setNivelId] = useState("");

  const selected =
    target === "curso"
      ? courses.find((c) => c.id === courseId)
      : niveles.find((n) => n.id === nivelId);
  const recipients = selected?.recipients ?? null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const n = recipients ?? 0;
    const ok = window.confirm(
      `¿Enviar el mensaje a ${n} ${n === 1 ? "destinatario" : "destinatarios"}?`,
    );
    if (!ok) e.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="grid gap-4">
      <Select
        label="Destino"
        name="target"
        value={target}
        onChange={(e) => setTarget(e.target.value === "nivel" ? "nivel" : "curso")}
      >
        <option value="curso">Un curso</option>
        <option value="nivel">Un nivel</option>
      </Select>

      {target === "curso" ? (
        <Select
          label="Curso"
          name="course_id"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          error={state.errors?.course_id?.[0]}
        >
          <option value="">Elige un curso…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.recipients})
            </option>
          ))}
        </Select>
      ) : (
        <Select
          label="Nivel"
          name="nivel_id"
          value={nivelId}
          onChange={(e) => setNivelId(e.target.value)}
          error={state.errors?.nivel_id?.[0]}
        >
          <option value="">Elige un nivel…</option>
          {niveles.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nombre} ({n.recipients})
            </option>
          ))}
        </Select>
      )}

      <Textarea
        label="Mensaje"
        name="message"
        rows={4}
        maxLength={1000}
        placeholder="Escribe el mensaje que recibirán por WhatsApp…"
        error={state.errors?.message?.[0]}
      />

      {state.status === "success" && state.message && (
        <p className="font-body text-sm font-semibold text-accent">{state.message}</p>
      )}
      {state.status === "error" && state.message && (
        <p className="font-body text-sm font-semibold text-danger">{state.message}</p>
      )}

      <div>
        <Button
          type="submit"
          loading={pending}
          disabled={recipients === null || recipients === 0}
        >
          {recipients === null
            ? "Enviar mensaje"
            : recipients === 0
              ? "Sin destinatarios"
              : `Enviar a ${recipients} ${recipients === 1 ? "destinatario" : "destinatarios"}`}
        </Button>
      </div>
    </form>
  );
}
