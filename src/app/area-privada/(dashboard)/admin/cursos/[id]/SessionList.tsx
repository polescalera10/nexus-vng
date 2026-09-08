"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  assignSubstitute,
  generateSessions,
  updateSessionStatus,
} from "@/lib/actions/courses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, SESSION_STATUS_LABELS } from "@/lib/format";
import type { SessionStatus } from "@/types/database";

/**
 * Sesiones del curso (admin): generación de las próximas semanas, cambio de
 * estado (programada ⇄ cancelada), asignación de profe sustituto y acceso a la
 * hoja de la sesión — donde se pasa lista y se cuelga el diario (0043).
 *
 * El enlace a la hoja está aquí porque hoy ninguna ficha de `teachers` tiene
 * usuario enlazado: sin él nadie podría subir un vídeo.
 */

export type SessionItem = {
  id: string;
  session_date: string;
  status: SessionStatus;
  substitute_teacher_id: string | null;
  substituteName: string | null;
};

type TeacherOption = { id: string; full_name: string };

const STATUS_VARIANT: Record<SessionStatus, "neutral" | "success" | "danger"> = {
  programada: "neutral",
  impartida: "success",
  cancelada: "danger",
};

export function GenerateSessionsButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const res = await generateSessions(courseId, 4);
            setMessage({
              ok: res.status === "success",
              text: res.message ?? "Error inesperado.",
            });
          });
        }}
      >
        Generar sesiones (4 semanas)
      </Button>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`max-w-[40ch] text-right font-body text-xs font-semibold ${
            message.ok ? "text-accent" : "text-danger"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

function SessionRow({
  session,
  substitutes,
}: {
  session: SessionItem;
  substitutes: TeacherOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ status: string; message?: string }>) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.status === "error") setError(res.message ?? "Error inesperado.");
    });
  };

  const editable = session.status !== "impartida";

  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-body text-sm font-semibold text-text-strong">
          {formatDate(session.session_date)}
        </span>
        <Badge variant={STATUS_VARIANT[session.status]}>
          {SESSION_STATUS_LABELS[session.status]}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={`/area-privada/profesor/asistencia/${session.id}`}
          className="font-body text-[13px] font-semibold text-accent hover:underline"
        >
          Lista y diario
        </Link>

        {editable ? (
          <>
            <label className="sr-only" htmlFor={`sub-${session.id}`}>
              Profe sustituto de la sesión del {formatDate(session.session_date)}
            </label>
            <select
              id={`sub-${session.id}`}
              value={session.substitute_teacher_id ?? ""}
              disabled={pending}
              onChange={(e) =>
                run(() => assignSubstitute(session.id, e.target.value || null))
              }
              className="scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-3 py-2 font-body text-[13px] text-text-strong focus-visible:outline-accent disabled:opacity-55"
            >
              <option value="">Sin sustituto</option>
              {substitutes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>

            {session.status === "programada" ? (
              <Button
                variant="ghost"
                size="sm"
                loading={pending}
                className="text-danger hover:bg-danger/10"
                onClick={() => run(() => updateSessionStatus(session.id, "cancelada"))}
              >
                Cancelar
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                loading={pending}
                onClick={() => run(() => updateSessionStatus(session.id, "programada"))}
              >
                Reprogramar
              </Button>
            )}
          </>
        ) : (
          session.substituteName && (
            <span className="font-body text-[13px] text-text-muted">
              Sustituyó: {session.substituteName}
            </span>
          )
        )}
      </div>

      {error && (
        <p role="alert" className="font-body text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </li>
  );
}

export function SessionList({
  sessions,
  substitutes,
}: {
  sessions: SessionItem[];
  substitutes: TeacherOption[];
}) {
  if (sessions.length === 0) {
    return (
      <p className="font-body text-sm text-text-muted">
        Sin sesiones todavía. Genera las próximas semanas con el botón de arriba.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-text-strong/6">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} substitutes={substitutes} />
      ))}
    </ul>
  );
}
