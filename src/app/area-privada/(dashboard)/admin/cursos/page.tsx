import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAdminCourses } from "@/lib/queries/courses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { CYCLE_TYPE_LABELS, formatTime, WEEKDAYS_SHORT } from "@/lib/format";

/** Lista de cursos (admin): horario, profe, balance de aforo y estado. */
export default async function AdminCursosPage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  await requireRole("admin");

  const { ver } = await searchParams;
  const showAll = ver === "todos";
  const items = await getAdminCourses(showAll);

  const filterPill = (active: boolean) =>
    `rounded-full px-4 py-1.5 font-body text-[13px] font-semibold transition-colors ${
      active
        ? "bg-accent text-ink"
        : "bg-bg-panel text-text-body hover:bg-bg-elevated"
    }`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Cursos
          </h1>
          <p className="mt-2 font-body text-base text-text-muted">
            Grupos, horarios y aforo por rol de baile.
          </p>
        </div>
        <Button href="/area-privada/admin/cursos/nuevo">Nuevo curso</Button>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Link
          href="/area-privada/admin/cursos"
          className={filterPill(!showAll)}
          aria-current={!showAll ? "page" : undefined}
        >
          Activos
        </Link>
        <Link
          href="/area-privada/admin/cursos?ver=todos"
          className={filterPill(showAll)}
          aria-current={showAll ? "page" : undefined}
        >
          Todos
        </Link>
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            title={showAll ? "Todavía no hay cursos" : "No hay cursos activos"}
            description={
              showAll
                ? "Crea el primer curso con su horario y aforo por rol."
                : "Mira en «Todos» por si hay cursos inactivos, o crea uno nuevo."
            }
            action={
              <span className="flex flex-wrap items-center justify-center gap-3">
                {!showAll && (
                  <Button variant="secondary" href="/area-privada/admin/cursos?ver=todos">
                    Ver todos
                  </Button>
                )}
                <Button href="/area-privada/admin/cursos/nuevo">Nuevo curso</Button>
              </span>
            }
          />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Curso</Th>
                <Th>Horario</Th>
                <Th>Profe</Th>
                <Th>Aforo (L · F)</Th>
                <Th>Ciclo</Th>
                <Th>Estado</Th>
              </Tr>
            </THead>
            <TBody>
              {items.map(
                ({
                  course,
                  modalidadNombre,
                  nivelNombre,
                  teacherNames,
                  leadersCount,
                  followersCount,
                }) => (
                  <Tr key={course.id} className="hover:bg-bg-elevated/60">
                    <Td>
                      <Link
                        href={`/area-privada/admin/cursos/${course.id}`}
                        className="font-semibold text-text-strong hover:text-accent"
                      >
                        {course.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {[modalidadNombre, nivelNombre].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </Td>
                    <Td>
                      {WEEKDAYS_SHORT[course.weekday]} · {formatTime(course.start_time)}
                    </Td>
                    <Td>
                      {teacherNames.length > 0 ? (
                        teacherNames.join(" y ")
                      ) : (
                        <span className="text-text-faint">Sin profe</span>
                      )}
                    </Td>
                    <Td>
                      {leadersCount}/{course.capacity_leaders} leaders ·{" "}
                      {followersCount}/{course.capacity_followers} followers
                    </Td>
                    <Td>{CYCLE_TYPE_LABELS[course.cycle_type]}</Td>
                    <Td>
                      <Badge variant={course.active ? "success" : "neutral"}>
                        {course.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                  </Tr>
                ),
              )}
            </TBody>
          </Table>
        )}
      </div>
    </>
  );
}
