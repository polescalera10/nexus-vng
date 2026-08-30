import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  getCourseDetail,
  getTeacherForUser,
  type EnrollmentWithStudent,
} from "@/lib/queries/courses";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CYCLE_TYPE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  formatDate,
  formatTime,
  SESSION_STATUS_LABELS,
  WEEKDAYS,
} from "@/lib/format";
import type { SessionStatus } from "@/types/database";

const STATUS_VARIANT: Record<SessionStatus, "neutral" | "success" | "danger"> = {
  programada: "neutral",
  impartida: "success",
  cancelada: "danger",
};

/**
 * Detalle de curso (profesor), solo lectura: columnas leader/follower y
 * sesiones con sustituto visible. Sin botones de gestión (eso es del admin).
 * Acceso: profe titular del curso o sustituto de alguna de sus sesiones.
 */
export default async function ProfesorCursoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireRole("profesor");

  const teacher = await getTeacherForUser(user.id);
  if (!teacher) {
    return (
      <div className="mt-4">
        <EmptyState
          title="Tu usuario no está vinculado a un perfil de profesor"
          description="Pide al admin que vincule tu usuario a tu ficha de profesor."
        />
      </div>
    );
  }

  const { id } = await params;
  const detail = await getCourseDetail(id);
  if (!detail) notFound();

  const { course, modalidadNombre, nivelNombre, teachers: titulares, enrollments, sessions } =
    detail;

  const esTitular = titulares.some((t) => t.id === teacher.id);

  // La RLS deja leer todos los cursos: el cerrojo por profe va aquí.
  const canView =
    esTitular || sessions.some((s) => s.substitute_teacher_id === teacher.id);
  if (!canView) notFound();

  const enrolled = enrollments.filter(
    (e) => e.status === "activa" || e.status === "pausada",
  );
  const leaders = enrolled.filter((e) => e.role_in_course === "leader");
  const followers = enrolled.filter((e) => e.role_in_course === "follower");
  const waitlist = enrollments.filter((e) => e.status === "lista_espera");
  const leadersActive = leaders.filter((e) => e.status === "activa").length;
  const followersActive = followers.filter((e) => e.status === "activa").length;

  return (
    <>
      <Link
        href="/area-privada/profesor/cursos"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Mis cursos
      </Link>

      <h1 className="mt-3 font-display text-[clamp(28px,4vw,40px)] text-text-strong">
        {course.name}
      </h1>
      <p className="mt-2 font-body text-sm text-text-muted">
        {[modalidadNombre, nivelNombre].filter(Boolean).join(" · ")}
        {" · "}
        {WEEKDAYS[course.weekday]} {formatTime(course.start_time)} ·{" "}
        {course.duration_min} min ·{" "}
        {titulares.length > 0
          ? titulares.map((t) => t.full_name).join(" y ")
          : "Sin profe titular"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={course.active ? "success" : "neutral"}>
          {course.active ? "Activo" : "Inactivo"}
        </Badge>
        <Badge variant="neutral">{CYCLE_TYPE_LABELS[course.cycle_type]}</Badge>
        {!esTitular && (
          <Badge variant="warning">Cubres sustituciones</Badge>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ReadOnlyColumn
          title={`Leaders · ${leadersActive}/${course.capacity_leaders}`}
          rows={leaders}
          emptyText="Sin leaders matriculados."
        />
        <ReadOnlyColumn
          title={`Followers · ${followersActive}/${course.capacity_followers}`}
          rows={followers}
          emptyText="Sin followers matriculados."
        />
      </div>

      {waitlist.length > 0 && (
        <Card title={`Lista de espera · ${waitlist.length}`} className="mt-4">
          <ul className="divide-y divide-text-strong/6">
            {waitlist.map((e) => (
              <li key={e.id} className="flex items-center gap-2.5 py-3">
                <span className="font-body text-sm font-semibold text-text-strong">
                  {e.student?.full_name ?? "Alumno no disponible"}
                </span>
                <Badge variant="neutral">
                  {e.role_in_course === "leader" ? "Leader" : "Follower"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title={`Sesiones · ${sessions.length}`} className="mt-4">
        {sessions.length === 0 ? (
          <p className="font-body text-sm text-text-muted">
            El admin todavía no ha generado sesiones para este curso.
          </p>
        ) : (
          <ul className="divide-y divide-text-strong/6">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-body text-sm font-semibold text-text-strong">
                    {formatDate(s.session_date)}
                  </span>
                  <Badge variant={STATUS_VARIANT[s.status]}>
                    {SESSION_STATUS_LABELS[s.status]}
                  </Badge>
                </div>
                {s.substituteName && (
                  <span className="font-body text-[13px] text-text-muted">
                    Sustituto: {s.substituteName}
                    {s.substitute_teacher_id === teacher.id && " (tú)"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function ReadOnlyColumn({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: EnrollmentWithStudent[];
  emptyText: string;
}) {
  return (
    <Card title={title}>
      {rows.length === 0 ? (
        <p className="font-body text-sm text-text-muted">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-text-strong/6">
          {rows.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 py-3">
              <span className="font-body text-sm font-semibold text-text-strong">
                {e.student?.full_name ?? "Alumno no disponible"}
              </span>
              <Badge variant={e.status === "activa" ? "success" : "warning"}>
                {ENROLLMENT_STATUS_LABELS[e.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
