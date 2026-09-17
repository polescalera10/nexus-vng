"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  addPointEvent,
  deletePointEvent,
  type GamificacionFormState,
} from "@/lib/actions/gamificacion";
import { POINT_SOURCE_LABELS, formatDate, formatPoints, todayInMadrid } from "@/lib/format";
import type { PointEvent, PointRule } from "@/types/database";

const initial: GamificacionFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Dar puntos
    </Button>
  );
}

/**
 * Puntos de un alumno: saldo, alta rápida y últimos movimientos.
 *
 * Elegir una regla del catálogo rellena puntos y concepto, pero ambos siguen
 * siendo editables: el caso "hoy la fiesta vale el doble" es lo bastante normal
 * como para no obligar a crear una regla nueva.
 */
export function PuntosPanel({
  studentId,
  balance,
  events,
  rules,
}: {
  studentId: string;
  balance: number;
  events: PointEvent[];
  rules: PointRule[];
}) {
  const [state, formAction] = useActionState(addPointEvent, initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ruleCode, setRuleCode] = useState("");
  const [points, setPoints] = useState("10");
  const [concept, setConcept] = useState("");
  const [source, setSource] = useState("manual");

  const err = (field: string) => state.errors?.[field]?.[0];

  function aplicarRegla(code: string) {
    setRuleCode(code);
    const rule = rules.find((r) => r.code === code);
    if (!rule) return;
    setPoints(String(rule.points));
    setConcept(rule.label);
    setSource(rule.source);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-display text-4xl text-accent">{formatPoints(balance)}</p>
        <p className="mt-1 font-body text-sm text-text-muted">
          puntos disponibles para canjear
        </p>
      </div>

      <form action={formAction} noValidate className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="student_id" value={studentId} />
        <input type="hidden" name="rule_code" value={ruleCode} />
        <input type="hidden" name="source" value={source} />

        <div className="sm:col-span-2">
          <Select
            label="Motivo del catálogo (opcional)"
            value={ruleCode}
            onChange={(e) => aplicarRegla(e.target.value)}
          >
            <option value="">Escribirlo a mano</option>
            {rules
              .filter((r) => r.active)
              .map((r) => (
                <option key={r.id} value={r.code}>
                  {r.label} ({r.points >= 0 ? "+" : ""}
                  {r.points})
                </option>
              ))}
          </Select>
        </div>

        <Input
          label="Puntos"
          name="points"
          type="number"
          inputMode="numeric"
          required
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          hint="Negativo para restar."
          error={err("points")}
        />

        <Input
          label="Fecha"
          name="occurred_on"
          type="date"
          required
          defaultValue={todayInMadrid()}
          error={err("occurred_on")}
        />

        <div className="sm:col-span-2">
          <Input
            label="Concepto"
            name="concept"
            required
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Fiesta de octubre"
            error={err("concept")}
          />
        </div>

        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 font-body text-sm text-danger sm:col-span-2"
          >
            {state.message}
          </p>
        )}

        <div className="sm:col-span-2">
          <SubmitButton />
        </div>
      </form>

      <div>
        <h4 className="font-body text-[13px] font-bold uppercase tracking-[0.08em] text-text-muted">
          Movimientos
        </h4>
        {events.length === 0 ? (
          <p className="mt-2 font-body text-sm text-text-muted">
            Todavía no tiene puntos.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-text-strong/6">
            {events.map((e) => (
              <li key={e.id} className="flex items-baseline gap-3 py-2.5">
                <span
                  className={`w-16 shrink-0 font-body text-sm font-bold ${
                    e.points >= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  {e.points >= 0 ? "+" : ""}
                  {formatPoints(e.points)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-sm text-text-body">
                    {e.concept}
                  </span>
                  <span className="block font-body text-xs text-text-muted">
                    {formatDate(e.occurred_on)} · {POINT_SOURCE_LABELS[e.source]}
                  </span>
                </span>
                {/* Los canjes no se borran desde aquí: se cancelan, y así el
                    trigger devuelve los puntos y repone el stock. */}
                {e.source !== "canje" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deletePointEvent(e.id, studentId);
                        if (!res.ok) setError(res.message ?? "No se ha podido borrar.");
                      })
                    }
                    className="shrink-0 font-body text-xs font-semibold text-text-muted hover:text-danger"
                  >
                    Borrar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-2 font-body text-xs font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
