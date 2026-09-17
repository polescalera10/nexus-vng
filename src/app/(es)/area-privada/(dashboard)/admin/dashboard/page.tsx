import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { avisosDe, calcularNegocio, type Supuestos } from "@/lib/dashboard/negocio";
import { SUPUESTOS_BASE } from "@/lib/dashboard/tarifas";
import {
  formatEuros,
  LEAD_ESTADO_LABELS,
  LEAD_ORIGEN_LABELS,
  WEEKDAYS,
  WEEKDAYS_SHORT,
} from "@/lib/format";
import { getDatosNegocio } from "@/lib/queries/negocio";
import {
  Avisos,
  ChipMargen,
  colorOcupacion,
  CuentaDelMes,
  Kpi,
  SemanaGrid,
} from "./_components/Bloques";
import { SupuestosForm } from "./SupuestosForm";

/**
 * Dashboard de negocio del curso regular.
 *
 * Responde de un vistazo a "¿cómo va la escuela?": qué entra, qué sale, qué
 * clase se sostiene sola y qué hay que mirar hoy. Los intensivos quedan fuera
 * a propósito (Pol, 31-08-2026): fueron un producto de agosto que ya terminó.
 *
 * Datos en vivo: sin caché, cada visita relee Supabase.
 */
export const dynamic = "force-dynamic";

type Orden = "margen" | "dia" | "alumnos";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "margen", etiqueta: "Peor margen primero" },
  { valor: "dia", etiqueta: "Por día y hora" },
  { valor: "alumnos", etiqueta: "Más llenas primero" },
];

