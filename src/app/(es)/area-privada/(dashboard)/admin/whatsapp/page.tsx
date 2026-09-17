import Link from "next/link";
import { requireRole } from "@/lib/auth";
import {
  getBroadcastAudiences,
  getWhatsappEvents,
  type WhatsappEventListItem,
} from "@/lib/queries/whatsapp";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import {
  WHATSAPP_STATUS_LABELS as STATUS_LABELS,
  WHATSAPP_TYPE_LABELS as TYPE_LABELS,
  formatDateTime,
} from "@/lib/format";
import type { WhatsappEventStatus } from "@/types/database";
import { BroadcastForm } from "./BroadcastForm";

const STATUS_BADGE: Record<WhatsappEventStatus, "neutral" | "success" | "danger"> = {
  pendiente: "neutral",
  enviado: "success",
  error: "danger",
};


function RecipientCell({ event }: { event: WhatsappEventListItem }) {
  if (event.student_id) {
    return event.studentName ? (
      <Link
        href={`/area-privada/admin/alumnos/${event.student_id}`}
        className="font-semibold text-text-strong transition-colors hover:text-accent"
      >
        {event.studentName}
      </Link>
    ) : (
      <span className="text-text-muted">Alumno eliminado</span>
    );
  }

  const recipients = event.payload.recipients;
  const count = Array.isArray(recipients) ? recipients.length : 0;
  const kind = event.payload.kind;
  return (
    <span>
      {count} {count === 1 ? "destinatario" : "destinatarios"}
      {kind === "sustitucion" && (
        <span className="text-text-muted"> · sustitución</span>
      )}
    </span>
  );
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function WhatsappPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("admin");
  const sp = await searchParams;

  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(Number.parseInt(pageRaw ?? "1", 10) || 1, 1);

  const [log, audiences] = await Promise.all([
    getWhatsappEvents(page),
    getBroadcastAudiences(),
  ]);

  const totalPages = Math.max(Math.ceil(log.total / log.pageSize), 1);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            WhatsApp
          </h1>
          <p className="mt-2 max-w-[56ch] font-body text-base text-text-muted">
            Avisos y comunicación con los grupos. Los mensajes se entregan a n8n,
            que renderiza la plantilla y envía por WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Enviar mensaje a un grupo">
          <BroadcastForm courses={audiences.courses} niveles={audiences.niveles} />
        </Card>

        <Link href="/area-privada/admin/alumnos/inactivos" className="group">
          <Card
            title="Alumnos inactivos"
            action={<Badge variant="warning">Revisar</Badge>}
            className="h-full transition-shadow group-hover:shadow-card"
          >
            <p className="font-body text-sm text-text-muted">
              Alumnos con matrícula activa que llevan más de dos semanas sin
              venir a clase. Revísalos y avísales por WhatsApp uno a uno.
            </p>
          </Card>
        </Link>
      </div>

      <h2 className="mt-10 font-body text-[15px] font-bold text-text-strong">
        Registro de eventos
      </h2>
      <p className="mt-1 mb-4 font-body text-sm text-text-muted">
        {log.total} {log.total === 1 ? "evento" : "eventos"} · «Enviado a n8n» no
        garantiza la entrega del WhatsApp.
      </p>

      {log.events.length === 0 ? (
        <EmptyState
          title="Todavía no hay eventos"
          description="Aquí aparecerá cada aviso que la app entregue a n8n: recordatorios, cuotas, broadcasts…"
        />
      ) : (
        <>
          <Table>
            <THead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Destinatario</Th>
                <Th>Estado</Th>
              </Tr>
            </THead>
            <TBody>
              {log.events.map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap">{formatDateTime(e.created_at)}</Td>
                  <Td>{TYPE_LABELS[e.type]}</Td>
                  <Td>
                    <RecipientCell event={e} />
                  </Td>
                  <Td>
                    <Badge variant={STATUS_BADGE[e.status]}>
                      {STATUS_LABELS[e.status]}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              {page > 1 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/area-privada/admin/whatsapp?page=${page - 1}`}
                >
                  ← Más recientes
                </Button>
              ) : (
                <span />
              )}
              <span className="font-body text-sm text-text-muted">
                Página {page} de {totalPages}
              </span>
              {page < totalPages ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/area-privada/admin/whatsapp?page=${page + 1}`}
                >
                  Más antiguos →
                </Button>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
