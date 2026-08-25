import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createTeacher } from "@/lib/actions/teachers";
import { getModalidadOptions } from "@/lib/queries/catalogo";
import { TeacherForm } from "../TeacherForm";

export const metadata = { title: "Nuevo profesor · NEXUS VNG" };

/** Alta de profesor (solo admin). El acceso al panel se vincula al editar. */
export default async function NuevoProfesorPage() {
  await requireRole("admin");

  const modalidades = await getModalidadOptions();

  return (
    <>
      <Link
        href="/area-privada/admin/profesores"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Profesores
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Nuevo profesor
      </h1>
      <p className="mt-2 max-w-[52ch] font-body text-base text-text-muted">
        El acceso al panel se puede vincular después, desde la edición de su ficha.
      </p>

      <div className="mt-8">
        <TeacherForm action={createTeacher} modalidades={modalidades} />
      </div>
    </>
  );
}
