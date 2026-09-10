"use server";

import { revalidatePath } from "next/cache";
import { AVATAR_BUCKET } from "@/lib/avatars";
import { toE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { avatarPathSchema, perfilAlumnoSchema } from "@/lib/validation/perfil";

/**
 * Perfil del alumno: lo que edita de sí mismo.
 *
 * Ninguna de estas acciones recibe el id del alumno desde el cliente. Se
 * resuelve siempre desde la sesión (`profile_id = auth.uid()`), porque un id
 * que viaja en el formulario es un id que se puede cambiar en el inspector.
 * Por debajo siguen la política de UPDATE (0044c) y el guard de columnas
 * (0044b); esto es la primera barrera, no la única.
 */

export type PerfilFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export type PerfilMutationResult = { ok: boolean; message?: string };

const RUTAS = ["/area-privada/alumno", "/area-privada/alumno/perfil", "/area-privada/alumno/ranking"];

function revalidarPerfil() {
  for (const ruta of RUTAS) revalidatePath(ruta);
}

/** Ficha del alumno de la sesión, o null si el usuario no tiene ninguna. */
async function fichaDeLaSesion(): Promise<{ id: string; avatar_path: string | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("students")
    .select("id, avatar_path")
    .eq("profile_id", user.id)
    .maybeSingle();

  return data ?? null;
}

/** Guarda nombre, teléfono, cumpleaños, rol de baile y salida del ranking. */
export async function updateMiPerfil(
  _prev: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const ficha = await fichaDeLaSesion();
  if (!ficha) {
    return { status: "error", message: "Tu cuenta todavía no está enlazada a una ficha." };
  }

  const parsed = perfilAlumnoSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    birthday: formData.get("birthday") ?? "",
    dance_role: formData.get("dance_role"),
    show_in_leaderboard: formData.get("show_in_leaderboard") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      full_name: parsed.data.full_name,
      // Igual que en el alta del admin: se guarda en E.164 cuando se puede
      // deducir el prefijo (lo que espera WhatsApp) y tal cual si no.
      phone: toE164(parsed.data.phone) ?? parsed.data.phone,
      birthday: parsed.data.birthday || null,
      dance_role: parsed.data.dance_role,
      show_in_leaderboard: parsed.data.show_in_leaderboard,
    })
    .eq("id", ficha.id);

  if (error) {
    console.error("[updateMiPerfil]", error.message);
    return {
      status: "error",
      message: "No se han podido guardar los cambios. Inténtalo de nuevo.",
    };
  }

  revalidarPerfil();
  return { status: "success", message: "Perfil guardado." };
}

/**
 * Enlaza una foto ya subida al bucket.
 *
 * La subida la hace el navegador contra Storage (`AvatarUploader`), no esta
 * acción: una Server Action va limitada a 1 MB de cuerpo y una foto de móvil
 * se lo come. Aquí solo se comprueba que la ruta es del propio alumno y se
 * guarda, que es la parte que no puede decidir el cliente.
 */
export async function setMiAvatar(path: string): Promise<PerfilMutationResult> {
  const ficha = await fichaDeLaSesion();
  if (!ficha) return { ok: false, message: "Tu cuenta no está enlazada a una ficha." };

  const parsed = avatarPathSchema.safeParse(path);
  if (!parsed.success) return { ok: false, message: "Imagen no válida." };

  // La carpeta ES el id de la ficha. Sin esta comprobación, un alumno podría
  // apuntar su perfil a la foto de otro (leerla ya la puede leer: el bucket
  // está abierto a los autenticados), y el ranking la pintaría como suya.
  if (!parsed.data.startsWith(`${ficha.id}/`)) {
    return { ok: false, message: "Imagen no válida." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ avatar_path: parsed.data })
    .eq("id", ficha.id);

  if (error) {
    console.error("[setMiAvatar]", error.message);
    return { ok: false, message: "No se ha podido guardar la foto." };
  }

  // La anterior ya no la referencia nadie. Borrarla no es opcional: el plan
  // Free son 1 GB para todo el proyecto y cada cambio de foto dejaría un
  // fichero huérfano para siempre.
  if (ficha.avatar_path && ficha.avatar_path !== parsed.data) {
    await supabase.storage.from(AVATAR_BUCKET).remove([ficha.avatar_path]);
  }

  revalidarPerfil();
  return { ok: true };
}

/**
 * Marca la bienvenida como vista.
 *
 * Se llama tanto si el alumno pulsa "Completar mi perfil" como si la cierra:
 * la bienvenida se enseña una vez, no hasta que hace caso. El recordatorio de
 * los puntos pendientes se queda en el inicio, que es el que sí insiste.
 */
export async function marcarOnboardingVisto(): Promise<PerfilMutationResult> {
  const ficha = await fichaDeLaSesion();
  if (!ficha) return { ok: false, message: "Tu cuenta no está enlazada a una ficha." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ onboarding_seen_at: new Date().toISOString() })
    .eq("id", ficha.id);

  if (error) {
    console.error("[marcarOnboardingVisto]", error.message);
    return { ok: false };
  }

  revalidarPerfil();
  return { ok: true };
}

/** Quita la foto y vuelve al avatar de iniciales. */
export async function removeMiAvatar(): Promise<PerfilMutationResult> {
  const ficha = await fichaDeLaSesion();
  if (!ficha) return { ok: false, message: "Tu cuenta no está enlazada a una ficha." };
  if (!ficha.avatar_path) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ avatar_path: null })
    .eq("id", ficha.id);

  if (error) {
    console.error("[removeMiAvatar]", error.message);
    return { ok: false, message: "No se ha podido quitar la foto." };
  }

  await supabase.storage.from(AVATAR_BUCKET).remove([ficha.avatar_path]);
  revalidarPerfil();
  return { ok: true };
}
