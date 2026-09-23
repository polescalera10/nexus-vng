import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getResumenIntensivos } from "@/lib/queries/intensivos";
import { listSesionesSueltas, type SesionSuelta } from "@/lib/queries/sesiones-sueltas";
import { formatEuros, todayInMadrid } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

/**
 * Índice del control de sesiones sueltas: los intensivos del cartel y las
 * masterclass, cada grupo por su lado pero con la misma ficha de asistencia y
 * cobro. La de hoy va destacada, que es la que se abre con la clase empezando.
 */
export const dynamic = "force-dynamic";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "2026-10-03" → "3 oct" para el bloque de fecha de la tarjeta. */
function diaYMes(fechaIso: string) {
  const [, mes, dia] = fechaIso.split("-");
  return {
    dia: String(Number(dia)),
    mes: MESES[Number(mes) - 1]?.slice(0, 3) ?? "",
  };
}

export default async function IntensivosPage() {
  await requireRole("admin");

  const { intensivos, masterclasses } = await listSesionesSueltas();
  const todas = [...intensivos, ...masterclasses];
  const resumen = await getResumenIntensivos(todas.map((s) => s.slug));
  const hoy = todayInMadrid();

  const totalRecaudado = [...resumen.values()].reduce((sum, r) => sum + r.recaudado, 0);
  const totalAsistentes = [...resumen.values()].reduce((sum, r) => sum + r.asistieron, 0);

  function Tarjeta({ sesion }: { sesion: SesionSuelta }) {
    const datos = resumen.get(sesion.slug);
    const esHoy = sesion.fechaIso === hoy;
    const pasada = sesion.fechaIso < hoy;
    const { dia, mes } = diaYMes(sesion.fechaIso);

    return (
      <li>
        <Link
          href={`/area-privada/admin/intensivos/${sesion.slug}`}
          className={`flex min-h-20 items-center gap-4 rounded-lg border p-4 transition-colors ${
            esHoy
              ? "border-accent/40 bg-accent/8 hover:bg-accent/12"
              : "border-text-strong/8 bg-bg-panel hover:bg-bg-elevated"
          } ${pasada ? "opacity-70" : ""}`}
        >
          {/* Bloque de fecha */}
          <div
            className={`flex size-14 flex-none flex-col items-center justify-center rounded-md ${
              esHoy ? "bg-accent text-ink" : "bg-bg-elevated text-text-body"
            }`}
          >
            <span className="font-body text-[10px] font-bold uppercase">{mes}</span>
            <span className="font-display text-xl leading-none">{dia}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-body text-base font-bold text-text-strong">{sesion.titulo}</p>
              {esHoy && <Badge variant="success">Hoy</Badge>}
            </div>
            <p className="mt-0.5 font-body text-xs text-text-muted">{sesion.detalle}</p>
            <p className="mt-1.5 font-body text-[13px] text-text-body">
              <span className="font-semibold text-text-strong">{datos?.enLista ?? 0}</span> en
              lista ·{" "}
              <span className="font-semibold text-text-strong">{datos?.asistieron ?? 0}</span>{" "}
              vinieron ·{" "}
              <span className="font-semibold text-accent">
                {formatEuros(datos?.recaudado ?? 0)}
              </span>
            </p>
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 flex-none text-text-faint"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      </li>
    );
  }

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Intensivos y masterclass
      </h1>
      <p className="mt-1 font-body text-sm text-text-muted">
        Asistencia y cobro de las clases sueltas: quién se apuntó, quién vino y quién ha pagado.
      </p>

      {/* Totales de todo lo que se cobra en puerta */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft">
          <p className="font-body text-xs font-semibold text-text-muted">Recaudado</p>
          <p className="mt-1 font-display text-3xl text-accent">{formatEuros(totalRecaudado)}</p>
        </div>
        <div className="rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft">
          <p className="font-body text-xs font-semibold text-text-muted">Asistencias</p>
          <p className="mt-1 font-display text-3xl text-text-strong">{totalAsistentes}</p>
        </div>
      </div>

      <h2 className="mt-8 font-display text-2xl text-text-strong">Masterclass</h2>
      {masterclasses.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Ninguna todavía"
            description="Las masterclass salen de la pantalla de Eventos: crea una con tipo «masterclass» y aparece aquí con su lista."
          />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {masterclasses.map((sesion) => (
            <Tarjeta key={sesion.slug} sesion={sesion} />
          ))}
        </ul>
      )}

      <h2 className="mt-8 font-display text-2xl text-text-strong">Intensivos de agosto</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {intensivos.map((sesion) => (
          <Tarjeta key={sesion.slug} sesion={sesion} />
        ))}
      </ul>
    </>
  );
}
