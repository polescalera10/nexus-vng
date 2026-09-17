import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { listLeads } from "@/lib/queries/activity";
import { leadEstados } from "@/lib/validation/lead";
import { LEAD_ESTADO_LABELS } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadCard } from "../_components/LeadCard";
import type { LeadEstado } from "@/types/database";

/**
 * Bandeja de leads: todo lo que llega de los formularios de la web, con las
 * mismas acciones rápidas del inicio (WhatsApp + mover de estado).
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const FILTERS: { value: LeadEstado | "todos"; label: string }[] = [
  { value: "nuevo", label: "Sin atender" },
  ...leadEstados
    .filter((e) => e !== "nuevo")
    .map((e) => ({ value: e, label: LEAD_ESTADO_LABELS[e] ?? e })),
  { value: "todos", label: "Todos" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("admin");
  const sp = await searchParams;

  const raw = one(sp.estado);
  const estado: LeadEstado | "todos" = (leadEstados as readonly string[]).includes(raw)
    ? (raw as LeadEstado)
    : raw === "todos"
      ? "todos"
      : "nuevo";

  const leads = await listLeads({ estado, limit: 100 });

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Leads
      </h1>
      <p className="mt-1 font-body text-sm text-text-muted">
        Solicitudes recibidas desde los formularios de la web.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.value === estado;
          return (
            <Link
              key={filter.value}
              href={`/area-privada/admin/leads?estado=${filter.value}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 font-body text-[13px] font-semibold transition-colors sm:min-h-9 ${
                active
                  ? "bg-accent text-ink"
                  : "border border-text-strong/15 text-text-body hover:bg-bg-elevated"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        {leads.length === 0 ? (
          <EmptyState
            title="Nada por aquí"
            description="No hay leads con ese estado."
          />
        ) : (
          <ul className="divide-y divide-text-strong/8 rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
