import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { formatPoints } from "@/lib/format";
import { getStudentForUser } from "@/lib/queries/alumno";
import { getRankingAlumno, type RankingRow } from "@/lib/queries/ranking";

export const metadata = { title: "Ranking · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Ranking de puntos de la escuela.
 *
 * `force-dynamic` no es opcional aquí: las fotos son URLs firmadas que caducan
 * en una hora (bucket privado), así que una página cacheada acabaría sirviendo
 * enlaces muertos.
 */

/** Medalla del podio. El color va por token, nunca suelto. */
const PODIO = [
  { anillo: "ring-neon", texto: "text-neon", etiqueta: "1.º" },
  { anillo: "ring-neon-mint", texto: "text-neon-mint", etiqueta: "2.º" },
  { anillo: "ring-neon-lime", texto: "text-neon-lime", etiqueta: "3.º" },
] as const;

function Puntos({ valor, className = "" }: { valor: number; className?: string }) {
  return (
    <span className={`font-display ${className}`}>
      {formatPoints(valor)}
      <span className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
        pts
      </span>
    </span>
  );
}

/** Tarjeta de podio. `rango` es 0, 1 o 2. */
function CardPodio({ row, rango }: { row: RankingRow; rango: number }) {
  const estilo = PODIO[rango] ?? PODIO[2];
  const primero = rango === 0;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft ${
        row.isMe ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className={`rounded-full ring-2 ${estilo.anillo} p-1`}>
        <Avatar
          name={row.fullName}
          seed={row.studentId}
          src={row.avatarUrl}
          size={primero ? "xl" : "lg"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`font-display text-2xl leading-none ${estilo.texto}`}
          aria-label={`Puesto ${estilo.etiqueta}`}
        >
          {estilo.etiqueta}
        </p>
        <p className="mt-2 font-body text-base font-bold text-text-strong">
          {row.fullName}
          {row.isMe && (
            <Badge variant="success" className="ml-2 align-middle">
              Tú
            </Badge>
          )}
        </p>
        <Puntos
          valor={row.balance}
          className={primero ? "mt-1 block text-3xl text-accent" : "mt-1 block text-2xl text-accent"}
        />
      </div>
    </div>
  );
}

/** Fila del resto de la tabla, del 4.º en adelante. */
function FilaRanking({ row }: { row: RankingRow }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-sm px-3 py-2.5 ${
        row.isMe ? "bg-accent/10 ring-1 ring-accent" : ""
      }`}
    >
      <span className="w-9 shrink-0 font-display text-lg text-text-muted tabular-nums">
        {row.position}.º
      </span>
      <Avatar name={row.fullName} seed={row.studentId} src={row.avatarUrl} size="sm" />
      <span className="min-w-0 flex-1 font-body text-sm font-semibold text-text-strong">
        {row.fullName}
        {row.isMe && (
          <Badge variant="success" className="ml-2 align-middle">
            Tú
          </Badge>
        )}
      </span>
      <Puntos valor={row.balance} className="shrink-0 text-lg text-accent" />
    </li>
  );
}

export default async function RankingPage() {
  const { user } = await requireRole("alumno");
  const student = await getStudentForUser(user.id);

  if (!student) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Ranking
        </h1>
        <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
          Tu cuenta todavía no está enlazada a tu ficha de alumno, así que aún no
          apareces en el ranking. Díselo a tu profe en la próxima clase.
        </p>
      </>
    );
  }

  const { rows, me } = await getRankingAlumno(student.id);
  const podio = rows.slice(0, 3);
  const resto = rows.slice(3);

  return (
    <>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Puntos
      </span>
      <h1 className="mt-2 font-display text-[clamp(30px,5vw,48px)] text-text-strong">
        Ranking
      </h1>
      <p className="mt-3 max-w-[60ch] font-body text-base text-text-muted">
        Los puntos se ganan viniendo a clase, a las fiestas y a los congresos.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="El ranking está vacío"
            description="Todavía no hay nadie con puntos. En cuanto se pase la primera lista, esto se llena."
          />
        </div>
      ) : (
        <>
          {/* Dónde está quien mira, antes de tener que buscarse en la tabla. */}
          <div className="mt-8">
            {me ? (
              <Card title="Tu posición">
                <p className="font-display text-4xl text-accent">
                  {me.position}.º{" "}
                  <span className="font-body text-base font-semibold text-text-muted">
                    de {rows.length}
                  </span>
                </p>
                <Puntos valor={me.balance} className="mt-1 block text-xl text-text-strong" />
              </Card>
            ) : (
              <Card title="Tu posición">
                <p className="font-body text-sm text-text-muted">
                  {student.show_in_leaderboard
                    ? "Todavía no tienes puntos, así que no sales en la tabla. Al pasar lista en tu próxima clase entras."
                    : "Has elegido no aparecer en el ranking. Puedes volver a activarlo cuando quieras."}
                </p>
                <Link
                  href="/area-privada/alumno/perfil"
                  className="mt-3 inline-block font-body text-sm font-semibold text-accent hover:underline"
                >
                  Ir a mi perfil →
                </Link>
              </Card>
            )}
          </div>

          {/* Podio: el primero manda, el 2.º y el 3.º comparten fila. */}
          <h2 className="mt-10 font-display text-2xl text-text-strong">Podio</h2>
          <div className="mt-4 grid gap-3">
            {podio[0] && <CardPodio row={podio[0]} rango={0} />}
            {(podio[1] || podio[2]) && (
              <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]">
                {podio[1] && <CardPodio row={podio[1]} rango={1} />}
                {podio[2] && <CardPodio row={podio[2]} rango={2} />}
              </div>
            )}
          </div>

          {resto.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl text-text-strong">
                Toda la tabla
              </h2>
              <ul className="mt-4 divide-y divide-text-strong/6 rounded-lg border border-text-strong/8 bg-bg-panel p-2 shadow-soft">
                {resto.map((row) => (
                  <FilaRanking key={row.studentId} row={row} />
                ))}
              </ul>
            </>
          )}

          <p className="mt-6 max-w-[60ch] font-body text-xs text-text-faint">
            Solo aparecen los alumnos activos con puntos que han elegido aparecer aquí.
            Tú puedes dejar de aparecer desde tu perfil.
          </p>
        </>
      )}
    </>
  );
}
