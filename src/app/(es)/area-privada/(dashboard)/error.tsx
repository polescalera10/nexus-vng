"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Error boundary del panel interno. Renderiza dentro del shell (sidebar/tabs),
 * en español y sin filtrar detalles internos del error al usuario.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Solo para diagnóstico en consola; al usuario no se le muestra el detalle.
    console.error(error);
  }, [error]);

  return (
    <div className="mt-8">
      <EmptyState
        title="Algo ha fallado al cargar esta página"
        description="Ha ocurrido un error inesperado. Vuelve a intentarlo y, si el problema sigue, recarga la página o inténtalo más tarde."
        action={<Button onClick={reset}>Reintentar</Button>}
      />
    </div>
  );
}
