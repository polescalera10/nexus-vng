"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { savePointRule, type GamificacionFormState } from "@/lib/actions/gamificacion";
import { ICONO_PUNTOS_LABELS, POINT_SOURCE_LABELS } from "@/lib/format";
import { iconosPuntos, manualPointSources } from "@/lib/validation/gamificacion";
import type { PointRule } from "@/types/database";

const initial: GamificacionFormState = { status: "idle" };

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {isEdit ? "Guardar cambios" : "Crear regla"}
    </Button>
  );
}

/**
 * Alta y edición de regla de puntos. El `code` es la clave con la que los
 * apuntes quedan enlazados al catálogo, así que en edición no se toca: cambiarlo
 * dejaría huérfanos los `point_events` que ya lo usan.
 */
export function PointRuleForm({ rule }: { rule?: PointRule }) {
  const [state, formAction] = useActionState(savePointRule, initial);
  const [active, setActive] = useState(rule?.active ?? true);
  const isEdit = Boolean(rule);
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form
      action={formAction}
      noValidate
      key={rule?.id ?? "nueva"}
      className="grid gap-4 sm:grid-cols-2"
    >
      {rule && <input type="hidden" name="id" value={rule.id} />}
      <input type="hidden" name="active" value={active ? "on" : ""} />

      <Input
        label="Nombre"
        name="label"
        required
        defaultValue={rule?.label ?? ""}
        placeholder="Asistir a una fiesta"
        error={err("label")}
      />

      <Input
        label="Código"
        name="code"
        required
        readOnly={isEdit}
        defaultValue={rule?.code ?? ""}
        placeholder="asistencia_fiesta"
        hint={isEdit ? "No se puede cambiar: hay apuntes que lo usan." : "Minúsculas y guiones bajos."}
        error={err("code")}
      />

      <Input
        label="Puntos"
        name="points"
        type="number"
        inputMode="numeric"
        required
        defaultValue={rule?.points ?? 10}
        hint="Puede ser negativo (penalizaciones)."
        error={err("points")}
      />

      <Select
        label="Motivo"
        name="source"
        defaultValue={rule?.source ?? "manual"}
        error={err("source")}
      >
        {manualPointSources.map((s) => (
          <option key={s} value={s}>
            {POINT_SOURCE_LABELS[s]}
          </option>
        ))}
      </Select>

      <Select
        label="Icono"
        name="icon"
        defaultValue={rule?.icon ?? "estrella"}
        error={err("icon")}
      >
        {iconosPuntos.map((i) => (
          <option key={i} value={i}>
            {ICONO_PUNTOS_LABELS[i]}
          </option>
        ))}
      </Select>

      <Input
        label="Tope al mes por alumno (opcional)"
        name="monthly_limit"
        type="number"
        inputMode="numeric"
        min={1}
        defaultValue={rule?.monthly_limit ?? ""}
        hint="Vacío = sin tope. La base de datos rechaza el apunte que lo pase."
        error={err("monthly_limit")}
      />

      <div className="sm:col-span-2">
        <Textarea
          label="Explicación para el alumno (opcional)"
          name="description"
          rows={2}
          defaultValue={rule?.description ?? ""}
          hint="Sale en Premios › Cómo ganar. Cuándo cuenta y qué hace falta."
          error={err("description")}
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Toggle checked={active} onChange={setActive} label="Regla activa" />
        <span className="font-body text-sm font-semibold text-text-strong">
          {active ? "Activa" : "Desactivada"}
        </span>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger sm:col-span-2"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton isEdit={isEdit} />
        {isEdit && (
          <Button variant="ghost" href="/area-privada/admin/gamificacion/reglas">
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
}
