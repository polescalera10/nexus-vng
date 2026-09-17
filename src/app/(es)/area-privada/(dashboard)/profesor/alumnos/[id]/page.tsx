import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  DANCE_ROLE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  formatTime,
  PAYMENT_STATUS_LABELS,
  WEEKDAYS_SHORT,
} from "@/lib/format";
import { getStudentDetail } from "@/lib/queries/students";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { InscripcionEstado } from "@/types/database";
import { PaymentToggle } from "@/app/(es)/area-privada/(dashboard)/admin/alumnos/PaymentToggle";
import { NotesForm } from "./NotesForm";

const ENROLLMENT_BADGE: Record<
  InscripcionEstado,
  "success" | "warning" | "neutral" | "danger"
> = {
  activa: "success",
  pausada: "warning",
  lista_espera: "neutral",
  baja: "danger",
};

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-text-strong/6 py-2.5 last:border-b-0">
      <dt className="font-body text-[13px] font-semibold text-text-muted">{label}</dt>
      <dd className="text-right font-body text-sm text-text-body">{children}</dd>
    </div>
  );
}

/**
 * Ficha del alumno para el profesor (móvil). Read-mostly: solo puede
 * tocar cuota y notas. RLS decide el acceso: si el alumno no está en un
 * curso suyo, la consulta no devuelve nada → notFound.
 */
export default async function AlumnoProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("profesor");
  const { id } = await params;

  const detail = await getStudentDetail(id);
  if (!detail) notFound();

  const { student, nivel, partner, enrollments, attendance } = detail;
  const pct =
    attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : null;

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        {student.full_name}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={student.payment_status === "al_dia" ? "success" : "warning"}>
          Cuota: {PAYMENT_STATUS_LABELS[student.payment_status]}
        </Badge>
        {student.is_founding_member && <Badge variant="warning">Founding member</Badge>}
        {!student.active && <Badge variant="danger">De baja</Badge>}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Datos">
          <dl>
            <DataRow label="Teléfono">
              <a href={`tel:${student.phone}`} className="transition-colors hover:text-accent">
                {student.phone}
              </a>
            </DataRow>
            <DataRow label="Email">{student.email ?? "—"}</DataRow>
            <DataRow label="Rol de baile">{DANCE_ROLE_LABELS[student.dance_role]}</DataRow>
            <DataRow label="Nivel">{nivel?.nombre ?? "—"}</DataRow>
            <DataRow label="Pareja">
              {partner ? (
                <Link
                  href={`/area-privada/profesor/alumnos/${partner.id}`}
                  className="font-semibold text-accent hover:underline"
                >
                  {partner.full_name}
                </Link>
              ) : (
                "—"
              )}
            </DataRow>
          </dl>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Cuota">
            <PaymentToggle
              studentId={student.id}
              studentName={student.full_name}
              status={student.payment_status}
            />
          </Card>

          <Card title="Asistencia">
            {pct !== null ? (
              <>
                <p className="font-display text-4xl text-text-strong">{pct}%</p>
                <p className="mt-1 font-body text-sm text-text-muted">
                  {attendance.present} de {attendance.total}{" "}
                  {attendance.total === 1 ? "clase registrada" : "clases registradas"}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-4xl text-text-faint">—</p>
                <p className="mt-1 font-body text-sm text-text-muted">
                  Sin registros de asistencia todavía.
                </p>
              </>
            )}
          </Card>
        </div>

        <Card title="Cursos" className="lg:col-span-2">
          {enrollments.length === 0 ? (
            <p className="font-body text-sm text-text-muted">Sin cursos visibles.</p>
          ) : (
            <ul className="divide-y divide-text-strong/6">
              {enrollments.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-body text-sm font-semibold text-text-strong">
                      {e.course?.name ?? "Curso eliminado"}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-text-muted">
                      {e.course &&
                        `${WEEKDAYS_SHORT[e.course.weekday]} · ${formatTime(e.course.start_time)} · `}
                      Baila como {DANCE_ROLE_LABELS[e.role_in_course]}
                    </p>
                  </div>
                  <Badge variant={ENROLLMENT_BADGE[e.status]}>
                    {ENROLLMENT_STATUS_LABELS[e.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Notas" className="lg:col-span-2">
          <NotesForm studentId={student.id} notes={student.notes} />
        </Card>
      </div>
    </>
  );
}
