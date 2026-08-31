"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attendanceSchema, type AttendanceInput } from "@/lib/validation/attendance";

/**
 * Server Action del módulo Asistencia (profesor titular o sustituto).
 * Patrón: validar (Zod) → mutar vía createClient() (respeta RLS) → revalidar.
 * La detección de "inactivos" (módulo WhatsApp) lee `attendance` después:
 * aquí solo se persiste la lista.
 */

export type AttendanceResult = {
  status: "success" | "error";
  message?: string;
};

/**
 * Guarda (o re-guarda) la lista de una sesión:
 *   · upsert de `attendance` por (class_session_id, student_id) — editable.
 *   · `recorded_by` = perfil del usuario logueado.
 *   · si la sesión estaba `programada`, pasa a `impartida`.
 * La RLS deja escribir solo al titular del curso o al sustituto de la sesión;
 * un fallo silencioso (0 filas devueltas) se trata como falta de permiso.
 */
export async function submitAttendance(input: AttendanceInput): Promise<AttendanceResult> {
  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "Los datos de la lista no son válidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tu sesión ha caducado. Vuelve a entrar." };
  }

  // Dedupe defensivo: un alumno solo puede aparecer una vez en el upsert.
  const entryByStudent = new Map(parsed.data.entries.map((e) => [e.student_id, e]));
  const entries = [...entryByStudent.values()];

  // La RLS de class_sessions solo devuelve la fila al titular/sustituto/admin.
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, status")
    .eq("id", parsed.data.sessionId)
    .maybeSingle();
  if (!session) {
    return {
      status: "error",
      message: "No tienes permiso para pasar lista en esta sesión.",
    };
  }
  if (session.status === "cancelada") {
    return {
      status: "error",
      message: "La sesión está cancelada: no se puede pasar lista.",
    };
  }

  const { data: saved, error } = await supabase
    .from("attendance")
    .upsert(
      entries.map((e) => ({
        class_session_id: session.id,
        student_id: e.student_id,
        present: e.present,
        recorded_by: user.id,
      })),
      { onConflict: "class_session_id,student_id" },
    )
    .select("id");

  if (error) {
    console.error("[submitAttendance] upsert error:", error.message);
    return {
      status: "error",
      message: "No se ha podido guardar la lista. Inténtalo de nuevo.",
    };
  }
  // RLS silenciosa: menos filas devueltas que enviadas = sin permiso.
  if ((saved ?? []).length < entries.length) {
    return {
      status: "error",
      message: "No tienes permiso para pasar lista en esta sesión.",
    };
  }

  if (session.status === "programada") {
    const { data: updated, error: updateError } = await supabase
      .from("class_sessions")
      .update({ status: "impartida" })
      .eq("id", session.id)
      .select("id");
    if (updateError || (updated ?? []).length === 0) {
      console.error(
        "[submitAttendance] no se pudo marcar impartida:",
        updateError?.message ?? "0 filas (RLS)",
      );
      // La lista ya está guardada: se avisa, pero no se descarta el trabajo.
      return {
        status: "error",
        message:
          "Lista guardada, pero no se ha podido marcar la sesión como impartida.",
      };
    }
  }

  revalidatePath("/area-privada/profesor");
  revalidatePath(`/area-privada/profesor/asistencia/${session.id}`);

  const presentCount = entries.filter((e) => e.present).length;
  return {
    status: "success",
    message: `Lista guardada: ${presentCount}/${entries.length} presentes.`,
  };
}

/**
 * Quita de la sesión el apunte de un alumno que vino de suelto.
 *
 * Solo llega aquí el fundador sin matrícula: la política de DELETE de 0038b
 * exige justamente eso (a un matriculado se le corrige marcándolo ausente, no
 * borrándolo de la lista del curso). El profe tiene que ser titular de la
 * sesión o su sustituto; si no, la RLS devuelve 0 filas y se avisa.
 */
export async function removeDropIn(
  sessionId: string,
  studentId: string,
): Promise<AttendanceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tu sesión ha caducado. Vuelve a entrar." };
  }

  const { data: deleted, error } = await supabase
    .from("attendance")
    .delete()
    .eq("class_session_id", sessionId)
    .eq("student_id", studentId)
    .select("id");

  if (error) {
    console.error("[removeDropIn] error:", error.message);
    return { status: "error", message: "No se ha podido quitar de la lista." };
  }
  if ((deleted ?? []).length === 0) {
    return {
      status: "error",
      message: "No se puede quitar: o está matriculado en el curso, o no es tu sesión.",
    };
  }

  revalidatePath(`/area-privada/profesor/asistencia/${sessionId}`);
  revalidatePath("/area-privada/profesor");
  return { status: "success", message: "Quitado de la lista." };
}
