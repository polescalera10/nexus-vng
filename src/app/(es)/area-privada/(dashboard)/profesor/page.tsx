import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getTeacherForUser } from "@/lib/queries/courses";
import { getTeacherAgenda, type TeacherSessionItem } from "@/lib/queries/attendance";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatDate,
  formatTime,
  SESSION_STATUS_LABELS,
  WEEKDAYS,
  WEEKDAYS_SHORT,
} from "@/lib/format";

/** "YYYY-MM-DD" → 1=Lun … 7=Dom (convención del proyecto). */
function isoWeekday(iso: string): number {
  const day = new Date(`${iso}T00:00:00`).getDay(); // 0=Dom … 6=Sáb
  return day === 0 ? 7 : day;
}

function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * Home del profesor: sus sesiones de HOY (titular o sustituto) como cards
 * grandes y pulsables — un tap y ya está pasando lista — más las de los
 * próximos 7 días en una lista compacta.
 */
export default async function ProfesorPage() {
  const { user } = await requireRole("profesor");

  const teacher = await getTeacherForUser(user.id);
  if (!teacher) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
          Hoy
        </h1>
        <div className="mt-8">
          <EmptyState
            title="Tu usuario no está vinculado a un perfil de profesor"
            description="Pide al admin que vincule tu usuario a tu ficha de profesor para ver aquí tus cursos."
          />
        </div>
      </>
    );
  }

  // `todayIso` es el día de Madrid con el que se repartieron las listas.
  const { todayIso, today, upcoming } = await getTeacherAgenda(teacher.id);

  return (
    <>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Hoy
      </h1>
      <p className="mt-2 font-body text-base text-text-muted">
        {WEEKDAYS[isoWeekday(todayIso)]}, {formatDate(todayIso)} · un tap y a pasar
        lista.
      </p>

      <div className="mt-8">
        {today.length === 0 ? (
          <EmptyState
            title="Hoy no tienes clases"
            description="Cuando tengas sesiones programadas para hoy aparecerán aquí. En «Próximas» puedes adelantarte a las de los próximos días."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {today.map((item) => (
              <li key={item.session.id}>
                <TodayCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-body text-sm font-bold uppercase tracking-wide text-text-muted">
          Próximas · 7 días
        </h2>
        <div className="mt-3">
          {upcoming.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              Sin sesiones en los próximos 7 días.
            </p>
          ) : (
            <ul className="divide-y divide-text-strong/6 overflow-hidden rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
              {upcoming.map((item) => (
                <li key={item.session.id}>
                  <UpcomingRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function TodayCard({ item }: { item: TeacherSessionItem }) {
  const { session, courseName, startTime, enrolledCount, attendanceTaken } = item;

  return (
    <Link
      href={`/area-privada/profesor/asistencia/${session.id}`}
      className="block touch-manipulation rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft transition-[transform,border-color] active:scale-[0.99] hover:border-accent/35"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-body text-lg font-bold text-text-strong">
            {courseName}
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            {formatTime(startTime)} · {enrolledCount}{" "}
            {enrolledCount === 1 ? "alumno" : "alumnos"}
          </p>
        </div>
        <Badge variant={session.status === "impartida" ? "success" : "neutral"}>
          {SESSION_STATUS_LABELS[session.status]}
        </Badge>
      </div>

      {attendanceTaken ? (
        <p className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-accent">
          <CheckIcon />
          Lista pasada
        </p>
      ) : (
        <p className="mt-4 font-body text-sm font-semibold text-accent">
          Pasar lista →
        </p>
      )}
    </Link>
  );
}

function UpcomingRow({ item }: { item: TeacherSessionItem }) {
  const { session, courseName, startTime, attendanceTaken } = item;

  return (
    <Link
      href={`/area-privada/profesor/asistencia/${session.id}`}
      className="flex min-h-14 touch-manipulation items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-bg-elevated/60 active:bg-bg-elevated"
    >
      <div className="min-w-0">
        <p className="truncate font-body text-sm font-semibold text-text-strong">
          {courseName}
        </p>
        <p className="mt-0.5 font-body text-xs text-text-muted">
          {WEEKDAYS_SHORT[isoWeekday(session.session_date)]}{" "}
          {formatDate(session.session_date)} · {formatTime(startTime)}
        </p>
      </div>
      {attendanceTaken ? (
        <span className="inline-flex items-center gap-1 font-body text-xs font-semibold text-accent">
          <CheckIcon className="size-3.5" />
          Lista pasada
        </span>
      ) : (
        <span aria-hidden="true" className="font-body text-sm text-text-faint">
          →
        </span>
      )}
    </Link>
  );
}
