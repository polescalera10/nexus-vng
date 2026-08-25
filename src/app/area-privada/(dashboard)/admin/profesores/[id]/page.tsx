import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getModalidadOptions } from "@/lib/queries/catalogo";
import {
  getProfileName,
  getTeacherById,
  getTeacherCourses,
  getTeacherHoursReport,
} from "@/lib/queries/teachers";
import { WEEKDAYS, formatTime } from "@/lib/format";
import { DAY_KEYS, DAY_TO_WEEKDAY } from "@/lib/validation/teacher";
import { GrantAccessButton } from "../../_components/GrantAccessButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { TeacherActiveToggle } from "../TeacherActiveToggle";

export const metadata = { title: "Ficha de profesor · NEXUS VNG" };

/** "2026-07" → "Julio de 2026" */
function monthLabel(monthKey: string) {
  const [y = "1970", m = "1"] = monthKey.split("-");
  const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** 90 → "1,5 h" */
function formatHours(minutes: number) {
  return `${(minutes / 60).toLocaleString("es-ES", { maximumFractionDigits: 1 })} h`;
}

function sessionsCell(sessions: number, minutes: number) {
  if (sessions === 0) return <span className="text-text-faint">—</span>;
  return `${sessions} ${sessions === 1 ? "sesión" : "sesiones"} · ${formatHours(minutes)}`;
}

/** Ficha de profesor: datos, disponibilidad, cursos y registro de horas. */
export default async function ProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const teacher = await getTeacherById(id);
  if (!teacher) notFound();

  const [modalidades, courses, report, profileName] = await Promise.all([
    getModalidadOptions(),
    getTeacherCourses(teacher.id),
    getTeacherHoursReport(teacher.id),
    teacher.profile_id ? getProfileName(teacher.profile_id) : Promise.resolve(null),
  ]);
  const nombreBySlug = new Map(modalidades.map((m) => [m.slug, m.nombre]));

  const availableDays = DAY_KEYS.filter(
    (day) => (teacher.weekly_availability?.[day] ?? []).length > 0,
  );

  return (
    <>
      <Link
        href="/area-privada/admin/profesores"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Profesores
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            {teacher.full_name}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {teacher.active ? (
              <Badge variant="success">Activo</Badge>
            ) : (
              <Badge variant="danger">De baja</Badge>
            )}
            {teacher.profile_id ? (
              <Badge variant="success">Con acceso</Badge>
            ) : (
              <Badge>Sin acceso</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            href={`/area-privada/admin/profesores/${teacher.id}/editar`}
          >
            Editar
          </Button>
          <TeacherActiveToggle
            id={teacher.id}
            active={teacher.active}
            name={teacher.full_name}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Datos">
          <dl className="flex flex-col gap-3 font-body text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                Email
              </dt>
              <dd className="mt-0.5 break-all text-text-body">
                {teacher.email ?? <span className="text-text-faint">Sin email</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                Teléfono
              </dt>
              <dd className="mt-0.5 text-text-body">
                {teacher.phone ?? <span className="text-text-faint">Sin teléfono</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                Disciplinas
              </dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {teacher.disciplines.length === 0 ? (
                  <span className="text-text-faint">Sin disciplinas asignadas</span>
                ) : (
                  teacher.disciplines.map((slug) => (
                    <Badge key={slug}>{nombreBySlug.get(slug) ?? slug}</Badge>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                Acceso al panel
              </dt>
              <dd className="mt-1.5 text-text-body">
                {teacher.profile_id ? (
                  `Vinculado a ${profileName ?? "un perfil sin nombre"}`
                ) : (
                  <GrantAccessButton
                    kind="teacher"
                    id={teacher.id}
                    email={teacher.email}
                  />
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Disponibilidad semanal">
          {availableDays.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Sin disponibilidad definida.
            </p>
          ) : (
            <table className="w-full border-collapse text-left">
              <tbody className="divide-y divide-text-strong/6">
                {availableDays.map((day) => (
                  <tr key={day}>
                    <th
                      scope="row"
                      className="py-2 pr-4 font-body text-sm font-semibold text-text-strong"
                    >
                      {WEEKDAYS[DAY_TO_WEEKDAY[day]]}
                    </th>
                    <td className="py-2 font-body text-sm text-text-body">
                      {(teacher.weekly_availability?.[day] ?? [])
                        .map((b) => `${b.start}–${b.end}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-body text-lg font-bold text-text-strong">
          Cursos asignados
        </h2>
        {courses.length === 0 ? (
          <EmptyState
            title="Sin cursos asignados"
            description="La asignación de profesor se hace desde el formulario de cada curso."
          />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Curso</Th>
                <Th>Modalidad</Th>
                <Th>Día y hora</Th>
                <Th>Estado</Th>
              </Tr>
            </THead>
            <TBody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link
                      href={`/area-privada/admin/cursos/${c.id}`}
                      className="font-semibold text-text-strong hover:text-accent"
                    >
                      {c.name || "Curso sin nombre"}
                    </Link>
                  </Td>
                  <Td>
                    {c.modalidad_nombre ?? <span className="text-text-faint">—</span>}
                  </Td>
                  <Td>
                    {WEEKDAYS[c.weekday]} · {formatTime(c.start_time)} (
                    {c.duration_min} min)
                  </Td>
                  <Td>
                    {c.active ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <Badge>Inactivo</Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-body text-lg font-bold text-text-strong">
          Registro de horas
        </h2>
        <p className="mb-3 font-body text-sm text-text-muted">
          Sesiones impartidas en los últimos 6 meses. Titular: sesiones de sus cursos
          sin sustituto. Sustituto: sesiones de otros cursos cubiertas por él.
        </p>
        <Table>
          <THead>
            <Tr>
              <Th>Mes</Th>
              <Th>Como titular</Th>
              <Th>Como sustituto</Th>
            </Tr>
          </THead>
          <TBody>
            {report.map((row) => (
              <Tr key={row.monthKey}>
                <Td className="font-semibold text-text-strong">
                  {monthLabel(row.monthKey)}
                </Td>
                <Td>{sessionsCell(row.titularSessions, row.titularMinutes)}</Td>
                <Td>{sessionsCell(row.substituteSessions, row.substituteMinutes)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </section>
    </>
  );
}
