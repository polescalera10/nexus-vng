import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getResumenIntensivos } from "@/lib/queries/intensivos";
import { intensivoSesiones, intensivoTitulo } from "@/content/intensivos";
import { formatEuros, todayInMadrid } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

/**
 * Índice del control de intensivos: las 8 sesiones del cartel en orden de
 * fecha, con los contadores de cada noche. La de hoy va arriba y destacada,
 * que es la que se abre con la clase empezando.
 */
export const dynamic = "force-dynamic";

export default async function IntensivosPage() {
  await requireRole("admin");

  const resumen = await getResumenIntensivos();
  const hoy = todayInMadrid();

  const totalRecaudado = [...resumen.values()].reduce((sum, r) => sum + r.recaudado, 0);
  const totalAsistentes = [...resumen.values()].reduce((sum, r) => sum + r.asistieron, 0);

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Intensivos
      </h1>
      <p className="mt-1 font-body text-sm text-text-muted">
        Asistencia y cobro de las 8 sesiones de agosto.
      </p>

      {/* Totales de la campaña completa */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft">
          <p className="font-body text-xs font-semibold text-text-muted">Recaudado</p>
          <p className="mt-1 font-display text-3xl text-accent">
            {formatEuros(totalRecaudado)}
          </p>
        </div>
        <div className="rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft">
          <p className="font-body text-xs font-semibold text-text-muted">Asistencias</p>
          <p className="mt-1 font-display text-3xl text-text-strong">{totalAsistentes}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {intensivoSesiones.map((sesion) => {
          const datos = resumen.get(sesion.value);
          const esHoy = sesion.fechaIso === hoy;
          const pasada = sesion.fechaIso < hoy;

          return (
            <li key={sesion.value}>
              <Link
                href={`/area-privada/admin/intensivos/${sesion.value}`}
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
                  <span className="font-body text-[10px] font-bold uppercase">
                    {sesion.dia.slice(0, 3)}
                  </span>
                  <span className="font-display text-xl leading-none">
                    {sesion.fechaIso.slice(8)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-body text-base font-bold text-text-strong">
                      {intensivoTitulo(sesion)}
                    </p>
                    {esHoy && <Badge variant="success">Hoy</Badge>}
                  </div>
                  <p className="mt-0.5 font-body text-xs text-text-muted">
                    {sesion.profes} · {sesion.hora}
                  </p>
                  <p className="mt-1.5 font-body text-[13px] text-text-body">
                    <span className="font-semibold text-text-strong">
                      {datos?.enLista ?? 0}
                    </span>{" "}
                    en lista ·{" "}
                    <span className="font-semibold text-text-strong">
                      {datos?.asistieron ?? 0}
                    </span>{" "}
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
        })}
      </ul>
    </>
  );
}
