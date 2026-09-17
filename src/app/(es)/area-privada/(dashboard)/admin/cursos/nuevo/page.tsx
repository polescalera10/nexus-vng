import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCourseCatalogs } from "@/lib/queries/courses";
import { Card } from "@/components/ui/Card";
import { CourseForm } from "../CourseForm";

/** Alta de curso (admin). */
export default async function NuevoCursoPage() {
  await requireRole("admin");
  const { modalidades, niveles, teachers } = await getCourseCatalogs();

  return (
    <>
      <Link
        href="/area-privada/admin/cursos"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Cursos
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Nuevo curso
      </h1>
      <p className="mt-2 font-body text-base text-text-muted">
        Horario semanal y aforo separado por rol de baile.
      </p>

      <Card className="mt-8">
        <CourseForm modalidades={modalidades} niveles={niveles} teachers={teachers} />
      </Card>
    </>
  );
}
