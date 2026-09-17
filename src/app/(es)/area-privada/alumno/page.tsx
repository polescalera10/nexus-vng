import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth";
import { getMyCourses, getStudentForUser } from "@/lib/queries/alumno";
import { getProximaClase } from "@/lib/queries/diario";
import { getEventos } from "@/lib/queries/eventos";
import {
  getPointRule,
  getRewards,
  getStudentPoints,
  getStudentRedemptions,
} from "@/lib/queries/gamificacion";
import { camposPendientes, listaPendientes } from "@/lib/perfil-completo";
import { Onboarding } from "./Onboarding";
import {
  DANCE_ROLE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  EVENTO_TIPO_LABELS,
  formatDate,
  formatDateTime,
  formatPoints,
  formatSessionDay,
  formatTime,
  POINT_SOURCE_LABELS,
  REDEMPTION_STATUS_LABELS,
  WEEKDAYS,
} from "@/lib/format";
import { RewardCatalog } from "./RewardCatalog";

export const metadata = { title: "Mi área · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Área del alumno.
 *
 * Orden deliberado: lo primero es cuándo vuelve a clase y qué se dio en las
 * suyas; los puntos y los premios van al final. Antes era al revés y el 70%
 * de la pantalla lo ocupaba la gamificación, que es la parte que menos usa
 * quien entra a repasar la secuencia del martes.
 *
 * Un usuario con rol `alumno` puede existir sin ficha en `students` (por
 * ejemplo si se registró por su cuenta): en ese caso se le explica qué falta
 * en vez de enseñarle un panel vacío que parece roto.
 */
export default async function AlumnoPage() {
  const { user } = await requireRole("alumno");
  const student = await getStudentForUser(user.id);

  if (!student) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Ya casi
        </h1>
        <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
          Tu cuenta está creada, pero todavía no está enlazada a tu ficha de alumno.
          Escríbenos por WhatsApp o díselo a tu profe en la próxima clase y lo
          conectamos en un minuto.
        </p>
      </>
    );
  }

  const [puntos, cursos, premios, canjes, proxima, eventos, reglaPerfil] =
    await Promise.all([
      getStudentPoints(student.id, 20),
      getMyCourses(student.id),
      getRewards(true),
      getStudentRedemptions(student.id),
      getProximaClase(student.id),
      getEventos(),
      getPointRule("perfil_completo"),
    ]);

  // Los puntos los concede el trigger de 0045d leyendo esta misma regla. Si
  // Pol la apaga desde el panel, aquí deja de prometerse nada.
  const pendientes = camposPendientes(student);
  const premioPerfil = reglaPerfil?.points ?? 0;
  const pidePerfil = pendientes.length > 0 && premioPerfil > 0;

  // `getEventos()` los devuelve por fecha ascendente, pasados incluidos.
  const ahora = Date.now();
  const proximosEventos = eventos
    .filter((e) => new Date(e.fecha_fin ?? e.fecha).getTime() >= ahora)
    .slice(0, 4);

  const canjesPendientes = canjes.filter((c) => c.status === "solicitado").length;

  return (
    <>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Área privada
      </span>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Hola, {student.full_name.split(" ")[0]}
        </h1>
        {student.payment_status === "pendiente" && (
          <Badge variant="warning">Cuota pendiente</Badge>
        )}
        {student.is_founding_member && <Badge variant="success">Socia fundadora</Badge>}
      </div>

      {/* La bienvenida sale una sola vez; el recordatorio de abajo es el que
          insiste mientras falten datos. */}
      {student.onboarding_seen_at === null && (
        <Onboarding
          nombre={student.full_name.split(" ")[0] ?? ""}
          pendientes={pendientes}
          puntosPremio={premioPerfil}
        />
      )}

      {pidePerfil && (
        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/8 p-5">
          <p className="font-body text-base font-bold text-text-strong">
            Completa tu perfil y suma {premioPerfil} puntos
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Nos faltan {listaPendientes(pendientes)}.
          </p>
          <Link
            href="/area-privada/alumno/perfil"
            className="mt-3 inline-block font-body text-sm font-semibold text-accent hover:underline"
          >
            Completar mi perfil →
          </Link>
        </div>
      )}

      {/* ── Próxima clase ──────────────────────────────────────────────────── */}
      {proxima && (
        <div className="mt-8">
          <Card
            title="Tu próxima clase"
            action={
              proxima.status === "cancelada" ? (
                <Badge variant="danger">Cancelada</Badge>
              ) : null
            }
          >
            <p className="font-display text-3xl text-accent">
              {formatSessionDay(proxima.session_date)} · {formatTime(proxima.start_time)}
            </p>
            <p className="mt-2 font-body text-base text-text-strong">
              {proxima.courseName}
              {proxima.teacherNames.length > 0 && (
                <span className="font-normal text-text-muted">
                  {" "}
                  · con {proxima.teacherNames.join(" y ")}
                </span>
              )}
            </p>
            {proxima.status === "cancelada" ? (
              <p className="mt-3 font-body text-sm text-danger">
                Esta clase está cancelada. No hace falta que vengas.
              </p>
            ) : (
              <p className="mt-1 font-body text-sm text-text-muted">
                {formatDate(proxima.session_date)}
              </p>
            )}
            <div className="mt-4">
              <Link
                href={`/area-privada/alumno/clase/${proxima.courseId}`}
                className="font-body text-sm font-semibold text-accent hover:underline"
              >
                Ver lo que dimos la última vez →
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tus clases ─────────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-2xl text-text-strong">Tus clases</h2>

      {cursos.length === 0 ? (
        <p className="mt-3 font-body text-sm text-text-muted">
          Todavía no estás matriculado en ninguna clase. Habla con tu profe o
          escríbenos por WhatsApp.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {cursos.map((c) => {
            const contenido = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-body text-base font-bold text-text-strong">
                    {c.course?.name ?? "Clase eliminada"}
                  </p>
                  <Badge variant={c.status === "activa" ? "success" : "neutral"}>
                    {ENROLLMENT_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
                <p className="mt-1.5 font-body text-sm text-text-muted">
                  {c.course
                    ? `${WEEKDAYS[c.course.weekday]} · ${formatTime(c.course.start_time)} · ${c.course.duration_min} min`
                    : ""}
                  {c.teacherNames.length > 0 && <> · con {c.teacherNames.join(" y ")}</>}
                </p>
                <p className="mt-0.5 font-body text-xs text-text-faint">
                  Bailas de {DANCE_ROLE_LABELS[c.role_in_course] ?? c.role_in_course}
                </p>
              </>
            );

            // Sin curso (borrado) no hay a dónde ir: se pinta sin enlace.
            return (
              <li key={c.id}>
                {c.course ? (
                  <Link
                    href={`/area-privada/alumno/clase/${c.course.id}`}
                    className="block h-full rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft transition-colors hover:border-accent/40 hover:bg-bg-elevated"
                  >
                    {contenido}
                    <p className="mt-3 font-body text-sm font-semibold text-accent">
                      Ver el diario de la clase →
                    </p>
                  </Link>
                ) : (
                  <div className="h-full rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft">
                    {contenido}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Próximos eventos ───────────────────────────────────────────────── */}
      {proximosEventos.length > 0 && (
        <>
          <h2 className="mt-12 font-display text-2xl text-text-strong">
            Próximos eventos
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]">
            {proximosEventos.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/eventos/${e.slug}`}
                  className="block h-full rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft transition-colors hover:border-accent/40 hover:bg-bg-elevated"
                >
                  <Badge>{EVENTO_TIPO_LABELS[e.tipo]}</Badge>
                  <p className="mt-2.5 font-body text-base font-bold text-text-strong">
                    {e.titulo}
                  </p>
                  <p className="mt-1 font-body text-sm text-text-muted">
                    {formatDateTime(e.fecha)}
                    {e.ubicacion && <> · {e.ubicacion}</>}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── Puntos y premios ───────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-2xl text-text-strong">
        Puntos y premios
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Tus puntos">
          <p className="font-display text-5xl text-accent">
            {formatPoints(puntos.balance)}
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Se ganan viniendo a clase, a las fiestas y a los congresos.
          </p>
          {canjesPendientes > 0 && (
            <p className="mt-3 font-body text-sm text-warning">
              Tienes {canjesPendientes}{" "}
              {canjesPendientes === 1 ? "premio pendiente" : "premios pendientes"} de
              recoger.
            </p>
          )}
          <Link
            href="/area-privada/alumno/ranking"
            className="mt-4 inline-block font-body text-sm font-semibold text-accent hover:underline"
          >
            Ver el ranking →
          </Link>
        </Card>

        <Card title="Premios" className="lg:col-span-2">
          <RewardCatalog rewards={premios} balance={puntos.balance} />
        </Card>

        <Card title="Tus canjes">
          {canjes.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Todavía no has pedido ningún premio.
            </p>
          ) : (
            <ul className="divide-y divide-text-strong/6">
              {canjes.map((c) => (
                <li key={c.id} className="flex items-baseline gap-2 py-2.5">
                  <span className="min-w-0 flex-1 font-body text-sm text-text-body">
                    {c.rewardName ?? "Premio retirado"}
                  </span>
                  <Badge
                    variant={
                      c.status === "entregado"
                        ? "success"
                        : c.status === "cancelado"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {REDEMPTION_STATUS_LABELS[c.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Movimientos" className="lg:col-span-2">
          {puntos.events.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Aún no tienes movimientos.
            </p>
          ) : (
            <ul className="divide-y divide-text-strong/6">
              {puntos.events.map((e) => (
                <li key={e.id} className="flex items-baseline gap-3 py-2.5">
                  <span
                    className={`w-14 shrink-0 font-body text-sm font-bold ${
                      e.points >= 0 ? "text-accent" : "text-danger"
                    }`}
                  >
                    {e.points >= 0 ? "+" : ""}
                    {formatPoints(e.points)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-body text-sm text-text-body">
                      {e.concept}
                    </span>
                    <span className="block font-body text-xs text-text-muted">
                      {formatDate(e.occurred_on)} · {POINT_SOURCE_LABELS[e.source]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
