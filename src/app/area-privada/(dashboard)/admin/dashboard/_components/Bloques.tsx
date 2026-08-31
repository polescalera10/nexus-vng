import { formatEuros, WEEKDAYS } from "@/lib/format";
import type { Aviso, ClaseNegocio, Negocio, Supuestos } from "@/lib/dashboard/negocio";

/**
 * Piezas visuales del Dashboard de negocio. Server Components puros: reciben
 * los números ya calculados por `lib/dashboard/negocio.ts` y solo los pintan.
 *
 * Regla de color del panel: el estado se codifica también en forma (barra,
 * badge, signo), nunca solo en color. Todo fondo accent/danger lleva `text-ink`.
 */

/** Barra de ocupación: rojo por debajo del 25 %, ámbar hasta el 50 %. */
export function colorOcupacion(ocupacion: number): string {
  if (ocupacion < 0.25) return "bg-danger";
  if (ocupacion < 0.5) return "bg-warning";
  return "bg-accent";
}

function signo(valor: number): string {
  return `${valor >= 0 ? "+" : "−"}${formatEuros(Math.abs(valor))}`;
}

/** Chip de margen: verde si la clase se paga sola, rojo si no. */
export function ChipMargen({ valor }: { valor: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs font-semibold tabular-nums ${
        valor >= 0 ? "bg-accent/12 text-accent" : "bg-danger/12 text-danger"
      }`}
    >
      {signo(valor)}
    </span>
  );
}

export function Kpi({
  label,
  value,
  nota,
  tono = "neutro",
}: {
  label: string;
  value: string;
  nota?: string;
  tono?: "neutro" | "bueno" | "malo";
}) {
  const color =
    tono === "bueno" ? "text-accent" : tono === "malo" ? "text-danger" : "text-text-strong";
  return (
    <div className="rounded-lg border border-text-strong/8 bg-bg-panel px-4 py-4 shadow-soft">
      <span className="block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      <span className={`mt-2 block font-display text-3xl leading-none tabular-nums ${color}`}>
        {value}
      </span>
      {nota && <span className="mt-2 block font-body text-[13px] text-text-muted">{nota}</span>}
    </div>
  );
}

/* ── Cuenta del mes ───────────────────────────────────────────────────────── */

function Linea({
  nombre,
  detalle,
  valor,
  maximo,
  tipo,
}: {
  nombre: string;
  detalle: string;
  valor: number;
  maximo: number;
  tipo: "entra" | "sale";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-body text-sm text-text-body">{nombre}</span>
        <span className="font-body text-[15px] font-semibold tabular-nums text-text-strong">
          {formatEuros(valor)}
        </span>
      </div>
      <span className="mt-0.5 block font-body text-xs text-text-muted">{detalle}</span>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-text-strong/8">
        <div
          className={`h-full rounded-full ${tipo === "entra" ? "bg-accent" : "bg-danger/80"}`}
          style={{ width: `${maximo > 0 ? (valor / maximo) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export function CuentaDelMes({
  negocio,
  supuestos,
}: {
  negocio: Negocio;
  supuestos: Supuestos;
}) {
  const maximo = Math.max(
    negocio.ingresos,
    negocio.costeProfesorado,
    supuestos.alquiler,
    supuestos.otros,
    1,
  );
  const cobertura = Math.round(negocio.cobertura * 100);
  const libres = negocio.plazas - negocio.plazasOcupadas;

  return (
    <div className="grid gap-6 rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft lg:grid-cols-2">
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Entra
        </p>
        <div className="mt-3">
          <Linea
            nombre="Cuotas de alumnos"
            detalle={`${negocio.alumnosConClase} alumnos con matrícula · ${negocio.fundadores} con plaza fundadora`}
            valor={negocio.ingresos}
            maximo={maximo}
            tipo="entra"
          />
        </div>

        <p className="mt-6 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Sale
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <Linea
            nombre="Profesorado"
            detalle={`${negocio.clases.length} clases × ${supuestos.semanas} semanas`}
            valor={negocio.costeProfesorado}
            maximo={maximo}
            tipo="sale"
          />
          <Linea
            nombre="Alquiler de sala"
            detalle="fijo mensual"
            valor={supuestos.alquiler}
            maximo={maximo}
            tipo="sale"
          />
          {supuestos.otros > 0 && (
            <Linea
              nombre="Otros gastos"
              detalle="los que has añadido arriba"
              valor={supuestos.otros}
              maximo={maximo}
              tipo="sale"
            />
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-text-strong/10 pt-4">
          <span className="font-body text-[13px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            Resultado
          </span>
          <span
            className={`font-display text-3xl tabular-nums ${
              negocio.resultado >= 0 ? "text-accent" : "text-danger"
            }`}
          >
            {signo(negocio.resultado)}
          </span>
        </div>
      </div>

      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Punto de equilibrio
        </p>
        <p className="mt-3 font-body text-sm text-text-body">
          Las cuotas cubren{" "}
          <b className="font-semibold tabular-nums text-text-strong">{cobertura} %</b> de lo que
          cuesta abrir cada mes.
        </p>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-text-strong/8"
          role="img"
          aria-label={`Las cuotas cubren el ${cobertura} % de los gastos`}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${cobertura}%` }} />
        </div>
        {negocio.deficit > 0 ? (
          <p className="mt-4 font-body text-sm text-text-body">
            Quedan <b className="font-semibold text-text-strong">{libres}</b> plazas libres en el
            horario. El problema no es el aforo, es llenarlo.
          </p>
        ) : (
          <p className="mt-4 font-body text-sm text-text-body">
            El mes se sostiene con un margen de{" "}
            <b className="font-semibold text-text-strong">{formatEuros(negocio.resultado)}</b>.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── La semana ────────────────────────────────────────────────────────────── */

function Celda({ clase }: { clase: ClaseNegocio | undefined }) {
  if (!clase) {
    return <div className="rounded-sm border border-dashed border-text-strong/8" />;
  }
  const pct = Math.round(clase.ocupacion * 100);
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-text-strong/8 bg-bg-elevated/40 p-3">
      <span className="font-body text-sm font-semibold text-text-strong">
        {clase.nombre}
        {clase.esCompania && (
          <span className="ml-1.5 font-normal text-xs text-neon-mint">Cía</span>
        )}
      </span>
      <span className="font-body text-[11px] text-text-muted">
        {clase.profesores.length > 0
          ? clase.profesores.map((p) => p.nombre).join(" + ")
          : "sin profesor asignado"}
      </span>
      <div className="flex items-baseline justify-between font-body text-xs tabular-nums text-text-muted">
        <span>
          <b className="text-[15px] font-semibold text-text-strong">{clase.alumnos}</b>/
          {clase.aforo}
        </span>
        <span>{pct} %</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-text-strong/8">
        <div
          className={`h-full rounded-full ${colorOcupacion(clase.ocupacion)}`}
          style={{ width: `${Math.max(pct, clase.alumnos > 0 ? 3 : 0)}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-body text-[11px] tabular-nums text-text-muted">
          {formatEuros(clase.costeMes)}/mes
        </span>
        <ChipMargen valor={clase.margenMes} />
      </div>
    </div>
  );
}

export function SemanaGrid({ clases }: { clases: ClaseNegocio[] }) {
  const dias = [...new Set(clases.map((c) => c.weekday))].sort((a, b) => a - b);
  const horas = [...new Set(clases.map((c) => c.hora))].sort();

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid min-w-max gap-2"
        style={{ gridTemplateColumns: `3.5rem repeat(${dias.length}, minmax(10.5rem, 1fr))` }}
      >
        <div />
        {dias.map((d) => (
          <div
            key={d}
            className="pb-1 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted"
          >
            {WEEKDAYS[d]}
          </div>
        ))}
        {horas.map((hora) => (
          <Fila key={hora} hora={hora} dias={dias} clases={clases} />
        ))}
      </div>
    </div>
  );
}

function Fila({
  hora,
  dias,
  clases,
}: {
  hora: string;
  dias: number[];
  clases: ClaseNegocio[];
}) {
  return (
    <>
      <div className="pt-3 font-body text-xs tabular-nums text-text-muted">{hora}</div>
      {dias.map((dia) => (
        <Celda
          key={`${dia}-${hora}`}
          clase={clases.find((c) => c.weekday === dia && c.hora === hora)}
        />
      ))}
    </>
  );
}

/* ── Avisos ───────────────────────────────────────────────────────────────── */

const BORDE: Record<Aviso["nivel"], string> = {
  critico: "border-l-danger",
  atencion: "border-l-warning",
  info: "border-l-accent",
};

export function Avisos({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-text-strong/12 px-5 py-8 text-center font-body text-sm text-text-muted">
        Nada que revisar: ninguna clase vacía, ninguna cuota pendiente y todas las tarifas
        definidas.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {avisos.map((aviso) => (
        <div
          key={aviso.id}
          className={`rounded-sm border border-l-[3px] border-text-strong/8 bg-bg-panel p-4 ${BORDE[aviso.nivel]}`}
        >
          <p className="font-body text-sm font-semibold text-text-strong">{aviso.titulo}</p>
          <p className="mt-1 font-body text-[13px] text-text-muted">{aviso.detalle}</p>
        </div>
      ))}
    </div>
  );
}
