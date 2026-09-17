import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Not-found del panel interno: atrapa los notFound() de las fichas por [id]
 * (alumno, curso, profesor, sesión) y responde dentro del shell del panel,
 * en lugar del 404 público de la web.
 */
export default function DashboardNotFound() {
  return (
    <div className="mt-8">
      <EmptyState
        title="No hemos encontrado lo que buscas"
        description="Puede que la ficha se haya eliminado o que el enlace no sea correcto."
        action={
          <Button href="/area-privada" variant="secondary">
            Volver al inicio del panel
          </Button>
        }
      />
    </div>
  );
}
