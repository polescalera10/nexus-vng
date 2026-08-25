"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DAY_KEYS, teacherSchema, type TeacherInput } from "@/lib/validation/teacher";

export type TeacherFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /**
   * Errores por campo para feedback inline. La disponibilidad usa claves
   * `avail_mon`..`avail_sun` (una por día del editor).
   */
  errors?: Record<string, string[]>;
};

const BASE_PATH = "/area-privada/admin/profesores";

/**
 * Lee el FormData del formulario de profesor y lo valida con Zod.
 * La disponibilidad llega como avail_<día>_start / avail_<día>_end
 * (un bloque opcional por día en el MVP) y se serializa al jsonb
 * {"mon":[{"start":"18:00","end":"21:00"}],...} omitiendo días vacíos.
 */
function parseTeacherForm(formData: FormData):
  | { ok: true; data: TeacherInput }
  | { ok: false; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const weekly_availability: Record<string, { start: string; end: string }[]> = {};
  for (const day of DAY_KEYS) {
    const start = String(formData.get(`avail_${day}_start`) ?? "").trim();
    const end = String(formData.get(`avail_${day}_end`) ?? "").trim();
    if (!start && !end) continue;
    if (!start || !end) {
      errors[`avail_${day}`] = ["Completa hora de inicio y de fin"];
      continue;
    }
    weekly_availability[day] = [{ start, end }];
  }

  const profileId = formData.get("profile_id");

  const parsed = teacherSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    disciplines: formData.getAll("disciplines").map(String),
    weekly_availability,
    active: formData.get("active") === "on",
    profile_id: profileId ? String(profileId) : null,
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key =
        issue.path[0] === "weekly_availability"
          ? `avail_${String(issue.path[1])}`
          : String(issue.path[0]);
      (errors[key] ??= []).push(issue.message);
    }
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Los dos índices únicos de `teachers` devuelven el mismo código 23505, así
 * que hay que mirar QUÉ índice ha saltado para dar un mensaje que sirva de
 * algo: `teachers_profile_id_key` (acceso ya vinculado a otro profe) o
 * `teachers_email_key` (email ya usado).
 */
function duplicateMessage(error: { code?: string; message?: string }): string | null {
  if (error.code !== "23505") return null;
  const detail = error.message ?? "";
  if (detail.includes("teachers_email_key")) {
    return "Ya hay un profesor con ese email.";
  }
  if (detail.includes("teachers_profile_id_key")) {
    return "Ese acceso ya está vinculado a otro profesor.";
  }
  return "Ya existe un profesor con esos datos.";
}

export async function createTeacher(
  _prev: TeacherFormState,
  formData: FormData,
): Promise<TeacherFormState> {
  await requireRole("admin");

  const parsed = parseTeacherForm(formData);
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.errors,
    };
  }

  const { data } = parsed;
  const supabase = await createClient();
  const { error } = await supabase.from("teachers").insert({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    disciplines: data.disciplines,
    weekly_availability: data.weekly_availability,
    active: data.active,
    profile_id: data.profile_id,
  });

  if (error) {
    console.error("[createTeacher]", error.message);
    return {
      status: "error",
      message:
        duplicateMessage(error) ??
        "No se ha podido crear el profesor. Inténtalo de nuevo.",
    };
  }

  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateTeacher(
  id: string,
  _prev: TeacherFormState,
  formData: FormData,
): Promise<TeacherFormState> {
  await requireRole("admin");

  const parsed = parseTeacherForm(formData);
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.errors,
    };
  }

  const { data } = parsed;
  const supabase = await createClient();
  const { error } = await supabase
    .from("teachers")
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      disciplines: data.disciplines,
      weekly_availability: data.weekly_availability,
      active: data.active,
      profile_id: data.profile_id,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateTeacher]", error.message);
    return {
      status: "error",
      message:
        duplicateMessage(error) ??
        "No se han podido guardar los cambios. Inténtalo de nuevo.",
    };
  }

  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${id}`);
  revalidatePath(`${BASE_PATH}/${id}/editar`);
  redirect(`${BASE_PATH}/${id}`);
}

/** Baja/reactivación sin borrado físico (toggle de `active`). */
export async function toggleTeacherActive(
  id: string,
  active: boolean,
): Promise<TeacherFormState> {
  await requireRole("admin");

  const supabase = await createClient();
  const { error } = await supabase.from("teachers").update({ active }).eq("id", id);

  if (error) {
    console.error("[toggleTeacherActive]", error.message);
    return { status: "error", message: "No se ha podido actualizar el estado." };
  }

  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${id}`);
  return {
    status: "success",
    message: active ? "Profesor reactivado." : "Profesor dado de baja.",
  };
}
