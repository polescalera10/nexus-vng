"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { quickConvertLead } from "@/lib/actions/lead-conversion";
import { updateLeadEstado } from "@/lib/actions/leads";
import { LEAD_ESTADO_LABELS, LEAD_ORIGEN_LABELS, formatRelative } from "@/lib/format";
import { buildLeadWaLink } from "@/lib/whatsapp";
import type { EnrollmentRole, Lead, LeadEstado } from "@/types/database";

/**
 * Fila de lead con acciones rápidas: responder por WhatsApp (con el mensaje ya
 * escrito) y mover el estado en un toque. Optimista — revierte si la Server
 * Action falla (RLS o red).
 */

const ESTADO_VARIANT: Record<LeadEstado, "neutral" | "success" | "warning" | "danger"> = {
  nuevo: "warning",
  contactado: "neutral",
  prueba_agendada: "success",
  convertido: "success",
  descartado: "danger",
};

/** Siguiente paso natural del embudo desde cada estado. */
const NEXT_ACTIONS: Record<LeadEstado, LeadEstado[]> = {
  nuevo: ["contactado", "prueba_agendada", "descartado"],
  contactado: ["prueba_agendada", "convertido", "descartado"],
  prueba_agendada: ["convertido", "descartado"],
  convertido: ["contactado"],
  descartado: ["nuevo"],
};

export function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useOptimistic(lead.estado);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [askingRole, setAskingRole] = useState(false);

  function move(next: LeadEstado) {
    startTransition(async () => {
      setEstado(next);
      const res = await updateLeadEstado(lead.id, next);
      if (!res.ok) console.error("[LeadCard]", res.message);
    });
  }

  /**
   * Dos clics y está: uno para convertir, otro para decir con qué rol baila.
   * El rol es el único dato que el formulario público nunca preguntó y
   * `enrollments.role_in_course` no admite nulos, así que sin él no se puede
   * matricular en las clases que pidió — que es el motivo por el que escribió.
   *
   * Solo se cae a la pantalla de conversión cuando falta algo que hay que
   * escribir a mano (teléfono raro, email ya usado).
   */
  function convert(role: EnrollmentRole) {
    setConvertError(null);
    startTransition(async () => {
      const res = await quickConvertLead(lead.id, role);
      if (res.ok) {
        router.push(`/area-privada/admin/alumnos/${res.studentId}${res.query}`);
        return;
      }
      console.error("[LeadCard] convertir:", res.message);
      if (res.needsForm) {
        router.push(`/area-privada/admin/leads/${lead.id}/convertir`);
        return;
      }
      setAskingRole(false);
      setConvertError(res.message);
    });
  }

  const waHref = buildLeadWaLink(lead.telefono, lead.nombre);
  const meta = [
    LEAD_ORIGEN_LABELS[lead.origen] ?? lead.origen,
    lead.modalidad_interes,
    lead.intereses?.length ? lead.intereses.join(", ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const action =
    "inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-3 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated disabled:pointer-events-none disabled:opacity-55 sm:min-h-9";
  const convertAction =
    "inline-flex min-h-11 items-center justify-center rounded-sm border border-accent/50 px-3 font-body text-[13px] font-semibold text-accent transition-colors hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-55 sm:min-h-9";

  return (
    <li className="px-4 py-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-body text-[15px] font-bold text-text-strong">
          {lead.nombre}
        </span>
        <Badge variant={ESTADO_VARIANT[estado]}>{LEAD_ESTADO_LABELS[estado]}</Badge>
        <time
          dateTime={lead.created_at}
          className="ml-auto font-body text-xs text-text-muted"
        >
          {formatRelative(lead.created_at)}
        </time>
      </div>

      {/* Contacto a la vista: teléfono y email pulsables sin abrir la ficha. */}
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-[13px] text-text-body">
        <a href={`tel:${lead.telefono.replace(/\s/g, "")}`} className="hover:underline">
          {lead.telefono}
        </a>
        {lead.email ? (
          <>
            <span aria-hidden="true" className="text-text-muted">
              ·
            </span>
            <a href={`mailto:${lead.email}`} className="break-all hover:underline">
              {lead.email}
            </a>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="text-text-muted">
              ·
            </span>
            <span className="text-text-muted">sin email</span>
          </>
        )}
      </p>

      {meta && <p className="mt-1 font-body text-[13px] text-text-muted">{meta}</p>}
      {lead.mensaje && (
        <p className="mt-1.5 font-body text-sm text-text-body">“{lead.mensaje}”</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-3.5 font-body text-[13px] font-bold text-ink transition-colors hover:bg-accent/85 sm:min-h-9"
          >
            WhatsApp
          </a>
        ) : (
          <span className="font-body text-[13px] text-text-muted">
            Teléfono no válido: {lead.telefono}
          </span>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className={action}>
            Email
          </a>
        )}
        {/* Aceptarlo como alumno: evita recopiar nombre, teléfono y email. */}
        {lead.student_id ? (
          <Link href={`/area-privada/admin/alumnos/${lead.student_id}`} className={action}>
            Ver alumno
          </Link>
        ) : askingRole ? (
          <>
            <span className="inline-flex min-h-11 items-center font-body text-[13px] text-text-muted sm:min-h-9">
              Baila como
            </span>
            <button type="button" onClick={() => convert("leader")} disabled={isPending} className={convertAction}>
              Leader
            </button>
            <button type="button" onClick={() => convert("follower")} disabled={isPending} className={convertAction}>
              Follower
            </button>
            <button
              type="button"
              onClick={() => setAskingRole(false)}
              disabled={isPending}
              className={action}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setAskingRole(true)} className={convertAction}>
            Convertir a alumno
          </button>
        )}
        {NEXT_ACTIONS[estado].map((next) => (
          <button
            key={next}
            type="button"
            onClick={() => move(next)}
            disabled={isPending}
            className={action}
          >
            {LEAD_ESTADO_LABELS[next]}
          </button>
        ))}
      </div>

      {convertError && (
        <p
          role="alert"
          className="mt-2 font-body text-[13px] text-danger"
        >
          {convertError}
        </p>
      )}
    </li>
  );
}
