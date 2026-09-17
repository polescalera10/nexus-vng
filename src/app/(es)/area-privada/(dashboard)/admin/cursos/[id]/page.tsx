import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  getCourseCatalogs,
  getCourseDetail,
  getEnrollableStudents,
  type EnrollmentWithStudent,
} from "@/lib/queries/courses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CYCLE_TYPE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  formatDate,
  formatTime,
  WEEKDAYS,
} from "@/lib/format";
import { StudentMiniCard } from "../../_components/StudentMiniCard";
import { EnrollForm } from "./EnrollForm";
import { PromoteButton, UnenrollButton } from "./EnrollmentActions";
import { GenerateSessionsButton, SessionList } from "./SessionList";

/** Detalle de curso (admin): matrícula por roles, lista de espera y sesiones. */
export default async function AdminCursoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");

  const { id } = await params;
  const [detail, enrollable, catalogs] = await Promise.all([
    getCourseDetail(id),
    getEnrollableStudents(id),
    getCourseCatalogs(),
  ]);
  if (!detail) notFound();

  const { course, modalidadNombre, nivelNombre, teachers, enrollments, sessions } = detail;

  const enrolled = enrollments.filter(
    (e) => e.status === "activa" || e.status === "pausada",
  );
  const leaders = enrolled.filter((e) => e.role_in_course === "leader");
  const followers = enrolled.filter((e) => e.role_in_course === "follower");
  const waitlist = enrollments.filter((e) => e.status === "lista_espera");

  const leadersActive = leaders.filter((e) => e.status === "activa").length;
  const followersActive = followers.filter((e) => e.status === "activa").length;
  const diff = leadersActive - followersActive;
  const balance =
    diff === 0
      ? "balance equilibrado"
      : diff > 0
        ? `faltan ${diff} follower${diff === 1 ? "" : "s"}`
        : `faltan ${-diff} leader${diff === -1 ? "" : "s"}`;

  // Un titular del curso no se ofrece como sustituto de sus propias sesiones.
  const titularIds = new Set(teachers.map((t) => t.id));
  const substitutes = catalogs.teachers.filter((t) => !titularIds.has(t.id));

  return (
    <>
      <Link
        href="/area-privada/admin/cursos"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Cursos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(28px,4vw,40px)] text-text-strong">
            {course.name}
          </h1>
          <p className="mt-2 font-body text-sm text-text-muted">
            {[modalidadNombre, nivelNombre].filter(Boolean).join(" · ")}
            {" · "}
            {WEEKDAYS[course.weekday]} {formatTime(course.start_time)} ·{" "}
            {course.duration_min} min ·{" "}
            {teachers.length > 0
              ? teachers.map((t) => t.full_name).join(" y ")
              : "Sin profe"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={course.active ? "success" : "neutral"}>
              {course.active ? "Activo" : "Inactivo"}
            </Badge>
            <Badge variant="neutral">{CYCLE_TYPE_LABELS[course.cycle_type]}</Badge>
            {course.start_date && (
              <span className="font-body text-xs text-text-muted">
                {formatDate(course.start_date)}
                {course.end_date ? ` → ${formatDate(course.end_date)}` : ""}
              </span>
            )}
          </div>
        </div>
        <Button variant="secondary" href={`/area-privada/admin/cursos/${course.id}/editar`}>
          Editar curso
        </Button>
      </div>

      {/* Balance de aforo */}
      <p className="mt-6 rounded-sm border border-text-strong/8 bg-bg-panel px-4 py-3 font-body text-sm font-semibold text-text-strong">
        {leadersActive} leaders / {followersActive} followers —{" "}
        <span className={diff === 0 ? "text-accent" : "text-danger"}>{balance}</span>
      </p>

      {/* Matriculados en dos columnas */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <EnrollmentColumn
          title={`Leaders · ${leadersActive}/${course.capacity_leaders}`}
          rows={leaders}
          emptyText="Sin leaders todavía."
        />
        <EnrollmentColumn
          title={`Followers · ${followersActive}/${course.capacity_followers}`}
          rows={followers}
          emptyText="Sin followers todavía."
        />
      </div>

      {/* Lista de espera */}
      <Card title={`Lista de espera · ${waitlist.length}`} className="mt-4">
        {waitlist.length === 0 ? (
          <p className="font-body text-sm text-text-muted">Nadie en lista de espera.</p>
        ) : (
          <ul className="divide-y divide-text-strong/6">
            {waitlist.map((e) => (
              <li key={e.id}>
                <StudentMiniCard
                  student={e.student}
                  badges={
                    <Badge variant="neutral">
                      {e.role_in_course === "leader" ? "Leader" : "Follower"}
                    </Badge>
                  }
                  actions={
                    <>
                      <PromoteButton enrollmentId={e.id} />
                      <UnenrollButton
                        enrollmentId={e.id}
                        studentName={e.student?.full_name ?? "este alumno"}
                      />
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Matricular alumno */}
      <Card title="Matricular alumno" className="mt-4">
        <EnrollForm courseId={course.id} students={enrollable} />
      </Card>

      {/* Sesiones */}
      <Card
        title={`Sesiones · ${sessions.length}`}
        action={<GenerateSessionsButton courseId={course.id} />}
        className="mt-4"
      >
        <SessionList
          sessions={sessions.map((s) => ({
            id: s.id,
            session_date: s.session_date,
            status: s.status,
            substitute_teacher_id: s.substitute_teacher_id,
            substituteName: s.substituteName,
          }))}
          substitutes={substitutes}
        />
      </Card>
    </>
  );
}

function EnrollmentColumn({
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
            <li key={e.id}>
              <StudentMiniCard
                student={e.student}
                badges={
                  e.status === "activa" ? null : (
                    <Badge variant="warning">{ENROLLMENT_STATUS_LABELS[e.status]}</Badge>
                  )
                }
                actions={
                  <UnenrollButton
                    enrollmentId={e.id}
                    studentName={e.student?.full_name ?? "este alumno"}
                  />
                }
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
