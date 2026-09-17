import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createStudent } from "@/lib/actions/students";
import { getNiveles, getPartnerOptions } from "@/lib/queries/students";
import { Card } from "@/components/ui/Card";
import { StudentForm } from "../StudentForm";

export default async function NuevoAlumnoPage() {
  await requireRole("admin");
  const [niveles, partners] = await Promise.all([getNiveles(), getPartnerOptions()]);

  return (
    <>
      <Link
        href="/area-privada/admin/alumnos"
        className="font-body text-sm font-semibold text-text-muted transition-colors hover:text-accent"
      >
        ← Alumnos
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Nuevo alumno
      </h1>
      <p className="mt-2 font-body text-base text-text-muted">
        Alta manual del alumno en el CRM de la escuela.
      </p>

      <Card className="mt-8 max-w-3xl">
        <StudentForm
          action={createStudent}
          niveles={niveles}
          partners={partners}
          submitLabel="Crear alumno"
          cancelHref="/area-privada/admin/alumnos"
        />
      </Card>
    </>
  );
}
