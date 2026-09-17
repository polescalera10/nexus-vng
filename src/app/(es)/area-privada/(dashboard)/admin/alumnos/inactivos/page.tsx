import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getInactiveStudents, INACTIVITY_DAYS } from "@/lib/queries/whatsapp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { NotifyInactiveButton } from "./NotifyInactiveButton";

export default async function AlumnosInactivosPage() {
  await requireRole("admin");

  const inactive = await getInactiveStudents();

  return (
    <>
      <div>
        <Link
          href="/area-privada/admin/whatsapp"
          className="font-body text-sm font-semibold text-text-muted transition-colors hover:text-accent"
        >
          ← WhatsApp
        </Link>
        <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
          Alumnos inactivos
        </h1>
        <p className="mt-2 max-w-[56ch] font-body text-base text-text-muted">
          Alumnos activos con matrícula en algún curso que llevan más de{" "}
          {INACTIVITY_DAYS} días sin asistir a clase. Revisa cada caso y avísale
          por WhatsApp si procede.
        </p>
      </div>

      <p className="mt-6 mb-3 font-body text-sm text-text-muted">
        {inactive.length} {inactive.length === 1 ? "alumno" : "alumnos"}
      </p>

      {inactive.length === 0 ? (
        <EmptyState
          title="Nadie lleva tanto tiempo sin venir"
          description={`Ningún alumno con matrícula activa acumula más de ${INACTIVITY_DAYS} días sin asistencia registrada.`}
        />
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Última asistencia</Th>
              <Th>Cursos</Th>
              <Th />
            </Tr>
          </THead>
          <TBody>
            {inactive.map(({ student, lastAttendance, courses }) => (
              <Tr key={student.id}>
                <Td>
                  <Link
                    href={`/area-privada/admin/alumnos/${student.id}`}
                    className="font-semibold text-text-strong transition-colors hover:text-accent"
                  >
                    {student.full_name}
                  </Link>
                </Td>
                <Td>
                  {lastAttendance ? (
                    formatDate(lastAttendance)
                  ) : (
                    <span className="text-text-muted">Nunca</span>
                  )}
                </Td>
                <Td>{courses.length > 0 ? courses.join(", ") : "—"}</Td>
                <Td className="text-right">
                  <NotifyInactiveButton
                    studentId={student.id}
                    studentName={student.full_name}
                  />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
