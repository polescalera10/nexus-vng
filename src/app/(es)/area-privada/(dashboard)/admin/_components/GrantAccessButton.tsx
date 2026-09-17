"use client";

import { useState, useTransition } from "react";
import { grantStudentAccess, grantTeacherAccess } from "@/lib/actions/access";

/**
 * Da acceso al área privada a un alumno o a un profesor.
 * No manda ningún correo: crea la cuenta y la enlaza. La persona entra
 * pidiendo su enlace mágico desde /area-privada con ese mismo email.
 */
export function GrantAccessButton({
  kind,
  id,
  email,
}: {
  kind: "student" | "teacher";
  id: string;
  email: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!email) {
    return (
      <p className="font-body text-sm text-text-muted">
        Añade un email a la ficha para poder darle acceso al panel.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending || result?.ok}
        onClick={() =>
          startTransition(async () => {
            const res =
              kind === "student"
                ? await grantStudentAccess(id)
                : await grantTeacherAccess(id);
            setResult(res);
          })
        }
        className="inline-flex min-h-11 items-center justify-center self-start rounded-sm border border-accent/50 px-4 font-body text-sm font-semibold text-accent transition-colors hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-55"
      >
        {isPending ? "Creando acceso…" : "Crear acceso al panel"}
      </button>

      {result && (
        <p
          role="status"
          className={`font-body text-sm ${result.ok ? "text-accent" : "text-danger"}`}
        >
          {result.message}
        </p>
      )}

      <p className="font-body text-xs text-text-muted">
        No se envía ningún correo. Dile que entre en {" "}
        <span className="font-semibold">nexusvng.es/area-privada</span> y pida su enlace
        de acceso con {email}.
      </p>
    </div>
  );
}
