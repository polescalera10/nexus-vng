import type { SupabaseClient } from "@supabase/supabase-js";
import { currentMonthInMadrid, sessionDatesForMonth } from "@/lib/sessions";
import type { Database } from "@/types/database";

/**
 * Alta de las sesiones de un mes para todos los cursos activos.
 *
 * Vive aparte de `lib/sessions.ts` (que es puro y testeable sin base de datos)
 * y aparte de la Server Action, porque hay dos llamadores con clientes
 * distintos: el admin con su sesión (RLS) desde el botón de Novedades, y el
 * cron con service role, que no tiene sesión de usuario.
 *
 * Idempotente: el unique (course_id, session_date) más `ignoreDuplicates`
 * hacen que reejecutarlo no duplique ni pise lo que ya hay — importa, porque
 * el cron puede reintentarse y el admin puede pulsar dos veces.
 */

export type GenerateMonthResult = {
  month: string;
  cursos: number;
  sesiones: number;
  error?: string;
};

export async function generateMonthSessions(
  supabase: SupabaseClient<Database>,
  month: string = currentMonthInMadrid(),
): Promise<GenerateMonthResult> {
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, weekday, start_date, end_date")
    .eq("active", true);

  if (coursesError) {
    console.error("[generateMonthSessions] cursos:", coursesError.message);
    return { month, cursos: 0, sesiones: 0, error: "No se han podido leer los cursos." };
  }
  if (!courses || courses.length === 0) {
    return { month, cursos: 0, sesiones: 0, error: "No hay cursos activos." };
  }

  const rows = courses.flatMap((c) =>
    sessionDatesForMonth(c.weekday, month, c.start_date, c.end_date).map(
      (session_date) => ({
        course_id: c.id,
        session_date,
        status: "programada" as const,
        substitute_teacher_id: null,
      }),
    ),
  );

  if (rows.length === 0) {
    return {
      month,
      cursos: courses.length,
      sesiones: 0,
      error: "Ningún curso activo tiene sesiones ese mes.",
    };
  }

  const { error } = await supabase
    .from("class_sessions")
    .upsert(rows, { onConflict: "course_id,session_date", ignoreDuplicates: true });

  if (error) {
    console.error("[generateMonthSessions] upsert:", error.message);
    return {
      month,
      cursos: courses.length,
      sesiones: 0,
      error: "No se han podido generar las sesiones.",
    };
  }

  return { month, cursos: courses.length, sesiones: rows.length };
}
