"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  removeDropIn,
  submitAttendance,
  type AttendanceResult,
} from "@/lib/actions/attendance";

/**
 * Hoja de asistencia optimizada para pasar lista con una mano desde el móvil:
 *   · una fila por alumno, TODO el ancho es pulsable (tap = presente ⇄ ausente)
 *   · todos presentes por defecto (lo normal es marcar solo a los que faltan)
 *   · contador y botón de guardado en barra sticky, en zona del pulgar,
 *     por encima de la tab bar del layout (respeta safe-area)
 *
 * Los socios fundadores no se matriculan en las 15 clases (falsearía el aforo
 * del catálogo entero): van a su rutina y caen de suelto en el resto. Por eso
 * la hoja lleva buscador para añadirlos a esta sesión concreta — el apunte va
 * a `attendance` sin fila en `enrollments` (migraciones 0038a-c).
 */

type SheetStudent = {
  id: string;
  full_name: string;
  /** false = fundador de suelto, sin matrícula en el curso. */
  enrolled: boolean;
  /** true = añadido en esta pantalla y todavía sin guardar. */
  unsaved?: boolean;
};

type Candidate = { id: string; full_name: string };

function StateIcon({ present }: { present: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-7 flex-none items-center justify-center rounded-full transition-colors ${
        present ? "bg-accent text-ink" : "bg-text-strong/8 text-text-faint"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        {present ? (
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        ) : (
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        )}
      </svg>
    </span>
  );
}

export function AttendanceSheet({
  sessionId,
  students: initialStudents,
  candidates: initialCandidates,
  initialPresent,
  isEdit,
}: {
  sessionId: string;
  students: SheetStudent[];
  /** Fundadores que se pueden añadir de suelto a esta sesión. */
  candidates: Candidate[];
  /** Estado inicial por alumno (todos presentes si no había lista previa). */
  initialPresent: Record<string, boolean>;
  /** true si la lista ya se pasó (cambia el texto del botón). */
  isEdit: boolean;
}) {
  const [students, setStudents] = useState<SheetStudent[]>(initialStudents);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [present, setPresent] = useState<Record<string, boolean>>(initialPresent);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const presentCount = useMemo(
    () => students.filter((s) => present[s.id] !== false).length,
    [present, students],
  );

  // Buscador sin acentos ni mayúsculas: "jose" encuentra a "José".
  const matches = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    if (!q) return candidates.slice(0, 6);
    return candidates
      .filter((c) =>
        c.full_name
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .includes(q),
      )
      .slice(0, 6);
  }, [candidates, query]);

  function toggle(studentId: string) {
    setResult(null);
    setPresent((prev) => ({ ...prev, [studentId]: !(prev[studentId] ?? true) }));
  }

  /** Añadir de suelto: solo local. Se persiste al guardar la lista. */
  function addDropIn(candidate: Candidate) {
    setResult(null);
    setQuery("");
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    setStudents((prev) =>
      [...prev, { ...candidate, enrolled: false, unsaved: true }].sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "es"),
      ),
    );
    setPresent((prev) => ({ ...prev, [candidate.id]: true }));
  }

  /** Quitar un suelto. Si ya estaba guardado, hay que borrar su apunte. */
  function dropOut(student: SheetStudent) {
    setResult(null);
    const forget = () => {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setCandidates((prev) =>
        [...prev, { id: student.id, full_name: student.full_name }].sort((a, b) =>
          a.full_name.localeCompare(b.full_name, "es"),
        ),
      );
      setPresent((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
    };

    if (student.unsaved) {
      forget();
      return;
    }
    startTransition(async () => {
      const res = await removeDropIn(sessionId, student.id);
      setResult(res);
      if (res.status === "success") forget();
    });
  }

  function save() {
    startTransition(async () => {
      const res = await submitAttendance({
        sessionId,
        entries: students.map((s) => ({
          student_id: s.id,
          present: present[s.id] ?? true,
        })),
      });
      setResult(res);
      if (res.status === "success") {
        setSavedOnce(true);
        setStudents((prev) => prev.map((s) => ({ ...s, unsaved: false })));
      }
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {students.map((s) => {
          const isPresent = present[s.id] ?? true;
          return (
            <li key={s.id} className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={isPresent}
                className={`flex min-h-16 flex-1 touch-manipulation select-none items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors active:scale-[0.99] ${
                  isPresent
                    ? "border-accent/35 bg-accent/10"
                    : "border-text-strong/10 bg-bg-panel"
                }`}
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span
                    className={`min-w-0 truncate font-body text-base font-semibold ${
                      isPresent ? "text-text-strong" : "text-text-muted"
                    }`}
                  >
                    {s.full_name}
                  </span>
                  {!s.enrolled && (
                    <span className="flex">
                      <Badge variant="warning">Suelto · fundador</Badge>
                    </span>
                  )}
                </span>
                <span className="flex flex-none items-center gap-2">
                  <span
                    className={`font-body text-xs font-semibold ${
                      isPresent ? "text-accent" : "text-text-faint"
                    }`}
                  >
                    {isPresent ? "Presente" : "Ausente"}
                  </span>
                  <StateIcon present={isPresent} />
                </span>
              </button>

              {!s.enrolled && (
                <button
                  type="button"
                  onClick={() => dropOut(s)}
                  disabled={isPending}
                  aria-label={`Quitar a ${s.full_name} de la lista`}
                  className="flex min-h-16 w-12 flex-none touch-manipulation items-center justify-center rounded-md border border-text-strong/10 bg-bg-panel text-text-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {candidates.length > 0 && (
        <div className="mt-5 rounded-lg border border-text-strong/10 bg-bg-panel p-4">
          <p className="font-body text-sm font-bold text-text-strong">
            Añadir un socio fundador
          </p>
          <p className="mt-1 font-body text-xs text-text-muted">
            Su plaza incluye todas las clases regulares de su nivel o inferior. No
            se matricula: solo cuenta la asistencia de hoy.
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar socio fundador"
            className="mt-3 min-h-12 w-full rounded-md border border-text-strong/12 bg-bg-elevated px-4 font-body text-base text-text-strong placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
          <ul className="mt-3 flex flex-col gap-2">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => addDropIn(c)}
                  className="flex min-h-12 w-full touch-manipulation items-center justify-between gap-3 rounded-md border border-text-strong/10 bg-bg-elevated px-4 py-2 text-left transition-colors hover:border-accent/40"
                >
                  <span className="min-w-0 truncate font-body text-base text-text-body">
                    {c.full_name}
                  </span>
                  <span className="flex-none font-body text-sm font-bold text-accent">
                    Añadir
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="font-body text-sm text-text-muted">
                Ningún socio fundador con ese nombre.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Barra de guardado: sticky por encima de la tab bar móvil (min-h-14 + safe-area). */}
      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] mt-5 rounded-lg border border-text-strong/10 bg-bg-elevated p-4 shadow-card md:bottom-6">
        {result?.message && (
          <p
            role={result.status === "error" ? "alert" : "status"}
            className={`mb-3 font-body text-sm font-semibold ${
              result.status === "error" ? "text-danger" : "text-accent"
            }`}
          >
            {result.message}
          </p>
        )}
        <div className="flex items-center gap-4">
          <p
            aria-live="polite"
            className="flex-none font-body text-sm font-bold text-text-strong"
          >
            <span className="text-accent">{presentCount}</span>/{students.length}{" "}
            presentes
          </p>
          <Button
            type="button"
            onClick={save}
            loading={isPending}
            disabled={students.length === 0}
            className="min-h-12 flex-1 text-base"
          >
            {isEdit || savedOnce ? "Guardar cambios" : "Guardar lista"}
          </Button>
        </div>
      </div>
    </div>
  );
}
