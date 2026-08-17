"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { anadirAsistentePuerta } from "@/lib/actions/intensivos";
import { INTENSIVO_PRECIO } from "@/content/intensivos";
import { formatEuros } from "@/lib/format";

/**
 * Alta rápida de alguien que se presenta sin haberse apuntado por la web.
 *
 * Plegado por defecto para no robarle sitio a la lista. Solo el nombre es
 * obligatorio, y hay dos salidas en un tap: apuntarlo sin más, o apuntarlo ya
 * cobrado (que es lo que pasa el 90 % de las veces en la puerta). El método
 * por defecto es efectivo; se cambia luego desde la fila si pagó por Bizum.
 */
export function AltaPuertaForm({ sesion }: { sesion: string }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nombreRef = useRef<HTMLInputElement>(null);

  function anadir(pagado: boolean) {
    setError(null);
    setAviso(null);

    startTransition(async () => {
      const res = await anadirAsistentePuerta({
        sesion,
        nombre,
        telefono,
        pagado,
        metodoPago: pagado ? "efectivo" : null,
      });

      if (!res.ok) {
        setError(res.message ?? "No se ha podido añadir.");
        return;
      }

      setAviso(`${nombre.trim()} añadido a la lista.`);
      setNombre("");
      setTelefono("");
      nombreRef.current?.focus();
    });
  }

  if (!abierto) {
    return (
      <div>
        <Button
          variant="secondary"
          onClick={() => {
            setAbierto(true);
            // El foco al abrir evita un tap extra con la clase empezando.
            requestAnimationFrame(() => nombreRef.current?.focus());
          }}
          className="w-full"
        >
          + Añadir a alguien en el momento
        </Button>
        {aviso && (
          <p role="status" className="mt-2 font-body text-xs font-semibold text-accent">
            {aviso}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-text-strong/12 bg-bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-sm font-bold text-text-strong">Añadir en puerta</p>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="min-h-11 px-2 font-body text-xs font-semibold text-text-muted hover:text-text-strong"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <input
          ref={nombreRef}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre y apellido"
          autoComplete="off"
          aria-label="Nombre"
          className="w-full min-h-11 scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 py-2.5 font-body text-base text-text-strong placeholder:text-text-muted focus-visible:outline-accent sm:text-sm"
        />
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono (opcional)"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          aria-label="Teléfono"
          className="w-full min-h-11 scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 py-2.5 font-body text-base text-text-strong placeholder:text-text-muted focus-visible:outline-accent sm:text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 font-body text-xs font-semibold text-danger">
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" className="mt-2 font-body text-xs font-semibold text-accent">
          {aviso}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => anadir(false)}
          loading={isPending}
          disabled={nombre.trim().length < 2}
          className="flex-1"
        >
          Solo apuntar
        </Button>
        <Button
          onClick={() => anadir(true)}
          loading={isPending}
          disabled={nombre.trim().length < 2}
          className="flex-1"
        >
          Cobrado {formatEuros(INTENSIVO_PRECIO)}
        </Button>
      </div>
    </div>
  );
}
