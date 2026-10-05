import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getMyCourses } from "@/lib/queries/alumno";
import { getProximaClase } from "@/lib/queries/diario";
import { getEventos } from "@/lib/queries/eventos";
import {
  DANCE_ROLE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  EVENTO_TIPO_LABELS,
  formatDate,
  formatDateTime,
  formatSessionDay,
  formatTime,
  WEEKDAYS,
} from "@/lib/format";

/**
 * ⏸ APAGADO desde el 05-10-2026 (decisión de Pol).
 *
 * Es el bloque de clases del Inicio del alumno tal como estaba: próxima clase,
 * sus grupos con enlace al diario y próximos eventos. Se sacó de la página sin
 * borrarlo porque el área del alumno se centra de momento solo en puntos y
 * perfil. Para volver a enseñarlo:
 *   1. descomentar `<ClasesYEventos>` en `alumno/page.tsx`;
 *   2. poner `DIARIO_DE_CLASE_VISIBLE = true` en `lib/alumno-secciones.ts`;
 *   3. quitar los `test.skip` del diario en `tests/e2e-private/alumno.spec.ts`.
 *
 * Se mantiene como componente (y no como JSX comentado) para que siga pasando
 * por `tsc`: un bloque comentado se pudre en silencio con cada cambio de tipos.
 */
export async function ClasesYEventos({ studentId }: { studentId: string }) {
  const [cursos, proxima, eventos] = await Promise.all([
    getMyCourses(studentId),
    getProximaClase(studentId),
    getEventos(),
  ]);

  // `getEventos()` los devuelve por fecha ascendente, pasados incluidos.
  const ahora = Date.now();
  const proximosEventos = eventos
    .filter((e) => new Date(e.fecha_fin ?? e.fecha).getTime() >= ahora)
    .slice(0, 4);

  return (
    <>
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
    </>
  );
}
