import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { updateTeacher } from "@/lib/actions/teachers";
import { getModalidadOptions } from "@/lib/queries/catalogo";
import { getLinkableProfiles, getTeacherById } from "@/lib/queries/teachers";
import { TeacherForm } from "../../TeacherForm";

export const metadata = { title: "Editar profesor · NEXUS VNG" };

/** Edición de profesor, incluida la vinculación de acceso al panel. */
export default async function EditarProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const teacher = await getTeacherById(id);
  if (!teacher) notFound();

  const [modalidades, profiles] = await Promise.all([
    getModalidadOptions(),
    getLinkableProfiles(teacher.profile_id),
  ]);

  const action = updateTeacher.bind(null, teacher.id);

  return (
    <>
      <Link
        href={`/area-privada/admin/profesores/${teacher.id}`}
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Ficha de {teacher.full_name}
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Editar profesor
      </h1>

      <div className="mt-8">
        <TeacherForm
          action={action}
          teacher={teacher}
          modalidades={modalidades}
          profiles={profiles}
        />
      </div>
    </>
  );
}
