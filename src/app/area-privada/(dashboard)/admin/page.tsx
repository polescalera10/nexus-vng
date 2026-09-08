import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getActivityFeed, getDashboardStats, listLeads } from "@/lib/queries/activity";
import { getCoberturaDelMes } from "@/lib/queries/courses";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActivityFeed } from "./_components/ActivityFeed";
import { LeadCard } from "./_components/LeadCard";
import { SesionesDelMes } from "./_components/SesionesDelMes";
import { StatTiles } from "./_components/StatTiles";

/**
 * Inicio del panel de admin: qué ha pasado desde la última vez.
 * Métricas → leads sin atender (con acciones rápidas) → feed de novedades.
 * Datos en vivo: sin caché, cada visita relee Supabase.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("admin");

  const [stats, leadsNuevos, activity, cobertura] = await Promise.all([
    getDashboardStats(),
    listLeads({ estado: "nuevo", limit: 5 }),
    getActivityFeed(25),
    getCoberturaDelMes(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Novedades
          </h1>
          <p className="mt-1 font-body text-sm text-text-muted">
            Todo lo que ha entrado en la escuela, de lo más reciente a lo más antiguo.
          </p>
        </div>
        {stats.whatsappErrores > 0 && (
          <Link
            href="/area-privada/admin/whatsapp"
            className="font-body text-[13px] font-semibold text-danger hover:underline"
          >
            {stats.whatsappErrores} envío{stats.whatsappErrores === 1 ? "" : "s"} de
            WhatsApp con error →
          </Link>
        )}
      </div>

      <div className="mt-6">
        <StatTiles stats={stats} />
      </div>

      <div className="mt-8">
        <SesionesDelMes cobertura={cobertura} />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-body text-[15px] font-bold text-text-strong">
            Leads sin atender
          </h2>
          <Link
            href="/area-privada/admin/leads"
            className="font-body text-[13px] font-semibold text-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {leadsNuevos.length === 0 ? (
          <EmptyState
            title="Bandeja limpia"
            description="No hay leads pendientes de contactar. Los nuevos aparecerán aquí en cuanto entren."
          />
        ) : (
          <ul className="divide-y divide-text-strong/8 rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
            {leadsNuevos.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-body text-[15px] font-bold text-text-strong">
          Últimas actualizaciones
        </h2>
        <ActivityFeed items={activity} />
      </section>
    </>
  );
}
