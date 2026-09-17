"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SUPUESTOS_BASE } from "@/lib/dashboard/tarifas";
import type { Supuestos } from "@/lib/dashboard/negocio";

/**
 * Supuestos del cálculo: alquiler, semanas de clase al mes y otros gastos.
 *
 * Viven en la URL, como los filtros de Alumnos: la página es un Server
 * Component y recalcula en servidor, así que el enlace se puede compartir con
 * los mismos números. Lo que no está en la URL usa el valor base.
 */
export function SupuestosForm({ values }: { values: Supuestos }) {
  const router = useRouter();
  const pathname = usePathname();
  const [borrador, setBorrador] = useState(values);

  function aplicar(patch: Partial<Supuestos>) {
    const next = { ...borrador, ...patch };
    setBorrador(next);
    const params = new URLSearchParams();
    // Lo que coincide con el valor base no ensucia la URL.
    if (next.alquiler !== SUPUESTOS_BASE.alquiler) params.set("alquiler", String(next.alquiler));
    if (next.semanas !== SUPUESTOS_BASE.semanas) params.set("semanas", String(next.semanas));
    if (next.otros !== SUPUESTOS_BASE.otros) params.set("otros", String(next.otros));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const modificado =
    borrador.alquiler !== SUPUESTOS_BASE.alquiler ||
    borrador.semanas !== SUPUESTOS_BASE.semanas ||
    borrador.otros !== SUPUESTOS_BASE.otros;

  function restablecer() {
    setBorrador({ ...SUPUESTOS_BASE });
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Alquiler de sala"
          name="alquiler"
          type="number"
          min={0}
          step={10}
          inputMode="numeric"
          value={borrador.alquiler}
          hint="€ al mes"
          onChange={(e) => aplicar({ alquiler: Math.max(0, Number(e.target.value) || 0) })}
        />
        <Input
          label="Semanas de clase"
          name="semanas"
          type="number"
          min={1}
          max={5}
          step={1}
          inputMode="numeric"
          value={borrador.semanas}
          hint="al mes"
          onChange={(e) =>
            aplicar({ semanas: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })
          }
        />
        <Input
          label="Otros gastos"
          name="otros"
          type="number"
          min={0}
          step={10}
          inputMode="numeric"
          value={borrador.otros}
          hint="€ al mes: gestoría, seguros…"
          onChange={(e) => aplicar({ otros: Math.max(0, Number(e.target.value) || 0) })}
        />
      </div>
      {modificado && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={restablecer}>
            Volver a los supuestos base
          </Button>
        </div>
      )}
    </div>
  );
}