/** Lee un número de la URL; fuera de rango o ausente, vuelve al valor base. */
function numeroDe(valor: string | undefined, base: number, min: number, max: number): number {
  const n = Number(valor);
  if (!valor || !Number.isFinite(n)) return base;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export default async function DashboardNegocioPage({
  searchParams,
}: {
  searchParams: Promise<{ alquiler?: string; semanas?: string; otros?: string; orden?: string }>;
}) {
  await requireRole("admin");

  const params = await searchParams;
  const supuestos: Supuestos = {
    alquiler: numeroDe(params.alquiler, SUPUESTOS_BASE.alquiler, 0, 100000),
    semanas: numeroDe(params.semanas, SUPUESTOS_BASE.semanas, 1, 5),
    otros: numeroDe(params.otros, SUPUESTOS_BASE.otros, 0, 100000),
  };
  const orden: Orden =
    params.orden === "dia" || params.orden === "alumnos" ? params.orden : "margen";

  const { cursos, alumnos, embudo } = await getDatosNegocio();
  const negocio = calcularNegocio(cursos, alumnos, supuestos);
  const avisos = avisosDe(negocio);

  if (negocio.clases.length === 0) {
    return (
      <>
        <Cabecera />
        <div className="mt-8">
          <EmptyState
            title="Todavía no hay clases activas"
            description="El dashboard se llena solo en cuanto haya cursos con matrículas. Empieza dando de alta el horario."
            action={
              <Link
                href="/area-privada/admin/cursos"
                className="font-body text-[13px] font-semibold text-accent hover:underline"
              >
                Ir a Cursos →
              </Link>
            }
          />
        </div>
      </>
    );
  }

  const clasesOrdenadas = [...negocio.clases].sort((a, b) => {
    if (orden === "dia") return a.weekday - b.weekday || a.hora.localeCompare(b.hora);
    if (orden === "alumnos") return b.alumnos - a.alumnos;
    return a.margenMes - b.margenMes;
  });

  const porCuota = new Map<number, number>();
  for (const a of negocio.alumnos) porCuota.set(a.cuota, (porCuota.get(a.cuota) ?? 0) + 1);
  const tramos = [...porCuota.entries()].sort((a, b) => a[0] - b[0]);

  const nombrePorCurso = new Map(negocio.clases.map((c) => [c.id, c]));

  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    if (supuestos.alquiler !== SUPUESTOS_BASE.alquiler) p.set("alquiler", String(supuestos.alquiler));
    if (supuestos.semanas !== SUPUESTOS_BASE.semanas) p.set("semanas", String(supuestos.semanas));
    if (supuestos.otros !== SUPUESTOS_BASE.otros) p.set("otros", String(supuestos.otros));
    for (const [k, v] of Object.entries(patch)) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <Cabecera
        resumen={`${negocio.clases.length} clases · ${negocio.alumnos.length} alumnos · ${negocio.plazasOcupadas} matrículas`}
      />

      <div className="mt-6">
        <SupuestosForm values={supuestos} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi
          label="Ingresos previstos"
          value={formatEuros(negocio.ingresos)}
          nota={`cuotas de ${negocio.alumnosConClase} alumnos`}
        />
        <Kpi
          label="Gastos"
          value={formatEuros(negocio.gastos)}
          nota={`${formatEuros(negocio.costeProfesorado)} profesorado + ${formatEuros(supuestos.alquiler + supuestos.otros)} sala y otros`}
        />
        <Kpi
          label="Resultado"
          value={`${negocio.resultado >= 0 ? "+" : "−"}${formatEuros(Math.abs(negocio.resultado))}`}
          nota="al mes, con las matrículas de hoy"
          tono={negocio.resultado >= 0 ? "bueno" : "malo"}
        />
        <Kpi
          label="Ocupación"
          value={`${Math.round(negocio.ocupacion * 100)} %`}
          nota={`${negocio.plazasOcupadas} de ${negocio.plazas} plazas`}
        />
        <Kpi
          label="Cuota media"
          value={formatEuros(
            negocio.alumnosConClase > 0 ? negocio.ingresos / negocio.alumnosConClase : 0,
          )}
          nota="por alumno con clase asignada"
        />
        <Kpi
          label="Coste por alumno"
          value={formatEuros(
            negocio.alumnos.length > 0 ? negocio.gastos / negocio.alumnos.length : 0,
          )}
          nota={`gasto total ÷ ${negocio.alumnos.length} alumnos`}
        />
      </div>

      <Seccion
        titulo="La cuenta del mes"
        descripcion="Cuotas frente a coste de profesorado y sala. Es lo previsto con las matrículas de hoy, no lo cobrado."
      >
        <CuentaDelMes negocio={negocio} supuestos={supuestos} />
      </Seccion>

      <Seccion
        titulo="La semana"
        descripcion="Cada celda es una clase activa. La barra es ocupación sobre el aforo de la clase."
      >
        <SemanaGrid clases={negocio.clases} />
      </Seccion>

      <Seccion
        titulo="Clase a clase"
        descripcion="El ingreso de cada clase sale de repartir la cuota del alumno entre las clases a las que va. Con margen negativo, la clase no se sostiene sola."
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {ORDENES.map((o) => (
            <Link
              key={o.valor}
              href={qs({ orden: o.valor })}
              scroll={false}
              aria-current={orden === o.valor ? "true" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 font-body text-[13px] font-semibold transition-colors ${
                orden === o.valor
                  ? "bg-accent text-ink"
                  : "border border-text-strong/12 text-text-muted hover:text-text-strong"
              }`}
            >
              {o.etiqueta}
            </Link>
          ))}
        </div>

        <Table>
          <THead>
            <Tr>
              <Th>Clase</Th>
              <Th>Profesorado</Th>
              <Th className="text-right">Alumnos</Th>
              <Th className="text-right">Ocupación</Th>
              <Th className="text-right">Coste/mes</Th>
              <Th className="text-right">Ingreso</Th>
              <Th className="text-right">Margen</Th>
            </Tr>
          </THead>
          <TBody>
            {clasesOrdenadas.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <Link
                    href={`/area-privada/admin/cursos/${c.id}`}
                    className="font-semibold text-text-strong hover:text-accent"
                  >
                    {c.nombre}
                  </Link>
                  {c.esCompania && <span className="ml-1.5 text-xs text-neon-mint">Cía</span>}
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {WEEKDAYS[c.weekday]} {c.hora}
                    {c.nivel ? ` · ${c.nivel}` : ""}
                  </span>
                </Td>
                <Td className="text-xs text-text-muted">
                  {c.profesores.length === 0
                    ? "sin profesor asignado"
                    : c.profesores
                        .map((p) =>
                          p.tarifa === null
                            ? `${p.nombre} (tarifa sin definir)`
                            : p.tarifa === 0
                              ? `${p.nombre} (no cobra)`
                              : `${p.nombre} ${p.tarifa} €/h`,
                        )
                        .join(" · ")}
                </Td>
                <Td className="text-right tabular-nums">
                  {c.alumnos}
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {c.leaders} L · {c.followers} F
                  </span>
                </Td>
                <Td className="text-right tabular-nums">
                  {Math.round(c.ocupacion * 100)} %
                  <span className="mt-1 block h-1.5 w-16 overflow-hidden rounded-full bg-text-strong/8">
                    <span
                      className={`block h-full rounded-full ${colorOcupacion(c.ocupacion)}`}
                      style={{ width: `${Math.round(c.ocupacion * 100)}%` }}
                    />
                  </span>
                </Td>
                <Td className="text-right tabular-nums">{formatEuros(c.costeMes)}</Td>
                <Td className="text-right tabular-nums">{formatEuros(c.ingresoMes)}</Td>
                <Td className="text-right">
                  <ChipMargen valor={c.margenMes} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Seccion>

      <Seccion
        titulo="Profesorado"
        descripcion="Horas semanales y coste mensual por profesor, a las tarifas acordadas. Quien no cobra no aparece."
      >
        <Table>
          <THead>
            <Tr>
              <Th>Profesor</Th>
              <Th>Tarifas</Th>
              <Th className="text-right">Clases/sem</Th>
              <Th className="text-right">€/semana</Th>
              <Th className="text-right">€/mes</Th>
              <Th className="text-right">% del coste</Th>
            </Tr>
          </THead>
          <TBody>
            {negocio.profesores.map((p) => (
              <Tr key={p.id}>
                <Td className="font-semibold text-text-strong">{p.nombre}</Td>
                <Td className="text-xs text-text-muted">
                  {p.tarifas.map((t) => `${t} €/h`).join(" · ")}
                </Td>
                <Td className="text-right tabular-nums">{p.clases}</Td>
                <Td className="text-right tabular-nums">{formatEuros(p.costeSemana)}</Td>
                <Td className="text-right tabular-nums">{formatEuros(p.costeMes)}</Td>
                <Td className="text-right tabular-nums">{Math.round(p.porcentaje)} %</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Seccion>

      <Seccion
        titulo="Quién paga qué"
        descripcion="Cuota mensual según el modelo de la web: 35 € el primer estilo, +20 € por cada estilo extra y tope en 100 €. Socio fundador, 85 € planos."
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tramos.map(([cuota, cuantos]) => (
            <Kpi
              key={cuota}
              label={cuota === 0 ? "Sin clase asignada" : `${formatEuros(cuota)} al mes`}
              value={String(cuantos)}
              nota={`${cuantos === 1 ? "alumno" : "alumnos"} · ${formatEuros(cuota * cuantos)}`}
            />
          ))}
        </div>

        <Table>
          <THead>
            <Tr>
              <Th>Alumno</Th>
              <Th>Rol</Th>
              <Th className="text-right">Clases</Th>
              <Th className="text-right">Estilos</Th>
              <Th>Va a</Th>
              <Th className="text-right">Cuota/mes</Th>
            </Tr>
          </THead>
          <TBody>
            {[...negocio.alumnos]
              .sort((a, b) => b.cuota - a.cuota || a.nombre.localeCompare(b.nombre, "es"))
              .map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link
                      href={`/area-privada/admin/alumnos/${a.id}`}
                      className="font-semibold text-text-strong hover:text-accent"
                    >
                      {a.nombre}
                    </Link>
                    {a.fundador && (
                      <span className="ml-1.5 text-xs font-semibold text-warning">Fundador</span>
                    )}
                  </Td>
                  <Td className="text-xs text-text-muted">
                    {a.rol === "leader" ? "Leader" : "Follower"}
                  </Td>
                  <Td className="text-right tabular-nums">{a.cursoIds.length}</Td>
                  <Td className="text-right tabular-nums">{a.estilos}</Td>
                  <Td className="text-xs text-text-muted">
                    {a.cursoIds.length === 0
                      ? "— sin matrícula activa"
                      : a.cursoIds
                          .map((id) => {
                            const c = nombrePorCurso.get(id);
                            return c ? `${c.nombre} ${WEEKDAYS_SHORT[c.weekday]}` : "";
                          })
                          .filter(Boolean)
                          .join(", ")}
                    {a.enEspera > 0 && (
                      <span className="ml-1.5 text-warning">
                        · {a.enEspera} en lista de espera
                      </span>
                    )}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {a.cursoIds.length > 0 ? formatEuros(a.cuota) : "—"}
                  </Td>
                </Tr>
              ))}
          </TBody>
        </Table>
      </Seccion>

      <Seccion
        titulo="De dónde salen"
        descripcion="Leads del curso regular y de la plaza fundadora. Los del intensivo de agosto no cuentan aquí."
      >
        {embudo.length === 0 ? (
          <p className="rounded-lg border border-dashed border-text-strong/12 px-5 py-8 text-center font-body text-sm text-text-muted">
            Todavía no hay leads de curso regular.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {embudo.map((f) => (
              <Kpi
                key={`${f.origen}-${f.estado}`}
                label={`${LEAD_ORIGEN_LABELS[f.origen] ?? f.origen} · ${LEAD_ESTADO_LABELS[f.estado] ?? f.estado}`}
                value={String(f.total)}
              />
            ))}
          </div>
        )}
      </Seccion>

      <Seccion titulo="A revisar">
        <Avisos avisos={avisos} />
      </Seccion>

      <p className="mt-10 font-body text-xs text-text-muted">
        Las tarifas de profesorado y el alquiler no están en la base de datos: viven en{" "}
        <code className="text-text-body">lib/dashboard/tarifas.ts</code>. Todo lo demás se lee de
        Supabase en cada visita.
      </p>
    </>
  );
}

function Cabecera({ resumen }: { resumen?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">Dashboard</h1>
        <p className="mt-1 font-body text-sm text-text-muted">
          Cómo va el curso regular: clases, gente apuntada, ingresos y gastos.
        </p>
      </div>
      {resumen && <p className="font-body text-[13px] tabular-nums text-text-muted">{resumen}</p>}
    </div>
  );
}

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-body text-[15px] font-bold text-text-strong">{titulo}</h2>
      {descripcion && (
        <p className="mt-1 mb-4 max-w-[62ch] font-body text-[13px] text-text-muted">
          {descripcion}
        </p>
      )}
      <div className={descripcion ? "" : "mt-4"}>{children}</div>
    </section>
  );
}
