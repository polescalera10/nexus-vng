"use client";

import { useMemo, useState, useTransition } from "react";
import { formatEuros } from "@/lib/format";
import { guardarMarcaIntensivo } from "@/lib/actions/intensivos";
import type { IntensivoAsistente } from "@/lib/queries/intensivos";
import type { MetodoPago } from "@/types/database";
import { AltaPuertaForm } from "./AltaPuertaForm";

/**
 * Lista de una sesión de intensivo, pensada para usarse de pie en la puerta
 * de la sala, con una mano y la clase a punto de empezar:
 *   · dos botones por persona — "Vino" y el importe — de 44px largos,
 *   · el estado es local y optimista: el tap se ve al instante y solo revierte
 *     si la Server Action falla (así no hay esperas de red pasando lista),
 *   · buscador para encontrar a alguien en una lista de 30 sin hacer scroll,
 *   · barra fija abajo con lo asistido y lo cobrado, en zona del pulgar.
 */

type Estado = {
  registroId: string | null;
  asistio: boolean;
  pagado: boolean;
  metodoPago: MetodoPago | null;
};

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "bizum", label: "Bizum" },
  { value: "tarjeta", label: "Tarjeta" },
];

/** Quita acentos y mayúsculas para que el buscador perdone la escritura. */
const normaliza = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Estado de partida de una fila, tal y como llega del servidor. */
const estadoInicial = (a: IntensivoAsistente): Estado => ({
  registroId: a.registroId,
  asistio: a.asistio,
  pagado: a.pagado,
  metodoPago: a.metodoPago,
});

