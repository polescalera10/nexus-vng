"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * Filtros del historial de puntos. Formulario GET normal: los filtros viven en
 * la URL, así que se pueden guardar y compartir, y el botón "Atrás" funciona.
 * Es cliente solo porque los campos del kit usan `useId`.
 */
export function HistorialFiltros({
  alumnos,
  reglas,
  valores,
}: {
  alumnos: { id: string; full_name: string }[];
  reglas: { code: string; label: string; active: boolean }[];
  valores: { alumno: string; regla: string; mes: string };
}) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft sm:grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] sm:items-end"
    >
      <Select label="Alumno" name="alumno" defaultValue={valores.alumno}>
        <option value="">Todos</option>
        {alumnos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.full_name}
          </option>
        ))}
      </Select>

      <Select label="Motivo" name="regla" defaultValue={valores.regla}>
        <option value="">Todos</option>
        <option value="canje">Canjes de premios</option>
        {reglas.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
            {r.active ? "" : " (desactivada)"}
          </option>
        ))}
      </Select>

      <Input label="Mes" name="mes" type="month" defaultValue={valores.mes} />

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Filtrar
        </Button>
        <Button href="/area-privada/admin/gamificacion/historial" variant="ghost">
          Limpiar
        </Button>
      </div>
    </form>
  );
}
