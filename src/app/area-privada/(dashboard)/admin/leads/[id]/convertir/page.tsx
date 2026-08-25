import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getLeadById } from "@/lib/queries/activity";
import { getCourseOptions } from "@/lib/queries/courses";
import { toE164 } from "@/lib/phone";
import { LEAD_ORIGEN_LABELS } from "@/lib/format";
import { ConvertLeadForm } from "./ConvertLeadForm";

export const metadata = { title: "Convertir lead · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Sugerencia de curso a partir de lo que el lead pidió.
 *
 * Los formularios de la web guardan textos legibles ("Salsa 1 · Miércoles
 * 20:30") en `modalidad_interes`/`intereses`; los cursos del panel tienen su
 * propio `name`. Se busca la primera coincidencia por nombre normalizado y, si
 * no hay ninguna, no se sugiere nada: preseleccionar el curso equivocado es
 * peor que no preseleccionar.
 */
function sugerirCurso(
  textos: string[],
  courses: { id: string; name: string }[],
): string | undefined {
  const limpiar = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const pistas = textos.filter(Boolean).map(limpiar);
  if (pistas.length === 0) return undefined;

  const match = courses.find((c) => {
    const nombre = limpiar(c.name);
    return pistas.some((p) => p.includes(nombre) || nombre.includes(p));
  });
  return match?.id;
}

export default async function ConvertirLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const [lead, courses] = await Promise.all([getLeadById(id), getCourseOptions()]);
  if (!lead) notFound();

  const phoneE164 = toE164(lead.telefono) ?? "";
  const suggestedCourseId = sugerirCurso(
    [lead.modalidad_interes ?? "", ...(lead.intereses ?? [])],
    courses,
  );

  const pedido = [lead.modalidad_interes, ...(lead.intereses ?? [])]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Link
        href="/area-privada/admin/leads"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Leads
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Convertir en alumno
      </h1>
      <p className="mt-2 max-w-[60ch] font-body text-base text-text-muted">
        Llegó por {LEAD_ORIGEN_LABELS[lead.origen] ?? lead.origen}
        {pedido ? ` y pidió: ${pedido}.` : "."} El lead se conserva enlazado a la ficha
        para no perder de dónde vino.
      </p>

      {lead.student_id && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 font-body text-sm text-warning"
        >
          Este lead ya se convirtió en alumno.{" "}
          <Link
            href={`/area-privada/admin/alumnos/${lead.student_id}`}
            className="underline underline-offset-4"
          >
            Ver su ficha
          </Link>
          .
        </p>
      )}

      {!phoneE164 && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 font-body text-sm text-warning"
        >
          El teléfono del lead ({lead.telefono}) no se ha podido convertir a formato
          internacional. Escríbelo a mano antes de crear la ficha.
        </p>
      )}

      {lead.mensaje && (
        <blockquote className="mt-6 border-l-2 border-accent/40 pl-4 font-body text-sm text-text-body">
          “{lead.mensaje}”
        </blockquote>
      )}

      <div className="mt-8">
        <ConvertLeadForm
          lead={lead}
          phoneE164={phoneE164}
          courses={courses}
          suggestedCourseId={suggestedCourseId}
        />
      </div>
    </>
  );
}
