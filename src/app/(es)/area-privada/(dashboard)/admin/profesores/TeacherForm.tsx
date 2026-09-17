"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type { TeacherFormState } from "@/lib/actions/teachers";
import type { ModalidadOption } from "@/lib/queries/catalogo";
import type { LinkableProfile } from "@/lib/queries/teachers";
import type { Teacher } from "@/types/database";
import { ModalidadQuickAdd } from "../_components/ModalidadQuickAdd";
import { AvailabilityEditor } from "./AvailabilityEditor";

const initial: TeacherFormState = { status: "idle" };

/**
 * Formulario de alta/edición de profesor. La Server Action llega por props
 * (createTeacher, o updateTeacher ya ligada al id). El select de acceso solo
 * se muestra en edición (cuando llega `profiles`).
 */
export function TeacherForm({
  action,
  teacher,
  modalidades: modalidadesIniciales,
  profiles,
}: {
  action: (prev: TeacherFormState, formData: FormData) => Promise<TeacherFormState>;
  teacher?: Teacher;
  modalidades: ModalidadOption[];
  /** Perfiles con rol profesor vinculables. Solo en edición. */
  profiles?: LinkableProfile[];
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [active, setActive] = useState(teacher?.active ?? true);

  /**
   * El catálogo se puede ampliar sin salir de aquí (ModalidadQuickAdd), así
   * que vive en estado: la opción nueva aparece marcada al instante y no se
   * pierde lo ya escrito en el resto del formulario.
   */
  const [modalidades, setModalidades] = useState(modalidadesIniciales);
  const [extraChecked, setExtraChecked] = useState<string[]>([]);

  return (
    <form action={formAction} noValidate className="flex max-w-xl flex-col gap-5">
      <Input
        label="Nombre completo"
        name="full_name"
        required
        defaultValue={teacher?.full_name ?? ""}
        placeholder="Nombre y apellidos"
        error={state.errors?.full_name?.[0]}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        defaultValue={teacher?.email ?? ""}
        placeholder="nombre@ejemplo.com"
        hint="Con este email entrará al área privada."
        error={state.errors?.email?.[0]}
      />

      <Input
        label="Teléfono (opcional)"
        name="phone"
        inputMode="tel"
        defaultValue={teacher?.phone ?? ""}
        placeholder="+34600111222"
        hint="Formato internacional E.164, con prefijo."
        error={state.errors?.phone?.[0]}
      />

      {/* Disciplinas: modalidades activas, se guardan sus slugs */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-body text-[13px] font-semibold text-text-strong">
          Disciplinas
        </legend>
        {modalidades.length === 0 ? (
          <p className="font-body text-sm text-text-muted">
            No hay modalidades activas en el catálogo.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {modalidades.map((m) => (
              <label
                key={m.slug}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 font-body text-sm text-text-body"
              >
                <input
                  type="checkbox"
                  name="disciplines"
                  value={m.slug}
                  defaultChecked={
                    extraChecked.includes(m.slug) ||
                    (teacher?.disciplines.includes(m.slug) ?? false)
                  }
                  className="size-4 accent-accent"
                />
                {m.nombre}
              </label>
            ))}
          </div>
        )}
        {state.errors?.disciplines && (
          <p className="font-body text-xs font-semibold text-danger">
            {state.errors.disciplines[0]}
          </p>
        )}

        <div className="mt-2">
          <ModalidadQuickAdd
            onCreated={(m) => {
              setModalidades((prev) =>
                prev.some((x) => x.slug === m.slug) ? prev : [...prev, m],
              );
              setExtraChecked((prev) => [...new Set([...prev, m.slug])]);
            }}
          />
        </div>
      </fieldset>

      <AvailabilityEditor
        defaultValue={teacher?.weekly_availability}
        errors={state.errors}
      />

      {profiles && (
        <Select
          label="Acceso al panel"
          name="profile_id"
          defaultValue={teacher?.profile_id ?? ""}
          hint="Vincula el profesor a un usuario con rol profesor para que entre al panel."
          error={state.errors?.profile_id?.[0]}
        >
          <option value="">Sin acceso</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre ?? "Perfil sin nombre"}
            </option>
          ))}
        </Select>
      )}

      {/* Activo: Toggle accesible + hidden input para el FormData */}
      <div className="flex items-center gap-3">
        <input type="hidden" name="active" value={active ? "on" : ""} />
        <Toggle checked={active} onChange={setActive} label="Profesor activo" />
        <span className="font-body text-sm font-semibold text-text-body">
          {active ? "Activo" : "De baja"}
        </span>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
        >
          {state.message}
        </p>
      )}

      <div className="mt-1 flex items-center gap-3">
        <Button type="submit" loading={pending}>
          {teacher ? "Guardar cambios" : "Crear profesor"}
        </Button>
        <Button
          variant="secondary"
          href={
            teacher
              ? `/area-privada/admin/profesores/${teacher.id}`
              : "/area-privada/admin/profesores"
          }
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
