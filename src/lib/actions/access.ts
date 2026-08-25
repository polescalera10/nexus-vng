"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

/**
 * Alta de acceso al área privada para un alumno o un profesor.
 *
 * Crea (o reutiliza) el usuario de Supabase Auth con su email, le pone el rol
 * y lo enlaza a la ficha. NO envía ningún correo: la persona entra pidiendo su
 * propio enlace mágico desde /area-privada. Mandar una invitación desde aquí
 * significaría que un clic del admin dispara un email a un tercero, y eso
 * conviene que sea una decisión explícita, no un efecto secundario.
 *
 * Necesita `SUPABASE_SERVICE_ROLE_KEY`: crear usuarios y asignar roles son
 * operaciones que la RLS no permite (ni debe permitir) a la sesión del admin.
 */

export type AccessResult = { ok: boolean; message: string };

/**
 * Busca un usuario de Auth por email.
 *
 * `auth.admin` no ofrece búsqueda por email en esta versión del SDK, así que
 * se pagina. Con el volumen de una escuela (decenas de usuarios) sobra; el
 * tope evita que un día esto se convierta en un bucle infinito.
 */
async function findUserByEmail(
  admin: ReturnType<typeof createServiceClient>,
  email: string,
): Promise<{ id: string } | null> {
  const target = email.toLowerCase();
  const PER_PAGE = 200;
  const MAX_PAGES = 25;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      console.error("[findUserByEmail]", error.message);
      return null;
    }
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return { id: hit.id };
    if (data.users.length < PER_PAGE) return null;
  }
  return null;
}

/** Crea el usuario si no existe y le deja el rol pedido. */
async function ensureUser(email: string, role: UserRole): Promise<string | null> {
  const admin = createServiceClient();

  const existing = await findUserByEmail(admin, email);
  let userId = existing?.id ?? null;

  if (!userId) {
    // `email_confirm: true` evita el correo de confirmación: el acceso se pide
    // después con enlace mágico, que ya verifica la propiedad del buzón.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error("[ensureUser] createUser:", error?.message);
      return null;
    }
    userId = data.user.id;
  }

  // El trigger `handle_new_user` crea el perfil como 'alumno'; subirlo a
  // 'profesor'/'admin' es cosa del service role (guard de la migración 0022).
  const { error: roleError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (roleError) {
    console.error("[ensureUser] rol:", roleError.message);
    return null;
  }

  return userId;
}

function serviceRoleDisponible(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function grantStudentAccess(studentId: string): Promise<AccessResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso." };
  }
  if (!serviceRoleDisponible()) {
    return {
      ok: false,
      message: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    };
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, email, profile_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) return { ok: false, message: "Ese alumno ya no existe." };
  if (student.profile_id) {
    return { ok: false, message: "Este alumno ya tiene acceso." };
  }
  if (!student.email) {
    return { ok: false, message: "Añade su email a la ficha antes de dar acceso." };
  }

  const userId = await ensureUser(student.email, "alumno");
  if (!userId) return { ok: false, message: "No se ha podido crear el acceso." };

  const { error } = await supabase
    .from("students")
    .update({ profile_id: userId })
    .eq("id", studentId);

  if (error) {
    console.error("[grantStudentAccess] enlazar:", error.message);
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Ese usuario ya está enlazado a otro alumno."
          : "No se ha podido enlazar el acceso.",
    };
  }

  revalidatePath(`/area-privada/admin/alumnos/${studentId}`);
  return {
    ok: true,
    message: `Listo. Ya puede entrar en /area-privada con ${student.email}.`,
  };
}

export async function grantTeacherAccess(teacherId: string): Promise<AccessResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso." };
  }
  if (!serviceRoleDisponible()) {
    return {
      ok: false,
      message: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    };
  }

  const supabase = await createClient();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, email, profile_id")
    .eq("id", teacherId)
    .maybeSingle();

  if (!teacher) return { ok: false, message: "Ese profesor ya no existe." };
  if (teacher.profile_id) {
    return { ok: false, message: "Este profesor ya tiene acceso." };
  }
  if (!teacher.email) {
    return { ok: false, message: "Añade su email a la ficha antes de dar acceso." };
  }

  const userId = await ensureUser(teacher.email, "profesor");
  if (!userId) return { ok: false, message: "No se ha podido crear el acceso." };

  const { error } = await supabase
    .from("teachers")
    .update({ profile_id: userId })
    .eq("id", teacherId);

  if (error) {
    console.error("[grantTeacherAccess] enlazar:", error.message);
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Ese usuario ya está enlazado a otro profesor."
          : "No se ha podido enlazar el acceso.",
    };
  }

  revalidatePath(`/area-privada/admin/profesores/${teacherId}`);
  return {
    ok: true,
    message: `Listo. Ya puede entrar en /area-privada con ${teacher.email}.`,
  };
}
