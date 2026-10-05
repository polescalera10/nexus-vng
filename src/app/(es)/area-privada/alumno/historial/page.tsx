import Link from "next/link";
import { redirect } from "next/navigation";
import { Movimiento } from "@/components/alumno/Movimiento";
import { registrarVisita } from "@/lib/actividad";
import { requireRole } from "@/lib/auth";
import { formatPoints } from "@/lib/format";
import { getStudentForUser } from "@/lib/queries/alumno";
import {
  getPointRules,
  getRewards,
  getStudentPoints,
  getStudentRedemptions,
} from "@/lib/queries/gamificacion";
import { agruparPorMes, etiquetaMes, iconoDeMovimiento } from "@/lib/puntos";

export const metadata = { title: "Historial de puntos · NEXUS VNG" };
export const dynamic = "force-dynamic";

const FILTROS = [
  { id: "todo", label: "Todo" },
  { id: "ganados", label: "Ganados" },
  { id: "canjes", label: "Canjes" },
] as const;

type Filtro = (typeof FILTROS)[number]["id"];

/**
 * Historial completo de puntos del alumno, por meses.
 *
 * Cada mes dice cuánto entró y cuánto salió, para que el saldo no sea un
 * número caído del cielo. Los filtros son enlaces (`?filtro=`), no estado de
 * cliente: funcionan sin JavaScript y se pueden compartir con el profe.
 */
export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireRole("alumno");
  const [student] = await Promise.all([
    getStudentForUser(user.id),
    registrarVisita("historial"),
  ]);
  if (!student) redirect("/area-privada/alumno");

  const sp = await searchParams;
  const filtro: Filtro =
    sp.filtro === "ganados" || sp.filtro === "canjes" ? sp.filtro : "todo";

  const [puntos, premios, canjes, reglas] = await Promise.all([
    // Un alumno muy activo hace unos 100 apuntes al año: 1.000 son años.
    getStudentPoints(student.id, 1000),
    getRewards(),
    getStudentRedemptions(student.id),
    getPointRules(),
  ]);

  const iconosRegla = new Map(reglas.map((r) => [r.code, r.icon]));
  const premioPorId = new Map(premios.map((r) => [r.id, r]));
  const iconosCanje = new Map(
    canjes.map((c) => [c.id, premioPorId.get(c.reward_id)?.icon ?? null]),
  );

  const totalGanado = puntos.events.reduce((n, e) => n + (e.points > 0 ? e.points : 0), 0);
  const totalCanjeado = puntos.events.reduce(
    (n, e) => n + (e.source === "canje" ? -e.points : 0),
    0,
  );

  const visibles = puntos.events.filter((e) =>
    filtro === "ganados" ? e.points > 0 : filtro === "canjes" ? e.source === "canje" : true,
  );
  const meses = agruparPorMes(visibles);

  return (
    <>
      <Link
        href="/area-privada/alumno"
        className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Inicio
      </Link>
      <h1 className="mt-1 font-display text-[clamp(30px,5vw,48px)] text-text-strong">
        Tu historial
      </h1>

      {/* Resumen: de dónde sale el saldo. */}
      <dl className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Saldo", valor: formatPoints(puntos.balance), clase: "text-gradient-nexus" },
          { label: "Ganados", valor: `+${formatPoints(totalGanado)}`, clase: "text-accent" },
          { label: "Canjeados", valor: `−${formatPoints(totalCanjeado)}`, clase: "text-text-body" },
        ].map((d) => (
          <div
            key={d.label}
            className="rounded-lg border border-text-strong/10 bg-bg-panel px-3 py-3.5 sm:px-5"
          >
            <dt className="font-body text-xs font-semibold text-text-muted">{d.label}</dt>
            <dd
              className={`mt-1 font-display text-[clamp(20px,5vw,30px)] leading-none tabular-nums ${d.clase}`}
            >
              {d.valor}
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filtrar movimientos" className="mt-6 flex gap-2 overflow-x-auto">
        {FILTROS.map((f) => {
          const activo = f.id === filtro;
          return (
            <Link
              key={f.id}
              href={
                f.id === "todo"
                  ? "/area-privada/alumno/historial"
                  : `/area-privada/alumno/historial?filtro=${f.id}`
              }
              aria-current={activo ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 font-body text-sm font-semibold transition-colors ${
                activo
                  ? "border-accent bg-accent text-ink"
                  : "border-text-strong/15 text-text-body hover:bg-text-strong/8"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {meses.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-text-strong/15 p-5">
          <p className="font-body text-[15px] font-bold text-text-strong">
            {filtro === "canjes" ? "Todavía no has canjeado nada" : "Todavía no tienes puntos"}
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            {filtro === "canjes"
              ? "Cuando pidas un premio, aparecerá aquí."
              : "Ven a una masterclass, trae a un amigo o sube una story etiquetando a @nexusvng."}
          </p>
          <Link
            href={
              filtro === "canjes"
                ? "/area-privada/alumno/premios"
                : "/area-privada/alumno/premios?ver=ganar"
            }
            className="mt-3 inline-flex min-h-11 items-center font-body text-sm font-semibold text-accent hover:underline"
          >
            {filtro === "canjes" ? "Ver premios →" : "Ver cómo ganar puntos →"}
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {meses.map((m) => (
            <section key={m.mes} aria-labelledby={`mes-${m.mes}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-text-strong/10 pb-2">
                <h2 id={`mes-${m.mes}`} className="font-body text-base font-bold text-text-strong">
                  {etiquetaMes(m.mes)}
                </h2>
                <p className="font-body text-sm tabular-nums text-text-muted">
                  {m.ganados > 0 && (
                    <span className="font-semibold text-accent">+{formatPoints(m.ganados)}</span>
                  )}
                  {m.ganados > 0 && m.gastados > 0 && " · "}
                  {m.gastados > 0 && <span>−{formatPoints(m.gastados)}</span>}
                </p>
              </div>
              <ul className="divide-y divide-text-strong/6">
                {m.events.map((e) => (
                  <Movimiento
                    key={e.id}
                    event={e}
                    icon={iconoDeMovimiento(e, iconosRegla, iconosCanje)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
