"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { linkLeadToStudent } from "@/lib/actions/lead-conversion";

/**
 * Aviso de que esta persona YA tiene ficha, con la salida en un clic.
 *
 * Es el caso corriente de las masterclass: quien se apunta suele ser alumno de
 * la casa. Crear la ficha otra vez deja dos cuotas y dos filas en las listas,
 * así que aquí lo que se ofrece es enlazar el lead con la que ya existe.
 */
export function YaEsAlumno({
  leadId,
  alumno,
}: {
  leadId: string;
  alumno: { id: string; full_name: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enlazar() {
    setError(null);
    startTransition(async () => {
      const res = await linkLeadToStudent(leadId, alumno.id);
      if (res.ok) {
        router.push(`/area-privada/admin/alumnos/${res.studentId}`);
        return;
      }
      setError(res.message);
    });
  }

  return (
    <div
      role="alert"
      className="mt-6 rounded-sm border border-accent/30 bg-accent/10 px-4 py-3 font-body text-sm text-text-body"
    >
      <p>
        <strong className="text-text-strong">{alumno.full_name}</strong> ya tiene ficha de
        alumno con este teléfono o email. No crees otra: enlaza el lead con la suya.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={enlazar}
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-3.5 font-body text-[13px] font-bold text-ink transition-colors hover:bg-accent/85 disabled:opacity-55 sm:min-h-9"
        >
          Enlazar con su ficha
        </button>
        <Link
          href={`/area-privada/admin/alumnos/${alumno.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-3.5 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated sm:min-h-9"
        >
          Ver su ficha
        </Link>
      </div>
      {error && <p className="mt-2 font-body text-[13px] text-danger">{error}</p>}
    </div>
  );
}
