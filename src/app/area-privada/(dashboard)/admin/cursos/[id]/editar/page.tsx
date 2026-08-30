import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getTeacherIdsByCourse } from "@/lib/queries/course-teachers";
import { getCourseById, getCourseCatalogs } from "@/lib/queries/courses";
import { Card } from "@/components/ui/Card";
import { CourseForm } from "../../CourseForm";

/** Edición de curso (admin). */
export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");

  const { id } = await params;
  const [course, catalogs, teacherIdsByCourse] = await Promise.all([
    getCourseById(id),
    getCourseCatalogs(),
    getTeacherIdsByCourse([id]),
  ]);
  if (!course) notFound();

  return (
    <>
      <Link
        href={`/area-privada/admin/cursos/${course.id}`}
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← {course.name}
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Editar curso
      </h1>

      <Card className="mt-8">
        <CourseForm
          course={course}
          teacherIds={teacherIdsByCourse.get(id) ?? []}
          modalidades={catalogs.modalidades}
          niveles={catalogs.niveles}
          teachers={catalogs.teachers}
        />
      </Card>
    </>
  );
}
