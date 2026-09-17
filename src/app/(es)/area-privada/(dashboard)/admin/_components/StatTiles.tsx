import Link from "next/link";
import type { DashboardStats } from "@/lib/queries/activity";

/**
 * Tira de métricas del inicio de admin. Minimalista a propósito: número grande,
 * etiqueta pequeña y, si hay algo que atender, un acento de color.
 */

type Tile = {
  label: string;
  value: number;
  href?: string;
  /** Resalta el número cuando hay trabajo pendiente. */
  alert?: boolean;
};

function Tile({ label, value, href, alert }: Tile) {
  const body = (
    <>
      <span
        className={`font-display text-3xl leading-none ${
          alert && value > 0 ? "text-accent" : "text-text-strong"
        }`}
      >
        {value}
      </span>
      <span className="mt-2 block font-body text-[13px] text-text-muted">{label}</span>
    </>
  );

  const base =
    "block rounded-lg border border-text-strong/8 bg-bg-panel px-4 py-4 shadow-soft";

  if (!href) return <div className={base}>{body}</div>;

  return (
    <Link href={href} className={`${base} transition-colors hover:bg-bg-elevated`}>
      {body}
    </Link>
  );
}

export function StatTiles({ stats }: { stats: DashboardStats }) {
  const tiles: Tile[] = [
    {
      label: "Leads sin atender",
      value: stats.leadsNuevos,
      href: "/area-privada/admin/leads",
      alert: true,
    },
    { label: "Leads (7 días)", value: stats.leads7d, href: "/area-privada/admin/leads" },
    {
      label: "Inscripciones (7 días)",
      value: stats.inscripciones7d,
      href: "/area-privada/admin/cursos",
    },
    {
      label: "Cuotas pendientes",
      value: stats.cuotasPendientes,
      href: "/area-privada/admin/alumnos?cuota=pendiente",
      alert: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <Tile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
