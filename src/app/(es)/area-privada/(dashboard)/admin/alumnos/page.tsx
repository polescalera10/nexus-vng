import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { signAvatarUrls } from "@/lib/avatars";
import { DANCE_ROLE_LABELS, formatPoints } from "@/lib/format";
import {
  countStudentsSinAcceso,
  getActiveCourses,
  getNiveles,
  listStudents,
  type StudentsEstadoFilter,
} from "@/lib/queries/students";
import { getBalancesByStudent } from "@/lib/queries/gamificacion";
import { danceRoles, paymentStatuses } from "@/lib/validation/student";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import type { DanceRole, PaymentStatus } from "@/types/database";
import { BulkAccessButton } from "./BulkAccessButton";
import { PaymentToggle } from "./PaymentToggle";
import { StudentFilters } from "./StudentFilters";

// "Dar acceso a todos" crea una cuenta por alumno desde esta página: con medio
// centenar de altas el límite por defecto se queda corto.
export const maxDuration = 60;

// Las fotos van por URL firmada de 1 h (lib/avatars.ts): nada de caché.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("admin");
  const sp = await searchParams;

  const q = one(sp.q).trim();
  const nivel = one(sp.nivel);
  const curso = one(sp.curso);
  const rolRaw = one(sp.rol);
  const rol = (danceRoles as readonly string[]).includes(rolRaw)
    ? (rolRaw as DanceRole)
    : undefined;
  const cuotaRaw = one(sp.cuota);
  const cuota = (paymentStatuses as readonly string[]).includes(cuotaRaw)
    ? (cuotaRaw as PaymentStatus)
    : undefined;
  const estadoRaw = one(sp.estado);
  const estado: StudentsEstadoFilter =
    estadoRaw === "inactivos" || estadoRaw === "todos" ? estadoRaw : "activos";

  const [students, niveles, cursos, sinAcceso] = await Promise.all([
    listStudents({
      q: q || undefined,
      nivelId: nivel || undefined,
      rol,
      cuota,
      cursoId: curso || undefined,
      estado,
    }),
    getNiveles(),
    getActiveCourses(),
    countStudentsSinAcceso(),
  ]);

  // Los saldos van en una segunda consulta y no en `listStudents`: la
  // gamificación es un módulo aparte y meterla en la query de alumnos ataría
  // el listado a una tabla que puede no interesar en otras pantallas.
  const [balances, avatarUrls] = await Promise.all([
    getBalancesByStudent(students.map((s) => s.id)),
    signAvatarUrls(students.map((s) => s.avatar_path)),
  ]);

  const hasFilters = Boolean(q || nivel || curso || rol || cuota || estado !== "activos");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Alumnos
          </h1>
          <p className="mt-2 font-body text-base text-text-muted">
            Fichas, cuotas y estado del alumnado.
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-3">
          <BulkAccessButton pendientes={sinAcceso} />
          <Button href="/area-privada/admin/alumnos/nuevo">Nuevo alumno</Button>
        </div>
      </div>

      <div className="mt-8">
        <StudentFilters
          niveles={niveles}
          cursos={cursos}
          values={{ q, nivel, rol: rolRaw, cuota: cuotaRaw, curso, estado }}
        />
      </div>

      <p className="mt-6 mb-3 font-body text-sm text-text-muted">
        {students.length} {students.length === 1 ? "alumno" : "alumnos"}
      </p>

      {students.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Ningún alumno coincide con los filtros" : "Todavía no hay alumnos"}
          description={
            hasFilters
              ? "Prueba a cambiar o limpiar los filtros."
              : "Da de alta al primer alumno para empezar a gestionar cuotas y asistencia."
          }
          action={
            hasFilters ? undefined : (
              <Button href="/area-privada/admin/alumnos/nuevo">Nuevo alumno</Button>
            )
          }
        />
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Nivel</Th>
              <Th>Rol</Th>
              <Th>Cuota</Th>
              <Th>Puntos</Th>
              <Th>Estado</Th>
            </Tr>
          </THead>
          <TBody>
            {students.map((s) => (
              <Tr key={s.id} className={s.active ? "" : "opacity-60"}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={s.full_name}
                      seed={s.id}
                      src={s.avatar_path ? (avatarUrls.get(s.avatar_path) ?? null) : null}
                      size="sm"
                    />
                    <span>
                      <Link
                        href={`/area-privada/admin/alumnos/${s.id}`}
                        className="font-semibold text-text-strong transition-colors hover:text-accent"
                      >
                        {s.full_name}
                      </Link>
                      {s.is_founding_member && (
                        <Badge variant="warning" className="ml-2">
                          Founding
                        </Badge>
                      )}
                    </span>
                  </div>
                </Td>
                <Td>{s.nivel?.nombre ?? "—"}</Td>
                <Td>{DANCE_ROLE_LABELS[s.dance_role]}</Td>
                <Td>
                  <PaymentToggle
                    studentId={s.id}
                    studentName={s.full_name}
                    status={s.payment_status}
                  />
                </Td>
                <Td>{formatPoints(balances.get(s.id) ?? 0)}</Td>
                <Td>
                  <Badge variant={s.active ? "success" : "neutral"}>
                    {s.active ? "Activo" : "Inactivo"}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
