import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buildStudentWaLink } from "@/lib/whatsapp";
import type { PaymentStatus } from "@/types/database";

/**
 * Ficha mínima de alumno para listas del panel (matriculados de un curso,
 * lista de espera).
 *
 * Antes estas listas eran solo el nombre enlazado. Para escribir a alguien
 * había que abrir su ficha, copiar el teléfono y volver — y desde una lista de
 * clase eso es justo lo que se hace todo el rato (avisar de un cambio de
 * horario, recordar una cuota). Aquí el teléfono está a la vista, el WhatsApp
 * a un toque y el avatar de iniciales hace de ancla visual para no leer nombre
 * por nombre.
 */

export type MiniCardStudent = {
  id: string;
  full_name: string;
  phone: string;
  payment_status: PaymentStatus;
  is_founding_member: boolean;
};

export function StudentMiniCard({
  student,
  badges,
  actions,
}: {
  student: MiniCardStudent | null;
  /** Contexto de la lista (rol, estado de la matrícula). */
  badges?: React.ReactNode;
  /** Botones de la fila (dar de baja, promocionar). */
  actions?: React.ReactNode;
}) {
  if (!student) {
    return (
      <div className="flex items-center justify-between gap-3 py-3">
        <span className="font-body text-sm text-text-faint">Alumno no disponible</span>
        {actions}
      </div>
    );
  }

  const waHref = buildStudentWaLink(student.phone, student.full_name);

  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2 py-3">
      <Avatar name={student.full_name} seed={student.id} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/area-privada/admin/alumnos/${student.id}`}
            className="font-body text-sm font-semibold text-text-strong hover:text-accent"
          >
            {student.full_name}
          </Link>
          {badges}
          {student.is_founding_member && <Badge variant="neutral">Fundador</Badge>}
          {student.payment_status === "pendiente" && (
            <Badge variant="danger">Cuota pendiente</Badge>
          )}
        </div>

        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-body text-[13px] text-text-muted">
          <a
            href={`tel:${student.phone.replace(/\s/g, "")}`}
            className="transition-colors hover:text-accent"
          >
            {student.phone}
          </a>
          {waHref && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                WhatsApp
              </a>
            </>
          )}
        </p>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
