"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { saveReward, type GamificacionFormState } from "@/lib/actions/gamificacion";
import type { Reward } from "@/types/database";

const initial: GamificacionFormState = { status: "idle" };

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {isEdit ? "Guardar cambios" : "Crear premio"}
    </Button>
  );
}

/** Alta y edición de premio. Con `reward` edita; sin él, crea. */
export function RewardForm({ reward }: { reward?: Reward }) {
  const [state, formAction] = useActionState(saveReward, initial);
  const [active, setActive] = useState(reward?.active ?? true);
  const isEdit = Boolean(reward);
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form
      action={formAction}
      noValidate
      // `key` fuerza a React a remontar el formulario al cambiar de premio:
      // sin esto, pasar de editar uno a otro dejaría los defaultValue viejos.
      key={reward?.id ?? "nuevo"}
      className="grid gap-4 sm:grid-cols-2"
    >
      {reward && <input type="hidden" name="id" value={reward.id} />}
      <input type="hidden" name="active" value={active ? "on" : ""} />

      <div className="sm:col-span-2">
        <Input
          label="Nombre"
          name="name"
          required
          defaultValue={reward?.name ?? ""}
          placeholder="Camiseta NEXUS"
          error={err("name")}
        />
      </div>

      <Input
        label="Coste en puntos"
        name="cost_points"
        type="number"
        inputMode="numeric"
        min={1}
        required
        defaultValue={reward?.cost_points ?? 100}
        error={err("cost_points")}
      />

      <Input
        label="Unidades (opcional)"
        name="stock"
        type="number"
        inputMode="numeric"
        min={0}
        defaultValue={reward?.stock ?? ""}
        hint="Vacío = sin límite. Se descuenta solo al canjear."
        error={err("stock")}
      />

      <div className="sm:col-span-2">
        <Textarea
          label="Descripción (opcional)"
          name="description"
          rows={3}
          defaultValue={reward?.description ?? ""}
          error={err("description")}
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Toggle checked={active} onChange={setActive} label="Premio disponible" />
        <span className="font-body text-sm font-semibold text-text-strong">
          {active ? "Disponible para canjear" : "Retirado"}
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
          <Button variant="ghost" href="/area-privada/admin/gamificacion/premios">
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
}
