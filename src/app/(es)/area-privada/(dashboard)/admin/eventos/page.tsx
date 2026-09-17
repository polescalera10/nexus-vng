import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { listEventos } from "@/lib/queries/eventos-admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EVENTO_TIPO_LABELS, formatDateTime, formatEuros } from "@/lib/format";
import { EventoRowActions } from "./EventoRowActions";

export const metadata = { title: "Eventos · NEXUS VNG" };
export const dynamic = "force-dynamic";

/** Fiestas, socials, masterclasses y congresos que se publican en la web. */
export default async function EventosAdminPage() {
  await requireRole("admin");
  const eventos = await listEventos();

  const ahora = Date.now();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Eventos
          </h1>
          <p className="mt-1 font-body text-sm text-text-muted">
            Lo que publiques aquí sale en nexusvng.es/eventos.
          </p>
        </div>
        <Button href="/area-privada/admin/eventos/nuevo" size="sm">
          Nuevo evento
        </Button>
      </div>

      <div className="mt-6">
        {eventos.length === 0 ? (
          <EmptyState
            title="Todavía no hay eventos"
            description="Crea el primero y aparecerá en la web en cuanto lo publiques."
          />
        ) : (
          <ul className="divide-y divide-text-strong/8 rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
            {eventos.map((e) => {
              const pasado = new Date(e.fecha).getTime() < ahora;
              return (
                <li key={e.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link
                      href={`/area-privada/admin/eventos/${e.id}/editar`}
                      className="font-body text-[15px] font-bold text-text-strong hover:text-accent"
                    >
                      {e.titulo}
                    </Link>
                    <Badge variant={e.publico ? "success" : "neutral"}>
                      {e.publico ? "Publicado" : "Borrador"}
                    </Badge>
                    <Badge>{EVENTO_TIPO_LABELS[e.tipo]}</Badge>
                    {pasado && <Badge variant="neutral">Pasado</Badge>}
                  </div>

                  <p className="mt-1 font-body text-[13px] text-text-muted">
                    {formatDateTime(e.fecha)}
                    {e.ubicacion ? ` · ${e.ubicacion}` : ""}
                    {e.precio !== null
                      ? ` · ${e.precio === 0 ? "Gratis" : formatEuros(e.precio)}`
                      : ""}
                    {e.puntos > 0 ? ` · ${e.puntos} puntos` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/area-privada/admin/eventos/${e.id}/editar`}
                      className="inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-3 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated sm:min-h-9"
                    >
                      Editar
                    </Link>
                    {e.publico && (
                      <a
                        href={`/eventos/${e.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-sm border border-text-strong/15 px-3 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated sm:min-h-9"
                      >
                        Ver en la web
                      </a>
                    )}
                    <EventoRowActions id={e.id} titulo={e.titulo} publico={e.publico} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
