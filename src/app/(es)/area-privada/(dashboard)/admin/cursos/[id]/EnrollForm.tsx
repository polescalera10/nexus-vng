"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { enrollStudent, type EnrollFormState } from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DANCE_ROLE_LABELS } from "@/lib/format";
import type { DanceRole, EnrollmentRole } from "@/types/database";

const initial: EnrollFormState = { status: "idle" };

type EnrollableStudent = {
  id: string;
  full_name: string;
  dance_role: DanceRole;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Matricular
    </Button>
  );
}

function WaitlistButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      loading={pending}
      name="to_waitlist"
      value="true"
    >
      Confirmar lista de espera
    </Button>
  );
}

/**
 * Matricular alumno en el curso. Si el rol elegido está lleno, la action
 * devuelve `status: "full"` y aparece un segundo submit que reenvía con
 * `to_waitlist=true` para confirmar la entrada en lista de espera.
 */
export function EnrollForm({
  courseId,
  students,
}: {
  courseId: string;
  students: EnrollableStudent[];
}) {
  const [state, formAction] = useActionState(enrollStudent, initial);
  const [studentId, setStudentId] = useState("");

  const selected = students.find((s) => s.id === studentId);
  // Si el alumno es leader/follower, el rol queda preseleccionado y bloqueado.
  const lockedRole: EnrollmentRole | null =
    selected && selected.dance_role !== "both" ? selected.dance_role : null;

  const err = (field: string) => state.errors?.[field]?.[0];

  if (students.length === 0) {
    return (
      <p className="font-body text-sm text-text-muted">
        No quedan alumnos activos sin matricular en este curso.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="course_id" value={courseId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Alumno"
          name="student_id"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          error={err("student_id")}
        >
          <option value="">Elige un alumno</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({DANCE_ROLE_LABELS[s.dance_role]})
            </option>
          ))}
        </Select>

        {lockedRole ? (
          <>
            {/* Los selects disabled no se envían: el valor viaja oculto. */}
            <input type="hidden" name="role_in_course" value={lockedRole} />
            <Select
              label="Rol en el curso"
              value={lockedRole}
              disabled
              hint={`Fijado por su rol de baile (${DANCE_ROLE_LABELS[lockedRole]}).`}
            >
              <option value="leader">Leader</option>
              <option value="follower">Follower</option>
            </Select>
          </>
        ) : (
          <Select
            label="Rol en el curso"
            name="role_in_course"
            required
            defaultValue=""
            error={err("role_in_course")}
            hint={selected ? "Este alumno baila ambos roles: elige uno." : undefined}
          >
            <option value="">Elige un rol</option>
            <option value="leader">Leader</option>
            <option value="follower">Follower</option>
          </Select>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
        >
          {state.message}
        </p>
      )}

      {state.status === "success" && state.message && (
        <p
          role="status"
          className="rounded-sm border border-accent/25 bg-accent/8 px-4 py-3 font-body text-sm font-semibold text-accent"
        >
          {state.message}
        </p>
      )}

      {state.status === "full" ? (
        <div className="flex flex-col gap-3 rounded-sm border border-warning/35 bg-warning/10 px-4 py-3">
          <p role="alert" className="font-body text-sm text-text-strong">
            {state.message}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <WaitlistButton />
            <SubmitButton />
          </div>
        </div>
      ) : (
        <div>
          <SubmitButton />
        </div>
      )}
    </form>
  );
}
