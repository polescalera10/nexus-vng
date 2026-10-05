import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { formatDate, formatPoints, todayInMadrid } from "@/lib/format";
import {
  getHistorialPuntos,
  getPointRules,
  getResumenPuntos,
  getStudentOptions,
  HISTORIAL_POR_PAGINA,
  type HistorialFila,
} from "@/lib/queries/gamificacion";
import { etiquetaMes } from "@/lib/puntos";
import { HistorialFiltros } from "./HistorialFiltros";

export const metadata = { title: "Historial de puntos · NEXUS VNG" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODIGO = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const MES = /^\d{4}-(0[1-9]|1[0-2])$/;

function param(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** Quién hizo el apunte, en palabras. */
function autor(f: HistorialFila): string {
  if (f.source === "canje") return "Canje del alumno";
  if (f.rule_code === "perfil_completo") return "Automático";
  return f.createdByName ?? "—";
}

/**
 * Historial de puntos de toda la escuela: quién ha dado qué, a quién y cuándo.
 * Es el libro mayor (`point_events`) tal cual, con filtros por alumno, motivo y
 * mes. Para corregir un apunte se va a la ficha del alumno: aquí solo se mira.
 */
export default async function HistorialPuntosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");

  const sp = await searchParams;
  // Lo que no tiene la forma esperada se ignora en vez de llegar a la consulta.
  const alumno = UUID.test(param(sp.alumno)) ? param(sp.alumno) : "";
  const regla = CODIGO.test(param(sp.regla)) ? param(sp.regla) : "";
  const mes = MES.test(param(sp.mes)) ? param(sp.mes) : "";
  const pagina = Math.max(1, Number.parseInt(param(sp.pagina), 10) || 1);

  const mesActual = todayInMadrid().slice(0, 7);

  const [{ filas, total }, resumen, alumnos, reglas] = await Promise.all([
    getHistorialPuntos({
      studentId: alumno || undefined,
      regla: regla || undefined,
      mes: mes || undefined,
      pagina,
    }),
    getResumenPuntos(mesActual),
    getStudentOptions(),
    getPointRules(),
  ]);

  const paginas = Math.max(1, Math.ceil(total / HISTORIAL_POR_PAGINA));
  const enlacePagina = (p: number) => {
    const q = new URLSearchParams();
    if (alumno) q.set("alumno", alumno);
    if (regla) q.set("regla", regla);
    if (mes) q.set("mes", mes);
    if (p > 1) q.set("pagina", String(p));
    const s = q.toString();
    return `/area-privada/admin/gamificacion/historial${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <Link
        href="/area-privada/admin/gamificacion"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Gamificación
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Historial de puntos
      </h1>
      <p className="mt-2 max-w-[56ch] font-body text-base text-text-muted">
        Todos los puntos dados y canjeados. Para corregir un apunte, ve a la ficha
        del alumno.
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: `Dados en ${etiquetaMes(mesActual).toLowerCase()}`,
            valor: `+${formatPoints(resumen.dadosEsteMes)}`,
            clase: "text-accent",
          },
          {
            label: `Canjeados en ${etiquetaMes(mesActual).toLowerCase()}`,
            valor: `−${formatPoints(resumen.canjeadosEsteMes)}`,
            clase: "text-text-strong",
          },
          {
            label: "En circulación (saldos vivos)",
            valor: formatPoints(resumen.enCirculacion),
            clase: "text-text-strong",
          },
        ].map((d) => (
          <div
            key={d.label}
            className="rounded-lg border border-text-strong/8 bg-bg-panel px-5 py-4 shadow-soft"
          >
            <dt className="font-body text-[13px] font-semibold text-text-muted">{d.label}</dt>
            <dd className={`mt-1 font-display text-3xl tabular-nums ${d.clase}`}>{d.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <HistorialFiltros
          alumnos={alumnos}
          reglas={reglas.map((r) => ({ code: r.code, label: r.label, active: r.active }))}
          valores={{ alumno, regla, mes }}
        />
      </div>

      <p className="mt-4 font-body text-sm text-text-muted">
        {total === 1 ? "1 apunte" : `${formatPoints(total)} apuntes`}
        {paginas > 1 && ` · página ${pagina} de ${paginas}`}
      </p>

      {filas.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Sin apuntes"
            description={
              alumno || regla || mes
                ? "No hay nada con estos filtros."
                : "Todavía no se han dado puntos. Se dan desde la ficha de cada alumno."
            }
          />
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas. Una tabla de seis columnas no cabe a 375px. */}
          <ul className="mt-3 flex flex-col gap-2 md:hidden">
            {filas.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-text-strong/8 bg-bg-panel p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/area-privada/admin/alumnos/${f.student_id}`}
                    className="min-w-0 truncate font-body text-sm font-bold text-text-strong hover:text-accent"
                  >
                    {f.studentName ?? "Alumno eliminado"}
                  </Link>
                  <span
                    className={`shrink-0 font-body text-[15px] font-bold tabular-nums ${
                      f.points > 0 ? "text-accent" : "text-text-muted"
                    }`}
                  >
                    {f.points > 0 ? "+" : "−"}
                    {formatPoints(Math.abs(f.points))}
                  </span>
                </div>
                <p className="mt-1 font-body text-sm text-text-body">{f.concept}</p>
                <p className="mt-1 font-body text-xs text-text-muted">
                  {formatDate(f.occurred_on)} · {autor(f)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden md:block">
            <Table>
              <THead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Alumno</Th>
                  <Th>Concepto</Th>
                  <Th>Motivo</Th>
                  <Th className="text-right">Puntos</Th>
                  <Th>Por</Th>
                </Tr>
              </THead>
              <TBody>
                {filas.map((f) => (
                  <Tr key={f.id}>
                    <Td className="whitespace-nowrap text-text-muted">
                      {formatDate(f.occurred_on)}
                    </Td>
                    <Td>
                      <Link
                        href={`/area-privada/admin/alumnos/${f.student_id}`}
                        className="font-semibold text-text-strong hover:text-accent"
                      >
                        {f.studentName ?? "Alumno eliminado"}
                      </Link>
                    </Td>
                    <Td className="max-w-80 truncate">{f.concept}</Td>
                    <Td>
                      {f.source === "canje" ? (
                        <Badge variant="warning">Canje</Badge>
                      ) : f.ruleLabel ? (
                        <Badge>{f.ruleLabel}</Badge>
                      ) : (
                        <span className="text-text-muted">A mano</span>
                      )}
                    </Td>
                    <Td
                      className={`text-right font-bold tabular-nums ${
                        f.points > 0 ? "text-accent" : "text-text-muted"
                      }`}
                    >
                      {f.points > 0 ? "+" : "−"}
                      {formatPoints(Math.abs(f.points))}
                    </Td>
                    <Td className="text-text-muted">{autor(f)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

          {paginas > 1 && (
            <nav
              aria-label="Páginas del historial"
              className="mt-4 flex items-center justify-between gap-3"
            >
              {pagina > 1 ? (
                <Link
                  href={enlacePagina(pagina - 1)}
                  className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-accent hover:underline"
                >
                  ← Más recientes
                </Link>
              ) : (
                <span />
              )}
              {pagina < paginas && (
                <Link
                  href={enlacePagina(pagina + 1)}
                  className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-accent hover:underline"
                >
                  Más antiguos →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
