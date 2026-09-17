"use client";

import { useState, useTransition } from "react";
import { createModalidadQuick } from "@/lib/actions/modalidades";
import type { ModalidadOption } from "@/lib/queries/catalogo";
import {
  MODALIDAD_CATEGORIA_LABELS,
  modalidadCategorias,
} from "@/lib/validation/modalidad";
import type { ModalidadCategoria } from "@/types/database";

/**
 * Alta de modalidad sin salir del formulario que la necesita.
 *
 * Ojo: NO es un `<form>`. Vive dentro del formulario de curso o de profesor y
 * un formulario anidado es HTML inválido — el navegador cierra el de fuera al
 * encontrarse el de dentro y el submit del padre se pierde. Por eso el botón
 * es `type="button"` y llama a la Server Action a mano, y por eso Enter en el
 * input se intercepta: si no, enviaría el formulario padre a medio rellenar.
 */
export function ModalidadQuickAdd({
  onCreated,
}: {
  onCreated: (modalidad: ModalidadOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<ModalidadCategoria>("clase");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createModalidadQuick({ nombre, descripcion: "", categoria });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onCreated(result.modalidad);
      setNombre("");
      setCategoria("clase");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 self-start font-body text-sm font-semibold text-accent underline underline-offset-4"
      >
        + Crear una modalidad nueva
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-dashed border-accent/40 bg-bg-elevated p-3.5">
      <label
        htmlFor="quick-modalidad-nombre"
        className="font-body text-[13px] font-semibold text-text-strong"
      >
        Nombre de la modalidad
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="quick-modalidad-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Cía Bachata Lady"
          autoComplete="off"
          className="min-h-11 flex-1 rounded-sm border border-text-strong/15 bg-bg-panel px-3.5 font-body text-base text-text-body"
        />
        <select
          aria-label="Tipo de modalidad"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as ModalidadCategoria)}
          className="min-h-11 rounded-sm border border-text-strong/15 bg-bg-panel px-3 font-body text-base text-text-body"
        >
          {modalidadCategorias.map((c) => (
            <option key={c} value={c}>
              {MODALIDAD_CATEGORIA_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="font-body text-xs font-semibold text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || nombre.trim().length < 2}
          className="min-h-11 rounded-sm bg-accent px-4 font-body text-sm font-semibold text-ink disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="min-h-11 font-body text-sm font-semibold text-text-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