function MarkButton({
  active,
  onClick,
  disabled,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={`min-h-11 min-w-16 flex-none touch-manipulation rounded-sm border px-3 font-body text-[13px] font-bold transition-colors active:scale-[0.97] disabled:opacity-55 ${
        active
          ? "border-accent bg-accent text-ink"
          : "border-text-strong/15 bg-bg-elevated text-text-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function ListaIntensivo({
  sesion,
  asistentes,
}: {
  sesion: string;
  asistentes: IntensivoAsistente[];
}) {
  // Solo se guardan aquí las filas que Pol ha tocado en esta pantalla; el
  // resto se leen del servidor. Así un alta en puerta (que llega por refresco
  // del RSC, sin remontar el componente) aparece sin necesitar sincronización.
  const [tocados, setTocados] = useState<Record<string, Estado>>({});
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [isPending, startTransition] = useTransition();

  const estadoDe = (a: IntensivoAsistente): Estado => tocados[a.key] ?? estadoInicial(a);

  const visibles = useMemo(() => {
    const q = normaliza(busqueda.trim());
    if (!q) return asistentes;
    return asistentes.filter((a) => normaliza(a.nombre).includes(q));
  }, [asistentes, busqueda]);

  const totales = useMemo(() => {
    let asistieron = 0;
    let cobrado = 0;
    let efectivo = 0;
    let bizum = 0;
    for (const a of asistentes) {
      const estado = tocados[a.key] ?? estadoInicial(a);
      if (estado.asistio) asistieron += 1;
      if (estado.pagado) {
        cobrado += a.importe;
        if (estado.metodoPago === "efectivo") efectivo += a.importe;
        if (estado.metodoPago === "bizum") bizum += a.importe;
      }
    }
    return { asistieron, cobrado, efectivo, bizum };
  }, [asistentes, tocados]);

  /** Aplica el cambio en local y lo persiste; revierte si el servidor falla. */
  function guardar(asistente: IntensivoAsistente, cambio: Partial<Estado>) {
    const previo = tocados[asistente.key] ?? estadoInicial(asistente);

    const siguiente: Estado = { ...previo, ...cambio };
    // Al desmarcar el pago se olvida el método: no queremos "bizum" colgando.
    if (!siguiente.pagado) siguiente.metodoPago = null;

    setError(null);
    setTocados((prev) => ({ ...prev, [asistente.key]: siguiente }));

    startTransition(async () => {
      const res = await guardarMarcaIntensivo({
        sesion,
        leadId: asistente.leadId,
        registroId: siguiente.registroId,
        nombre: asistente.nombre,
        telefono: asistente.telefono,
        email: asistente.email,
        asistio: siguiente.asistio,
        pagado: siguiente.pagado,
        metodoPago: siguiente.metodoPago,
        importe: asistente.importe,
      });

      if (!res.ok) {
        setTocados((prev) => ({ ...prev, [asistente.key]: previo }));
        setError(res.message ?? "No se ha podido guardar.");
        return;
      }

      // La primera marca de un lead crea la fila: guardamos su id para que el
      // siguiente tap sea un UPDATE directo.
      if (res.registroId && !siguiente.registroId) {
        setTocados((prev) => ({
          ...prev,
          [asistente.key]: { ...(prev[asistente.key] ?? siguiente), registroId: res.registroId! },
        }));
      }
    });
  }

  return (
    <div>
      <AltaPuertaForm sesion={sesion} />

      {asistentes.length > 6 && (
        <input
          type="search"
          inputMode="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar en la lista"
          className="mt-5 w-full min-h-11 scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-3.5 py-2.5 font-body text-base text-text-strong placeholder:text-text-muted focus-visible:outline-accent sm:text-sm"
        />
      )}

      {error && (
        <p role="alert" className="mt-4 font-body text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2 pb-4">
        {visibles.map((a) => {
          const estado = estadoDe(a);

          return (
            <li
              key={a.key}
              className={`rounded-md border p-3 transition-colors ${
                estado.asistio
                  ? "border-accent/30 bg-accent/6"
                  : "border-text-strong/10 bg-bg-panel"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-body text-[15px] font-bold ${
                      estado.asistio ? "text-text-strong" : "text-text-body"
                    }`}
                  >
                    {a.nombre}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 font-body text-xs text-text-muted">
                    {a.telefono ? (
                      <a
                        href={`tel:${a.telefono.replace(/\s/g, "")}`}
                        className="underline underline-offset-2 hover:text-accent"
                      >
                        {a.telefono}
                      </a>
                    ) : (
                      <span>Sin teléfono</span>
                    )}
                    {a.enPuerta && (
                      <span className="rounded-full bg-warning/12 px-2 py-0.5 font-semibold text-warning">
                        Puerta
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-none gap-2">
                  <MarkButton
                    active={estado.asistio}
                    disabled={isPending}
                    label={`${a.nombre}: ${estado.asistio ? "ha venido" : "no ha venido"}`}
                    onClick={() => guardar(a, { asistio: !estado.asistio })}
                  >
                    Vino
                  </MarkButton>
                  <MarkButton
                    active={estado.pagado}
                    disabled={isPending}
                    label={`${a.nombre}: ${estado.pagado ? "ha pagado" : "no ha pagado"}`}
                    onClick={() =>
                      guardar(a, {
                        pagado: !estado.pagado,
                        // Pagar implica haber venido: ahorra un tap.
                        asistio: !estado.pagado ? true : estado.asistio,
                      })
                    }
                  >
                    {formatEuros(a.importe)}
                  </MarkButton>
                </div>
              </div>

              {estado.pagado && (
                <div className="mt-2.5 flex gap-2">
                  {METODOS.map((m) => {
                    const activo = estado.metodoPago === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() =>
                          guardar(a, { metodoPago: activo ? null : m.value })
                        }
                        aria-pressed={activo}
                        disabled={isPending}
                        className={`min-h-11 flex-1 touch-manipulation rounded-sm border font-body text-xs font-semibold transition-colors disabled:opacity-55 ${
                          activo
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : "border-text-strong/12 bg-bg-elevated text-text-muted"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {visibles.length === 0 && (
        <p className="py-8 text-center font-body text-sm text-text-muted">
          {asistentes.length === 0
            ? "Nadie apuntado todavía. Añade a quien llegue con el botón de arriba."
            : "Nadie con ese nombre en la lista."}
        </p>
      )}

      {/* Caja de la noche — fija sobre la tab bar móvil (min-h-14 + safe-area). */}
      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] rounded-lg border border-text-strong/10 bg-bg-elevated px-4 py-3 shadow-card md:bottom-6">
        <div className="flex items-center justify-between gap-4">
          <p aria-live="polite" className="font-body text-sm font-bold text-text-strong">
            <span className="text-accent">{totales.asistieron}</span>
            <span className="text-text-muted">/{asistentes.length}</span> vinieron
          </p>
          <p aria-live="polite" className="font-display text-2xl text-accent">
            {formatEuros(totales.cobrado)}
          </p>
        </div>
        {(totales.efectivo > 0 || totales.bizum > 0) && (
          <p className="mt-1 font-body text-xs text-text-muted">
            Efectivo {formatEuros(totales.efectivo)} · Bizum{" "}
            {formatEuros(totales.bizum)}
          </p>
        )}
      </div>
    </div>
  );
}
