"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { updateStudentNotes, type StudentFormState } from "@/lib/actions/students";

const initial: StudentFormState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Guardar notas
    </Button>
  );
}

/** Notas privadas editables desde la ficha del profesor. */
export function NotesForm({
  studentId,
  notes,
}: {
  studentId: string;
  notes: string | null;
}) {
  const [state, formAction] = useActionState(updateStudentNotes, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="student_id" value={studentId} />
      <Textarea
        label="Notas privadas"
        name="notes"
        rows={5}
        defaultValue={notes ?? ""}
        hint="Lesiones, observaciones… solo las ve el equipo."
        error={state.errors?.notes?.[0]}
      />
      {state.status === "error" && state.message && (
        <p role="alert" className="font-body text-sm font-semibold text-danger">
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p role="status" className="font-body text-sm font-semibold text-accent">
          {state.message}
        </p>
      )}
      <div>
        <SaveButton />
      </div>
    </form>
  );
}
