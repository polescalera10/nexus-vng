"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { updateMiPerfil, type PerfilFormState } from "@/lib/actions/perfil";
import { DANCE_ROLE_LABELS } from "@/lib/format";
import type { Student } from "@/types/database";

const initial: PerfilFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Guardar cambios
    </Button>
  );
}

/**
 * Datos del alumno editables por él mismo.
 *
 * El email se pinta pero no se edita: es la identidad con la que llega el
 * enlace mágico. Cambiarlo aquí solo cambiaría la fila de `students`, no el
 * usuario de Supabase Auth, y el alumno se quedaría fuera en el siguiente
 * intento de entrar con la ficha descuadrada. El cambio real necesita SMTP
 * propio y verificación en el correo nuevo (sigue pendiente).
 */
export function PerfilForm({ student }: { student: Student }) {
  const [state, formAction] = useActionState(updateMiPerfil, initial);
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <Input
          label="Nombre y apellidos"
          name="full_name"
          defaultValue={student.full_name}
          autoComplete="name"
          placeholder="Nombre y apellidos"
          hint="Es el nombre con el que sales en el ranking."
          error={err("full_name")}
        />
      </div>

      <Input
        label="Teléfono"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={student.phone}
        error={err("phone")}
      />

      <Input
        label="Cumpleaños"
        name="birthday"
        type="date"
        defaultValue={student.birthday ?? ""}
        hint="Para felicitarte el día que toca."
        error={err("birthday")}
      />

      <Select
        label="Cómo bailas"
        name="dance_role"
        defaultValue={student.dance_role}
        error={err("dance_role")}
      >
        {Object.entries(DANCE_ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] font-semibold text-text-strong">
          Correo
        </span>
        <p className="flex min-h-11 items-center rounded-sm border border-text-strong/15 bg-bg-panel px-3.5 py-2.5 font-body text-base text-text-muted sm:text-sm">
          {student.email ?? "Sin correo"}
        </p>
        <p className="font-body text-xs text-text-muted">
          Es tu forma de entrar aquí. Para cambiarlo, escríbenos por WhatsApp.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 py-2.5">
          <input
            type="checkbox"
            name="show_in_leaderboard"
            defaultChecked={student.show_in_leaderboard}
            className="mt-0.5 size-4 accent-accent"
          />
          <span className="flex flex-col">
            <span className="font-body text-sm font-semibold text-text-strong">
              Salir en el ranking
            </span>
            <span className="font-body text-xs text-text-muted">
              Si lo desmarcas, tu nombre, tu foto y tus puntos dejan de verse para el
              resto de alumnos. Tus puntos se siguen sumando igual.
            </span>
          </span>
        </label>
      </div>

      {state.status !== "idle" && state.message && (
        <p
          role="status"
          className={`sm:col-span-2 font-body text-sm font-semibold ${
            state.status === "success" ? "text-accent" : "text-danger"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
