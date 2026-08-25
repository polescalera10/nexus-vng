"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dispatchWhatsappEvent } from "@/lib/whatsapp/dispatch";

/**
 * Server Actions del módulo WhatsApp (solo admin; la RLS de `whatsapp_events`
 * lo refuerza). Ninguna llama a Meta: crean la fila en `whatsapp_events` y
 * hacen POST a n8n vía dispatchWhatsappEvent (docs/whatsapp-contracts.md).
 * "Encolado" = entregado a n8n, no entrega real de WhatsApp.
 */

export type WhatsappActionResult = { ok: boolean; message?: string };

export type BroadcastFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Errores por campo, para feedback inline. */
  errors?: Record<string, string[]>;
};

const WHATSAPP_PATH = "/area-privada/admin/whatsapp";
const INACTIVOS_PATH = "/area-privada/admin/alumnos/inactivos";

/** true si el usuario logueado es admin (defensa además de la RLS). */

/* ── Avisos individuales ───────────────────────────────────────────────────── */

/** Aviso de cuota pendiente al alumno (botón de la ficha). */
export async function sendCuotaPendiente(
  studentId: string,
): Promise<WhatsappActionResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permisos para enviar avisos." };
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, phone, payment_status")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) return { ok: false, message: "Alumno no encontrado." };
  if (student.payment_status !== "pendiente") {
    return { ok: false, message: "La cuota de este alumno ya está al día." };
  }

  await dispatchWhatsappEvent(supabase, {
    type: "cuota_pendiente",
    studentId: student.id,
    payload: { student_name: student.full_name, phone: student.phone },
  });

  revalidatePath(WHATSAPP_PATH);
  return { ok: true, message: "Aviso de cuota encolado para envío." };
}

/** Aviso "te echamos de menos" a un alumno inactivo (lista de inactivos). */
export async function sendAlumnoInactivo(
  studentId: string,
): Promise<WhatsappActionResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permisos para enviar avisos." };
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, phone, active")
    .eq("id", studentId)
    .maybeSingle();

  if (!student || !student.active) {
    return { ok: false, message: "Alumno no encontrado o de baja." };
  }

  // Última sesión con presencia (para la plantilla). Queries planas.
  const { data: attendance } = await supabase
    .from("attendance")
    .select("class_session_id")
    .eq("student_id", studentId)
    .eq("present", true);

  let lastAttendance: string | null = null;
  const sessionIds = [...new Set((attendance ?? []).map((a) => a.class_session_id))];
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from("class_sessions")
      .select("session_date")
      .in("id", sessionIds)
      .order("session_date", { ascending: false })
      .limit(1);
    lastAttendance = sessions?.[0]?.session_date ?? null;
  }

  await dispatchWhatsappEvent(supabase, {
    type: "alumno_inactivo",
    studentId: student.id,
    payload: {
      student_name: student.full_name,
      phone: student.phone,
      last_attendance: lastAttendance,
    },
  });

  revalidatePath(WHATSAPP_PATH);
  revalidatePath(INACTIVOS_PATH);
  return { ok: true, message: "Aviso encolado para envío." };
}

/* ── Broadcast ─────────────────────────────────────────────────────────────── */

const broadcastSchema = z
  .object({
    target: z.enum(["curso", "nivel"], {
      errorMap: () => ({ message: "Elige el destino del mensaje" }),
    }),
    course_id: z.string(),
    nivel_id: z.string(),
    message: z
      .string()
      .trim()
      .min(1, "Escribe el mensaje")
      .max(1000, "Máximo 1000 caracteres"),
  })
  .superRefine((val, ctx) => {
    if (val.target === "curso" && !z.string().uuid().safeParse(val.course_id).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["course_id"],
        message: "Elige un curso",
      });
    }
    if (val.target === "nivel" && !z.string().uuid().safeParse(val.nivel_id).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nivel_id"],
        message: "Elige un nivel",
      });
    }
  });

/**
 * Broadcast a un curso concreto (matrículas `activa`, alumnos activos) o a un
 * nivel concreto (alumnos activos de ese nivel). Una sola fila en
 * `whatsapp_events` con `student_id: null` y los destinatarios dentro de
 * `payload.recipients[]` — es n8n quien abanica el envío.
 */
export async function sendBroadcast(
  _prev: BroadcastFormState,
  formData: FormData,
): Promise<BroadcastFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permisos para enviar mensajes." };
  }

  const parsed = broadcastSchema.safeParse({
    target: formData.get("target"),
    course_id: String(formData.get("course_id") ?? ""),
    nivel_id: String(formData.get("nivel_id") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { target, course_id, nivel_id, message } = parsed.data;
  const supabase = await createClient();

  let audience: { kind: "curso" | "nivel"; id: string; label: string };
  let recipients: { student_id: string; full_name: string; phone: string }[] = [];

  if (target === "curso") {
    const { data: course } = await supabase
      .from("courses")
      .select("id, name")
      .eq("id", course_id)
      .maybeSingle();
    if (!course) return { status: "error", message: "Curso no encontrado." };
    audience = { kind: "curso", id: course.id, label: course.name };

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("course_id", course_id)
      .eq("status", "activa");
    const studentIds = [...new Set((enrollments ?? []).map((e) => e.student_id))];
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name, phone")
        .eq("active", true)
        .in("id", studentIds);
      recipients = (students ?? []).map((s) => ({
        student_id: s.id,
        full_name: s.full_name,
        phone: s.phone,
      }));
    }
  } else {
    const { data: nivel } = await supabase
      .from("niveles")
      .select("id, nombre")
      .eq("id", nivel_id)
      .maybeSingle();
    if (!nivel) return { status: "error", message: "Nivel no encontrado." };
    audience = { kind: "nivel", id: nivel.id, label: nivel.nombre };

    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, phone")
      .eq("active", true)
      .eq("nivel_id", nivel_id);
    recipients = (students ?? []).map((s) => ({
      student_id: s.id,
      full_name: s.full_name,
      phone: s.phone,
    }));
  }

  if (recipients.length === 0) {
    return {
      status: "error",
      message: "No hay destinatarios activos para ese destino.",
    };
  }

  await dispatchWhatsappEvent(supabase, {
    type: "broadcast",
    studentId: null,
    payload: { kind: "mensaje", audience, message, recipients },
  });

  revalidatePath(WHATSAPP_PATH);
  return {
    status: "success",
    message: `Mensaje encolado para ${recipients.length} ${
      recipients.length === 1 ? "destinatario" : "destinatarios"
    }.`,
  };
}
