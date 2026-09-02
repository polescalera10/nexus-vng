"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { toE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import {
  paymentStatuses,
  studentNotesSchema,
  studentSchema,
  type StudentInput,
} from "@/lib/validation/student";
import type { PaymentStatus, UserRole } from "@/types/database";

export type StudentFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Errores por campo, para feedback inline. */
  errors?: Record<string, string[]>;
};

/** Resultado de mutaciones rápidas (toggles) fuera de useActionState. */
export type StudentMutationResult = { ok: boolean; message?: string };

type Supa = Awaited<ReturnType<typeof createClient>>;

/* ── helpers (no exportados: un módulo "use server" solo exporta async) ────── */

/**
 * Segunda barrera de permisos, por encima de la RLS.
 *
 * La barrera real sigue siendo la RLS de `students` (0019/0020): si falla,
 * el update afecta 0 filas y se detecta. Pero el resto de módulos del panel
 * (`teachers`, `courses`, `enrollments`, `whatsapp-events`) ya comprueban el
 * rol en la propia acción, y esta asimetría era frágil: si algún día se relaja
 * una política, estas acciones se quedaban sin red. Ver
 * docs/auditoria-seguridad-2026-08-03.md (M4).
 */
async function hasRole(allowed: UserRole[]): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null && allowed.includes(role);
}

function readStudentForm(formData: FormData) {
  return {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    birthday: formData.get("birthday") ?? "",
    dance_role: formData.get("dance_role"),
    nivel_id: formData.get("nivel_id") ?? "",
    partner_id: formData.get("partner_id") ?? "",
    payment_status: formData.get("payment_status"),
    is_founding_member: formData.get("is_founding_member") === "on",
    notes: formData.get("notes") ?? "",
    active: formData.get("active") === "on",
  };
}

/**
 * Normaliza el input validado a la fila de `students` ("" → null).
 *
 * El teléfono se guarda en E.164 siempre que se pueda deducir el prefijo
 * (es lo que espera el módulo de WhatsApp); si el número es raro se guarda
 * tal cual lo escribió el admin en vez de rechazar el alta.
 */
function toRow(data: StudentInput) {
  return {
    full_name: data.full_name,
    phone: toE164(data.phone) ?? data.phone,
    email: data.email,
    birthday: data.birthday || null,
    dance_role: data.dance_role,
    nivel_id: data.nivel_id || null,
    partner_id: data.partner_id || null,
    payment_status: data.payment_status,
    is_founding_member: data.is_founding_member,
    notes: data.notes || null,
    active: data.active,
  };
}

function revalidateStudentPaths(studentId?: string) {
  revalidatePath("/area-privada/admin/alumnos");
  if (studentId) {
    revalidatePath(`/area-privada/admin/alumnos/${studentId}`);
    revalidatePath(`/area-privada/admin/alumnos/${studentId}/editar`);
    revalidatePath(`/area-privada/profesor/alumnos/${studentId}`);
  }
}

/**
 * Mantiene la pareja como relación simétrica:
 * - Si el alumno tenía otra pareja, se limpia ese lado (dejaba de apuntar aquí).
 * - Si la nueva pareja estaba emparejada con un tercero, se libera ese huérfano.
 * - La nueva pareja pasa a apuntar de vuelta al alumno.
 */
async function syncPartner(
  supabase: Supa,
  studentId: string,
  newPartnerId: string | null,
  oldPartnerId: string | null,
) {
  if (oldPartnerId && oldPartnerId !== newPartnerId) {
    await supabase
      .from("students")
      .update({ partner_id: null })
      .eq("id", oldPartnerId)
      .eq("partner_id", studentId);
  }

  if (!newPartnerId) return;

  const { data: partner } = await supabase
    .from("students")
    .select("partner_id")
    .eq("id", newPartnerId)
    .maybeSingle();

  if (partner?.partner_id && partner.partner_id !== studentId) {
    await supabase
      .from("students")
      .update({ partner_id: null })
      .eq("id", partner.partner_id)
      .eq("partner_id", newPartnerId);
  }

  if (partner && partner.partner_id !== studentId) {
    await supabase
      .from("students")
      .update({ partner_id: studentId })
      .eq("id", newPartnerId);
  }
}

