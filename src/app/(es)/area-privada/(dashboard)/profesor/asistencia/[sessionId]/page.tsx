import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth";
import { getAttendanceSheet } from "@/lib/queries/attendance";
import { getDiarioDeSesion } from "@/lib/queries/diario";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatDate,
  formatTime,
  SESSION_STATUS_LABELS,
  WEEKDAYS,
} from "@/lib/format";
import { AttendanceSheet } from "./AttendanceSheet";
import { DiarioForm } from "./DiarioForm";
import { Card } from "@/components/ui/Card";

/** "YYYY-MM-DD" → 1=Lun … 7=Dom (convención del proyecto). */
function isoWeekday(iso: string): number {
  const day = new Date(`${iso}T00:00:00`).getDay();
  return day === 0 ? 7 : day;
}

/**
 * Pasar lista de una sesión y contar qué se dio (diario, migración 0043).
 *
 * La RLS de `class_sessions` solo devuelve la sesión al titular, al sustituto
 * o al admin: para cualquier otro profe → notFound().
 *
 * El guard acepta admin además de profesor porque la RLS ya le deja pasar
 * lista y escribir el diario (`is_admin()` en 0020 y 0043d) — era la pantalla
 * la que se lo impedía. Hace falta de verdad: ninguna ficha de `teachers`
 * tiene todavía usuario enlazado, así que sin esto no hay nadie que pueda
 * subir un vídeo.
 *
 * Si ya hay asistencia registrada, la hoja abre en modo edición.
 */
export default async function AsistenciaPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireAnyRole(["profesor", "admin"]);

  const { sessionId } = await params;
  const sheet = await getAttendanceSheet(sessionId);
  if (!sheet) notFound();

  const diario = await getDiarioDeSesion(sessionId);

  const { session, course, students, records, dropInCandidates } = sheet;
  const attendanceTaken = records.length > 0;
  const presentByStudent = new Map(records.map((r) => [r.student_id, r.present]));

  // Por defecto todos presentes: lo normal es que falten pocos → menos taps.
  const initialPresent: Record<string, boolean> = {};
  for (const s of students) {
    initialPresent[s.id] = presentByStudent.get(s.id) ?? true;
  }

  return (
    <>
      <Link
        href="/area-privada/profesor"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Hoy
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="font-display text-[clamp(28px,4vw,40px)] text-text-strong">
          {course.name}
        </h1>
        <Badge
          variant={
            session.status === "impartida"
              ? "success"
              : session.status === "cancelada"
                ? "danger"
                : "neutral"
          }
        >
          {SESSION_STATUS_LABELS[session.status]}
        </Badge>
      </div>
      <p className="mt-2 font-body text-sm text-text-muted">
        {WEEKDAYS[isoWeekday(session.session_date)]}{" "}
        {formatDate(session.session_date)} · {formatTime(course.start_time)}
        {attendanceTaken && session.status !== "cancelada" && (
          <> · Lista ya pasada — puedes corregirla y volver a guardar.</>
        )}
      </p>

      <div className="mt-6">
        {session.status === "cancelada" ? (
          <EmptyState
            title="Esta sesión está cancelada"
            description="No se pasa lista en sesiones canceladas. Si es un error, pide al admin que la reprograme."
          />
        ) : students.length === 0 && dropInCandidates.length === 0 ? (
          <EmptyState
            title="Sin alumnos activos en este curso"
            description="Cuando haya matrículas activas, aparecerán aquí para pasar lista."
          />
        ) : (
          <AttendanceSheet
            sessionId={session.id}
            students={students}
            candidates={dropInCandidates}
            initialPresent={initialPresent}
            isEdit={attendanceTaken}
          />
        )}
      </div>

      {session.status !== "cancelada" && (
        <div className="mt-8">
          <Card title="Diario de la clase">
            <p className="mb-4 font-body text-sm text-text-muted">
              Esto lo ven los alumnos matriculados en su área privada. El que faltó
              se pone al día y el que vino repasa en casa.
            </p>
            <DiarioForm
              sessionId={session.id}
              initialResumen={diario.resumen ?? ""}
              initialVideos={diario.videos.map((v) => ({ url: v.url, titulo: v.titulo }))}
            />
          </Card>
        </div>
      )}
    </>
  );
}
