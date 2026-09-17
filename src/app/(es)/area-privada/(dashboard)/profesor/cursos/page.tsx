import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getTeacherCourses, getTeacherForUser } from "@/lib/queries/courses";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { CYCLE_TYPE_LABELS, formatTime, WEEKDAYS_SHORT } from "@/lib/format";

/**
 * Mis cursos (profesor), solo lectura. La RLS de `courses` deja leer todos
 * los cursos a cualquier autenticado, así que el filtro por profe titular
 * (o sustituto de alguna sesión) se hace en la query.
 */
export default async function ProfesorCursosPage() {
  const { user } = await requireRole("profesor");

  const teacher = await getTeacherForUser(user.id);
  if (!teacher) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
          Mis cursos
        </h1>
        <div className="mt-8">
          <EmptyState
            title="Tu usuario no está vinculado a un perfil de profesor"
            description="Pide al admin que vincule tu usuario a tu ficha de profesor para ver aquí tus cursos."
          />
        </div>
      </>
    );
  }

  const items = await getTeacherCourses(teacher.id);

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Mis cursos
      </h1>
      <p className="mt-2 font-body text-base text-text-muted">
        Tus cursos como titular y los que cubres como sustituto.
      </p>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="Todavía no tienes cursos asignados"
            description="Cuando el admin te asigne un curso (o una sustitución), aparecerá aquí."
          />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Curso</Th>
                <Th>Horario</Th>
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
                  teacherIds,
                  leadersCount,
                  followersCount,
                }) => (
                  <Tr key={course.id} className="hover:bg-bg-elevated/60">
                    <Td>
                      <Link
                        href={`/area-privada/profesor/cursos/${course.id}`}
                        className="font-semibold text-text-strong hover:text-accent"
                      >
                        {course.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {[modalidadNombre, nivelNombre].filter(Boolean).join(" · ") || "—"}
                        {!teacherIds.includes(teacher.id) && " · Sustitución"}
                      </p>
                    </Td>
                    <Td>
                      {WEEKDAYS_SHORT[course.weekday]} · {formatTime(course.start_time)}
                    </Td>
                    <Td>
                      {leadersCount}/{course.capacity_leaders} ·{" "}
                      {followersCount}/{course.capacity_followers}
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
