import Link from "next/link";
import { redirect } from "next/navigation";
import { registrarVisita } from "@/lib/actividad";
import { requireRole } from "@/lib/auth";
import { formatPoints, todayInMadrid } from "@/lib/format";
import { getStudentForUser } from "@/lib/queries/alumno";
import {
  getPointRules,
  getRewards,
  getStudentPoints,
  getStudentRedemptions,
} from "@/lib/queries/gamificacion";
import { formatFechaCorta, proximoCanjeDisponible, usosDelMes } from "@/lib/puntos";
import { RewardCatalog, type PremioDelCatalogo } from "../RewardCatalog";
import { ComoGanar } from "./ComoGanar";
import { Normas } from "./Normas";

export const metadata = { title: "Premios · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Premios y cómo ganar puntos, en una sola pantalla con dos pestañas
 * (`?ver=ganar`). Pol prefirió juntarlas a tener cinco pestañas en el menú
 * móvil. Las pestañas son enlaces, no estado de cliente: cada una tiene su URL
 * y el Inicio enlaza directo a "Cómo ganar".
 */
export default async function PremiosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireRole("alumno");
  const [student] = await Promise.all([
    getStudentForUser(user.id),
    registrarVisita("premios"),
  ]);
  // Sin ficha no hay saldo: el Inicio ya explica qué falta.
  if (!student) redirect("/area-privada/alumno");

  const sp = await searchParams;
  const ver = sp.ver === "ganar" ? "ganar" : "premios";

  const [puntos, premios, canjes, reglas] = await Promise.all([
    // Los movimientos solo hacen falta para contar los de este mes (topes de
    // stories y reels), que son siempre los más recientes.
    getStudentPoints(student.id, 100),
    getRewards(true),
    getStudentRedemptions(student.id),
    getPointRules(true),
  ]);

  const ahora = new Date();
  const catalogo: PremioDelCatalogo[] = premios.map((r) => {
    const libre = proximoCanjeDisponible(r, canjes, ahora);
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      cost_points: r.cost_points,
      icon: r.icon,
      redeem_limit: r.redeem_limit,
      stock: r.stock,
      bloqueadoHasta: libre ? formatFechaCorta(libre) : null,
    };
  });

  const mes = todayInMadrid().slice(0, 7);
  const usosEsteMes = Object.fromEntries(
    reglas
      .filter((r) => r.monthly_limit !== null)
      .map((r) => [r.code, usosDelMes(puntos.events, r.code, mes)]),
  );

  const pestanas = [
    { id: "premios", label: "Premios", href: "/area-privada/alumno/premios" },
    { id: "ganar", label: "Cómo ganar", href: "/area-privada/alumno/premios?ver=ganar" },
  ] as const;

  return (
    <>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Tus puntos
      </span>
      <h1 className="mt-2 font-display text-[clamp(30px,5vw,48px)] text-text-strong">
        Premios
      </h1>
      <p className="mt-1 font-body text-base text-text-muted">
        Tienes{" "}
        <strong className="font-bold text-accent tabular-nums">
          {formatPoints(puntos.balance)} puntos
        </strong>
        .
      </p>

      <nav
        aria-label="Secciones de premios"
        className="mt-6 grid grid-cols-2 gap-1 rounded-md border border-text-strong/10 bg-bg-panel p-1 sm:inline-grid sm:min-w-80"
      >
        {pestanas.map((p) => {
          const activa = p.id === ver;
          return (
            <Link
              key={p.id}
              href={p.href}
              aria-current={activa ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-sm px-4 font-body text-sm font-semibold transition-colors ${
                activa
                  ? "bg-accent text-ink"
                  : "text-text-body hover:bg-text-strong/8"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        {ver === "premios" ? (
          <RewardCatalog premios={catalogo} balance={puntos.balance} />
        ) : (
          <ComoGanar reglas={reglas} usosEsteMes={usosEsteMes} />
        )}
      </div>

      <div className="mt-8">
        <Normas />
      </div>
    </>
  );
}
