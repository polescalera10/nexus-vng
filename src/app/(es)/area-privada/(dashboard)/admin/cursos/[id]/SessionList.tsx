"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  assignSubstitute,
  deleteSession,
  generateSessions,
  updateSessionDate,
  updateSessionStatus,
} from "@/lib/actions/courses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, SESSION_STATUS_LABELS } from "@/lib/format";
import { currentMonthInMadrid, formatMonth } from "@/lib/sessions";
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
  // El mes se resuelve en el cliente solo para la etiqueta; la action vuelve a
  // calcularlo en el servidor, que es donde manda la zona de Madrid.
  const mes = formatMonth(currentMonthInMadrid());

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const res = await generateSessions(courseId);
            setMessage({
              ok: res.status === "success",
              text: res.message ?? "Error inesperado.",
            });
          });
        }}
      >
        Generar {mes}
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
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [fecha, setFecha] = useState(session.session_date);
  /** Texto del aviso cuando el borrado tiene datos que se perderían. */
  const [confirmarBorrado, setConfirmarBorrado] = useState<string | null>(null);

  const run = (fn: () => Promise<{ status: string; message?: string }>) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.status === "error") setError(res.message ?? "Error inesperado.");
    });
  };

  /**
   * Primer clic: la action se niega si hay lista o diario y devuelve qué se
   * perdería. Segundo clic (ya con el aviso en pantalla): borra de verdad.
   */
  const borrar = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteSession(session.id, confirmarBorrado !== null);
      if (res.status === "error") {
        if (res.usage) setConfirmarBorrado(res.message ?? "Confirma para borrarla.");
        else setError(res.message ?? "Error inesperado.");
      }
    });
  };

  const editable = session.status !== "impartida";

  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {editandoFecha ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`fecha-${session.id}`}>
              Nueva fecha de la sesión
            </label>
            <input
              id={`fecha-${session.id}`}
              type="date"
              value={fecha}
              disabled={pending}
              onChange={(e) => setFecha(e.target.value)}
              className="scheme-dark min-h-11 rounded-sm border border-text-strong/15 bg-bg-elevated px-3 py-2 font-body text-base text-text-strong focus-visible:outline-accent disabled:opacity-55 sm:min-h-9 sm:text-[13px]"
            />
            <Button
              variant="primary"
              size="sm"
              loading={pending}
              disabled={fecha === session.session_date}
              onClick={() =>
                run(async () => {
                  const res = await updateSessionDate(session.id, fecha);
                  if (res.status === "success") setEditandoFecha(false);
                  return res;
                })
              }
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFecha(session.session_date);
                setEditandoFecha(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditandoFecha(true)}
              title="Cambiar la fecha"
              className="rounded-sm font-body text-sm font-semibold text-text-strong underline decoration-text-strong/25 decoration-dotted underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              {formatDate(session.session_date)}
            </button>
            <Badge variant={STATUS_VARIANT[session.status]}>
              {SESSION_STATUS_LABELS[session.status]}
            </Badge>
          </>
        )}
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

        <Button
          variant="ghost"
          size="sm"
          loading={pending}
          className="text-text-faint hover:bg-danger/10 hover:text-danger"
          onClick={borrar}
        >
          {confirmarBorrado ? "Sí, borrar" : "Borrar"}
        </Button>

        {confirmarBorrado && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmarBorrado(null)}
          >
            No
          </Button>
        )}
      </div>

      {confirmarBorrado && (
        <p
          role="alert"
          className="rounded-sm border border-warning/30 bg-warning/10 px-3 py-2 font-body text-xs font-semibold text-warning"
        >
          {confirmarBorrado}
        </p>
      )}

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
