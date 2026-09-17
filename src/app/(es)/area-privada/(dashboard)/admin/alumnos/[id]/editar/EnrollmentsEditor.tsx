"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  addStudentEnrollment,
  setEnrollmentRole,
  updateEnrollmentStatus,
} from "@/lib/actions/enrollments";
import { ENROLLMENT_STATUS_LABELS, formatTime, WEEKDAYS_SHORT } from "@/lib/format";
import type { CourseOption } from "@/lib/queries/courses";
import type { StudentCourseEnrollment } from "@/lib/queries/students";
import type { DanceRole, EnrollmentRole, InscripcionEstado } from "@/types/database";

/**
 * Las clases del alumno, editables.
 *
 * La conversión de un lead matricula de golpe en lo que pidió y con el rol que
 * el admin eligió de memoria; ese es el sitio donde se corrige. También es el
 * único punto del panel desde el que se ve la lista completa de un alumno: el
 * detalle de curso enseña lo contrario, quién hay en una clase.
 *
 * Cada cambio va solo, sin botón de guardar: son operaciones independientes y
 * agruparlas en un submit obligaría a resolver a mano conflictos de aforo que
 * la Server Action ya resuelve una a una.
 */

const STATUSES: InscripcionEstado[] = ["activa", "pausada", "lista_espera", "baja"];

/** Un curso solo se puede añadir si no está ya en la lista salvo como baja. */
function isAvailable(courseId: string, enrollments: StudentCourseEnrollment[]): boolean {
  const current = enrollments.find((e) => e.course_id === courseId);
  return !current || current.status === "baja";
}

function courseLine(course: { weekday: number; start_time: string } | null): string {
  if (!course) return "Curso eliminado";
  return `${WEEKDAYS_SHORT[course.weekday]} · ${formatTime(course.start_time)}`;
}

export function EnrollmentsEditor({
  studentId,
  danceRole,
  enrollments,
  courses,
}: {
  studentId: string;
  danceRole: DanceRole;
  enrollments: StudentCourseEnrollment[];
  courses: CourseOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "info" | "error"; text: string } | null>(
    null,
  );
  const [newCourseId, setNewCourseId] = useState("");
  const [newRole, setNewRole] = useState<EnrollmentRole>(
    danceRole === "leader" ? "leader" : "follower",
  );

  /** Toda mutación pasa por aquí: mismo manejo de error y mismo refresco. */
  function run(fn: () => Promise<{ status: "success" | "error"; message?: string }>) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.status === "error") {
        setFeedback({ tone: "error", text: res.message ?? "Error inesperado." });
      } else if (res.message) {
        setFeedback({ tone: "info", text: res.message });
      }
    });
  }

  const available = courses.filter((c) => isAvailable(c.id, enrollments));
  const picked = available.find((c) => c.id === newCourseId);

  // Una clase de estilo lady no admite leaders: ofrecer el rol sería ofrecer
  // una plaza que no existe.
  const rolesForPicked: EnrollmentRole[] = picked
    ? ([
        ...(picked.admits_leaders ? (["leader"] as const) : []),
        ...(picked.admits_followers ? (["follower"] as const) : []),
      ] as EnrollmentRole[])
    : ["leader", "follower"];
  const effectiveRole = rolesForPicked.includes(newRole)
    ? newRole
    : (rolesForPicked[0] ?? newRole);

  return (
    <div className="grid gap-5">
      {enrollments.length === 0 ? (
        <p className="font-body text-sm text-text-muted">
          Sin clases todavía. Añade la primera abajo.
        </p>
      ) : (
        <ul className="divide-y divide-text-strong/6">
          {enrollments.map((e) => (
            <li key={e.id} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[1fr_auto_auto]">
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-text-strong">
                  {e.course?.name ?? "Curso eliminado"}
                </p>
                <p className="mt-0.5 font-body text-xs text-text-muted">
                  {courseLine(e.course)}
                </p>
              </div>

              <Select
                label="Rol"
                value={e.role_in_course}
                disabled={isPending}
                onChange={(ev) =>
                  run(() => setEnrollmentRole(e.id, ev.target.value as EnrollmentRole))
                }
              >
                <option value="leader">Leader</option>
                <option value="follower">Follower</option>
              </Select>

              <Select
                label="Estado"
                value={e.status}
                disabled={isPending}
                onChange={(ev) =>
                  run(() =>
                    updateEnrollmentStatus(e.id, ev.target.value as InscripcionEstado),
                  )
                }
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ENROLLMENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 border-t border-text-strong/10 pt-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Select
          label="Añadir clase"
          value={newCourseId}
          disabled={isPending || available.length === 0}
          onChange={(ev) => setNewCourseId(ev.target.value)}
        >
          <option value="">
            {available.length === 0 ? "Ya está en todas las clases" : "Elige una clase"}
          </option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {WEEKDAYS_SHORT[c.weekday]} {formatTime(c.start_time)}
            </option>
          ))}
        </Select>

        <Select
          label="Rol"
          value={effectiveRole}
          disabled={isPending || rolesForPicked.length < 2}
          onChange={(ev) => setNewRole(ev.target.value as EnrollmentRole)}
        >
          {rolesForPicked.map((r) => (
            <option key={r} value={r}>
              {r === "leader" ? "Leader" : "Follower"}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          variant="secondary"
          loading={isPending}
          disabled={!newCourseId}
          onClick={() =>
            run(async () => {
              const res = await addStudentEnrollment(studentId, newCourseId, effectiveRole);
              if (res.status === "success") setNewCourseId("");
              return res;
            })
          }
        >
          Añadir
        </Button>
      </div>

      {feedback && (
        <p
          role="status"
          className={`font-body text-sm ${
            feedback.tone === "error" ? "text-danger" : "text-text-muted"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
