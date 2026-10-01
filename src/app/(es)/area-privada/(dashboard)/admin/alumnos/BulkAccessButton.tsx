"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { grantAllStudentsAccess, type BulkAccessResult } from "@/lib/actions/access";

/**
 * Crea el acceso al área privada de todos los alumnos activos que tienen email
 * y aún no tienen cuenta. No manda ningún correo: cada alumno entra pidiendo su
 * propio enlace en /area-privada. Pide confirmación porque son decenas de
 * cuentas de golpe.
 */
export function BulkAccessButton({ pendientes }: { pendientes: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkAccessResult | null>(null);

  if (pendientes === 0 && !result) return null;

  function handleClick() {
    const message =
      `¿Crear el acceso de ${pendientes} ${pendientes === 1 ? "alumno" : "alumnos"}? ` +
      "No se envía ningún correo: cada uno entra pidiendo su enlace en /area-privada.";
    if (!window.confirm(message)) return;
    startTransition(async () => setResult(await grantAllStudentsAccess()));
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      {!result?.ok && pendientes > 0 && (
        <Button variant="secondary" loading={isPending} onClick={handleClick}>
          Dar acceso a todos ({pendientes})
        </Button>
      )}
      {result && (
        <div role="status" className="max-w-[46ch] sm:text-right">
          <p className={`font-body text-sm ${result.ok ? "text-accent" : "text-danger"}`}>
            {result.message}
          </p>
          {result.fallos.length > 0 && (
            <ul className="mt-1.5 font-body text-xs text-text-muted">
              {result.fallos.map((f) => (
                <li key={f.nombre}>
                  {f.nombre}: {f.motivo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
