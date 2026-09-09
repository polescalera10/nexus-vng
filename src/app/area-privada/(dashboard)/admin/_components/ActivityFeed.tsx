import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative } from "@/lib/format";
import type { ActivityItem, ActivityKind } from "@/lib/queries/activity";

/**
 * Feed unificado de novedades. Una línea por cambio: qué tabla, qué fila,
 * cuándo. Sin adornos: el color solo aparece cuando algo requiere atención.
 */

const KIND_LABELS: Record<ActivityKind, string> = {
  lead: "Lead",
  alumno: "Alumno",
  inscripcion: "Inscripción",
  sesion: "Sesión",
  whatsapp: "WhatsApp",
  profesor: "Profesor",
  curso: "Curso",
  evento: "Evento",
};

function Row({ item }: { item: ActivityItem }) {
  const content = (
    <div className="flex items-start gap-3 py-3.5">
      <span
        aria-hidden="true"
        className={`mt-2 size-1.5 flex-none rounded-full ${
          item.kind === "lead" ? "bg-accent" : "bg-text-strong/25"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">
            {KIND_LABELS[item.kind]}
          </span>
          <span className="font-body text-sm font-semibold text-text-strong">
            {item.title.replace(/^[^·]+· /, "")}
          </span>
          {item.badge && (
            <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
          )}
        </div>
        {item.detail && (
          <p className="mt-0.5 truncate font-body text-[13px] text-text-muted">
            {item.detail}
          </p>
        )}
      </div>
      <time
        dateTime={item.at}
        className="mt-0.5 flex-none font-body text-xs text-text-muted"
      >
        {formatRelative(item.at)}
      </time>
    </div>
  );

  if (!item.href) return <li className="px-4">{content}</li>;

  return (
    <li>
      <Link
        href={item.href}
        className="block px-4 transition-colors hover:bg-bg-elevated/60"
      >
        {content}
      </Link>
    </li>
  );
}

const VISIBLE_COUNT = 5;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sin movimiento todavía"
        description="Aquí aparecerán los leads, altas, inscripciones y avisos en cuanto empiecen a entrar."
      />
    );
  }

  const visible = items.slice(0, VISIBLE_COUNT);
  const resto = items.slice(VISIBLE_COUNT);

  return (
    <div className="rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
      <ul className="divide-y divide-text-strong/8">
        {visible.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>

      {resto.length > 0 && (
        <details className="group border-t border-text-strong/8">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 py-3 font-body text-[13px] font-semibold text-accent hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver {resto.length} más</span>
            <span className="hidden group-open:inline">Ocultar</span>
          </summary>
          <ul className="divide-y divide-text-strong/8 border-t border-text-strong/8">
            {resto.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
