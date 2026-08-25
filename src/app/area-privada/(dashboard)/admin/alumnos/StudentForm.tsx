"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { StudentFormState } from "@/lib/actions/students";
import { DANCE_ROLE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/format";
import type { PartnerOption } from "@/lib/queries/students";
import type { Nivel, Student } from "@/types/database";

const initial: StudentFormState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 py-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-accent"
      />
      <span className="flex flex-col">
        <span className="font-body text-sm font-semibold text-text-strong">{label}</span>
        {hint && <span className="font-body text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Alta y edición de alumno. La Server Action llega por props
 * (createStudent / updateStudent); en edición viaja el id oculto.
 */
export function StudentForm({
  action,
  niveles,
  partners,
  student,
  submitLabel,
  cancelHref,
}: {
  action: (state: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  niveles: Pick<Nivel, "id" | "nombre">[];
  partners: PartnerOption[];
  student?: Student;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initial);
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
      {student && <input type="hidden" name="id" value={student.id} />}

      <div className="sm:col-span-2">
        <Input
          label="Nombre completo"
          name="full_name"
          defaultValue={student?.full_name ?? ""}
          placeholder="Nombre y apellidos"
          error={err("full_name")}
        />
      </div>

      <Input
        label="Teléfono"
        name="phone"
        inputMode="tel"
        defaultValue={student?.phone ?? ""}
        placeholder="+34600000000"
        hint="Formato internacional: +34600000000"
        error={err("phone")}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        defaultValue={student?.email ?? ""}
        placeholder="alumno@email.com"
        hint="Con este email entrará al área privada."
        error={err("email")}
      />

      <Input
        label="Cumpleaños (opcional)"
        name="birthday"
        type="date"
        defaultValue={student?.birthday ?? ""}
        hint="Se usa para la felicitación automática."
        error={err("birthday")}
      />

      <Select
        label="Rol de baile"
        name="dance_role"
        defaultValue={student?.dance_role ?? ""}
        error={err("dance_role")}
      >
        <option value="">Elige un rol…</option>
        {Object.entries(DANCE_ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Nivel"
        name="nivel_id"
        defaultValue={student?.nivel_id ?? ""}
        error={err("nivel_id")}
      >
        <option value="">Sin nivel</option>
        {niveles.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nombre}
          </option>
        ))}
      </Select>

      <Select
        label="Pareja"
        name="partner_id"
        defaultValue={student?.partner_id ?? ""}
        hint="Al vincular, la pareja queda enlazada en los dos sentidos."
        error={err("partner_id")}
      >
        <option value="">Sin pareja</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
            {p.partner_id && p.partner_id !== student?.id ? " · con pareja" : ""}
          </option>
        ))}
      </Select>

      <Select
        label="Estado de cuota"
        name="payment_status"
        defaultValue={student?.payment_status ?? "pendiente"}
        error={err("payment_status")}
      >
        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Checkbox
        name="is_founding_member"
        label="Founding member"
        hint="Miembro fundador de la escuela"
        defaultChecked={student?.is_founding_member ?? false}
      />

      <Checkbox
        name="active"
        label="Alumno activo"
        hint="Desmarcar equivale a darlo de baja"
        defaultChecked={student ? student.active : true}
      />

      <div className="sm:col-span-2">
        <Textarea
          label="Notas privadas (opcional)"
          name="notes"
          rows={4}
          defaultValue={student?.notes ?? ""}
          hint="Lesiones, observaciones… solo las ve el equipo."
          error={err("notes")}
        />
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="sm:col-span-2 rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
        >
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2 mt-1 flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Button variant="secondary" href={cancelHref}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
