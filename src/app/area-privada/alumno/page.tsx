import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/app/area-privada/SignOutButton";
import { requireRole } from "@/lib/auth";
import { getMyCourses, getStudentForUser } from "@/lib/queries/alumno";
import {
  getRewards,
  getStudentPoints,
  getStudentRedemptions,
} from "@/lib/queries/gamificacion";
import {
  DANCE_ROLE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  REDEMPTION_STATUS_LABELS,
  formatDate,
  formatPoints,
  formatTime,
  POINT_SOURCE_LABELS,
  WEEKDAYS,
} from "@/lib/format";
import { RewardCatalog } from "./RewardCatalog";

export const metadata = { title: "Mi área · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Área del alumno.
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
      <Shell email={user.email}>
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Ya casi
        </h1>
        <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
          Tu cuenta está creada, pero todavía no está enlazada a tu ficha de alumno.
          Escríbenos por WhatsApp o díselo a tu profe en la próxima clase y lo
          conectamos en un minuto.
        </p>
      </Shell>
    );
  }

  const [puntos, cursos, premios, canjes] = await Promise.all([
    getStudentPoints(student.id, 20),
    getMyCourses(student.id),
    getRewards(true),
    getStudentRedemptions(student.id),
  ]);

  return (
    <Shell email={user.email}>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Área privada
      </span>
      <h1 className="mt-2 font-display text-[clamp(30px,5vw,48px)] text-text-strong">
        Hola, {student.full_name.split(" ")[0]}
      </h1>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card title="Tus puntos">
          <p className="font-display text-5xl text-accent">
            {formatPoints(puntos.balance)}
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Se ganan viniendo a clase, a las fiestas y a los congresos.
          </p>
        </Card>

        <Card title="Tus clases" className="lg:col-span-2">
          {cursos.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Todavía no estás matriculado en ninguna clase.
            </p>
          ) : (
            <ul className="divide-y divide-text-strong/6">
              {cursos.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-body text-sm font-semibold text-text-strong">
                      {c.course?.name ?? "Clase eliminada"}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-text-muted">
                      {c.course
                        ? `${WEEKDAYS[c.course.weekday]} · ${formatTime(c.course.start_time)} · ${c.course.duration_min} min`
                        : ""}
                      {c.teacherName ? ` · con ${c.teacherName}` : ""}
                      {` · ${DANCE_ROLE_LABELS[c.role_in_course]}`}
                    </p>
                  </div>
                  <Badge variant={c.status === "activa" ? "success" : "neutral"}>
                    {ENROLLMENT_STATUS_LABELS[c.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Premios" className="lg:col-span-2">
          <RewardCatalog rewards={premios} balance={puntos.balance} />
        </Card>

        <div className="flex flex-col gap-4">
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

          <Card title="Movimientos">
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
      </div>
    </Shell>
  );
}

/** Cabecera común del área de alumno (no comparte shell con admin/profesor). */
function Shell({ email, children }: { email?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-text-strong/8 bg-bg-panel">
        <div className="container-nexus flex items-center justify-between py-4">
          <Logo size={22} />
          <div className="flex items-center gap-4">
            {email && (
              <span className="hidden font-body text-sm text-text-muted sm:inline">
                {email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container-nexus py-12">{children}</main>
    </div>
  );
}
