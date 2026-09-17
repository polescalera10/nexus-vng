"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DANCE_ROLE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/format";

export type StudentFilterValues = {
  q: string;
  nivel: string;
  rol: string;
  cuota: string;
  curso: string;
  /** "activos" (por defecto) | "inactivos" | "todos" */
  estado: string;
};

/**
 * Filtros de la lista de alumnos. Todo vive en la URL (searchParams):
 * la página es un Server Component y refiltra en servidor.
 */
export function StudentFilters({
  niveles,
  cursos,
  values,
}: {
  niveles: { id: string; nombre: string }[];
  cursos: { id: string; name: string }[];
  values: StudentFilterValues;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(values.q);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(patch: Partial<StudentFilterValues>) {
    const next = { ...values, q, ...patch };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      // El estado por defecto (activos) no ensucia la URL.
      if (value && !(key === "estado" && value === "activos")) params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(value: string) {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => apply({ q: value }), 300);
  }

  function clearAll() {
    setQ("");
    router.replace(pathname, { scroll: false });
  }

  const hasFilters =
    values.q !== "" ||
    values.nivel !== "" ||
    values.rol !== "" ||
    values.cuota !== "" ||
    values.curso !== "" ||
    values.estado !== "activos";

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Input
          label="Buscar"
          name="q"
          type="search"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Nombre del alumno"
        />
        <Select
          label="Nivel"
          name="nivel"
          value={values.nivel}
          onChange={(e) => apply({ nivel: e.target.value })}
        >
          <option value="">Todos</option>
          {niveles.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nombre}
            </option>
          ))}
        </Select>
        <Select
          label="Rol de baile"
          name="rol"
          value={values.rol}
          onChange={(e) => apply({ rol: e.target.value })}
        >
          <option value="">Todos</option>
          {Object.entries(DANCE_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          label="Cuota"
          name="cuota"
          value={values.cuota}
          onChange={(e) => apply({ cuota: e.target.value })}
        >
          <option value="">Todas</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          label="Curso"
          name="curso"
          value={values.curso}
          onChange={(e) => apply({ curso: e.target.value })}
        >
          <option value="">Todos</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Estado"
          name="estado"
          value={values.estado}
          onChange={(e) => apply({ estado: e.target.value })}
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </Select>
      </div>

      {hasFilters && (
        <div className="mt-2">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