/* ── acciones ─────────────────────────────────────────────────────────────── */

/** Alta de alumno (solo admin vía RLS). Redirige a la ficha al crear. */
export async function createStudent(
  _prev: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  if (!(await hasRole(["admin"]))) {
    return { status: "error", message: "No tienes permisos para crear alumnos." };
  }

  const parsed = studentSchema.safeParse(readStudentForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const row = toRow(parsed.data);

  const { data, error } = await supabase
    .from("students")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createStudent] insert error:", error?.message);
    return {
      status: "error",
      message: "No se ha podido crear el alumno. Inténtalo de nuevo.",
    };
  }

  if (row.partner_id) await syncPartner(supabase, data.id, row.partner_id, null);

  revalidateStudentPaths(data.id);
  redirect(`/area-privada/admin/alumnos/${data.id}`);
}

/** Edición completa de la ficha (solo admin vía RLS). */
export async function updateStudent(
  _prev: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  if (!(await hasRole(["admin"]))) {
    return { status: "error", message: "No tienes permisos para editar la ficha." };
  }

  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? idRaw : "";
  if (!id) return { status: "error", message: "Alumno no encontrado." };

  const parsed = studentSchema.safeParse(readStudentForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.partner_id === id) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: { partner_id: ["Un alumno no puede ser su propia pareja"] },
    };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("students")
    .select("partner_id")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { status: "error", message: "Alumno no encontrado." };

  const row = toRow(parsed.data);
  const { error } = await supabase.from("students").update(row).eq("id", id);

  if (error) {
    console.error("[updateStudent] update error:", error.message);
    return {
      status: "error",
      message: "No se han podido guardar los cambios. Inténtalo de nuevo.",
    };
  }

  await syncPartner(supabase, id, row.partner_id, current.partner_id);

  revalidateStudentPaths(id);
  redirect(`/area-privada/admin/alumnos/${id}`);
}

/**
 * Toggle rápido de cuota (admin en cualquier alumno; profesor en los suyos
 * vía RLS). Con RLS un update sin permiso no da error pero afecta 0 filas:
 * se detecta pidiendo la fila de vuelta.
 */
export async function updatePaymentStatus(
  studentId: string,
  paymentStatus: PaymentStatus,
): Promise<StudentMutationResult> {
  if (!(await hasRole(["admin", "profesor"]))) {
    return { ok: false, message: "No tienes permisos para cambiar la cuota." };
  }
  if (!paymentStatuses.includes(paymentStatus)) {
    return { ok: false, message: "Estado de cuota no válido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update({ payment_status: paymentStatus })
    .eq("id", studentId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[updatePaymentStatus] error:", error?.message ?? "0 filas (RLS)");
    return { ok: false, message: "No se ha podido actualizar la cuota." };
  }

  revalidateStudentPaths(studentId);
  return { ok: true };
}

/** Baja/reactivación lógica (toggle `active`, sin borrado físico). */
export async function setStudentActive(
  studentId: string,
  active: boolean,
): Promise<StudentMutationResult> {
  if (!(await hasRole(["admin"]))) {
    return { ok: false, message: "No tienes permisos para dar de baja alumnos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update({ active })
    .eq("id", studentId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[setStudentActive] error:", error?.message ?? "0 filas (RLS)");
    return {
      ok: false,
      message: active
        ? "No se ha podido reactivar al alumno."
        : "No se ha podido dar de baja al alumno.",
    };
  }

  revalidateStudentPaths(studentId);
  return { ok: true };
}

/** Guardar notas privadas desde la ficha del profesor (RLS: sus alumnos). */
export async function updateStudentNotes(
  _prev: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  if (!(await hasRole(["admin", "profesor"]))) {
    return { status: "error", message: "No tienes permisos para editar las notas." };
  }

  const parsed = studentNotesSchema.safeParse({
    student_id: formData.get("student_id"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa las notas.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update({ notes: parsed.data.notes || null })
    .eq("id", parsed.data.student_id)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[updateStudentNotes] error:", error?.message ?? "0 filas (RLS)");
    return { status: "error", message: "No se han podido guardar las notas." };
  }

  revalidateStudentPaths(parsed.data.student_id);
  return { status: "success", message: "Notas guardadas." };
}
