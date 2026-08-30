import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { updateStudent } from "@/lib/actions/students";
import { getCourseOptions } from "@/lib/queries/courses";
import { getNiveles, getPartnerOptions, getStudentDetail } from "@/lib/queries/students";
import { Card } from "@/components/ui/Card";
import { StudentForm } from "../../StudentForm";
import { EnrollmentsEditor } from "./EnrollmentsEditor";

export default async function EditarAlumnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  // La ficha completa y no `getStudent`: aquí también se editan sus clases, y
  // las matrículas vienen ya cruzadas con el curso.
  const detail = await getStudentDetail(id);
  if (!detail) notFound();
  const { student, enrollments } = detail;

  const [niveles, partners, courses] = await Promise.all([
    getNiveles(),
    getPartnerOptions(student.id),
    getCourseOptions(),
  ]);

  return (
    <>
      <Link
        href={`/area-privada/admin/alumnos/${student.id}`}
        className="font-body text-sm font-semibold text-text-muted transition-colors hover:text-accent"
      >
        ← Ficha de {student.full_name}
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Editar alumno
      </h1>
      <p className="mt-2 font-body text-base text-text-muted">{student.full_name}</p>

      <Card className="mt-8 max-w-3xl">
        <StudentForm
          action={updateStudent}
          niveles={niveles}
          partners={partners}
          student={student}
          submitLabel="Guardar cambios"
          cancelHref={`/area-privada/admin/alumnos/${student.id}`}
        />
      </Card>

      <Card title="Clases" className="mt-4 max-w-3xl">
        <EnrollmentsEditor
          studentId={student.id}
          danceRole={student.dance_role}
          enrollments={enrollments}
          courses={courses}
        />
      </Card>
    </>
  );
}
