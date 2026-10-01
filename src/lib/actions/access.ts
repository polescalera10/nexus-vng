"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { planificarAcceso, type UsuarioExistente } from "@/lib/access-bulk";
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

export type BulkAccessResult = {
  ok: boolean;
  message: string;
  creados: number;
  enlazados: number;
  fallos: { nombre: string; motivo: string }[];
};

/**
 * Da acceso a todos los alumnos activos que tienen email y aún no tienen
 * cuenta. Lo mismo que `grantStudentAccess`, en bloque y sin enviar correo.
 *
 * Reglas que NO son las del alta individual, a propósito:
 *   · una cuenta que ya existe NO se toca: ni se le cambia el rol (el alta
 *     individual sí lo hace y degradaría a un admin que fuera también alumno)
 *     ni se enlaza si no es de alumno;
 *   · los usuarios de Auth se leen UNA vez, no una por alumno;
 *   · un fallo en un alumno no corta el resto: se cuenta y se devuelve.
 */
export async function grantAllStudentsAccess(): Promise<BulkAccessResult> {
  const vacio = { creados: 0, enlazados: 0, fallos: [] };
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso.", ...vacio };
  }
  if (!serviceRoleDisponible()) {
    return { ok: false, message: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.", ...vacio };
  }

  const supabase = await createClient();
  const { data: alumnos, error } = await supabase
    .from("students")
    .select("id, full_name, email")
    .eq("active", true)
    .is("profile_id", null)
    .not("email", "is", null)
    .order("full_name");

  if (error) {
    console.error("[grantAllStudentsAccess] alumnos:", error.message);
    return { ok: false, message: "No se han podido leer los alumnos.", ...vacio };
  }

  const candidatos = (alumnos ?? [])
    .filter((a): a is typeof a & { email: string } => Boolean(a.email?.trim()))
    .map((a) => ({ id: a.id, full_name: a.full_name, email: a.email }));
  if (candidatos.length === 0) {
    return { ok: true, message: "No hay alumnos pendientes de acceso.", ...vacio };
  }

  const admin = createServiceClient();

  // Usuarios de Auth que ya existen, por email, con su rol.
  const PER_PAGE = 1000;
  const porEmail = new Map<string, { id: string }>();
  for (let page = 1; page <= 20; page++) {
    const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (listError) {
      console.error("[grantAllStudentsAccess] listUsers:", listError.message);
      return { ok: false, message: "No se han podido leer las cuentas existentes.", ...vacio };
    }
    for (const u of data.users) if (u.email) porEmail.set(u.email.toLowerCase(), { id: u.id });
    if (data.users.length < PER_PAGE) break;
  }

  // Todos los perfiles, sin `.in(ids)`: con cientos de ids la URL de PostgREST
  // se pasa del límite, y `profiles` tiene una fila por usuario (decenas).
  const { data: perfiles } = await admin.from("profiles").select("id, role");
  const rolPorId = new Map((perfiles ?? []).map((p) => [p.id, p.role]));

  const existentes = new Map<string, UsuarioExistente>();
  for (const [email, u] of porEmail) {
    existentes.set(email, { userId: u.id, role: rolPorId.get(u.id) ?? null });
  }

  const plan = planificarAcceso(candidatos, existentes);
  const fallos = [...plan.omitidos];
  let creados = 0;
  let enlazados = 0;

  for (const paso of plan.pasos) {
    let userId = paso.userId;

    if (!userId) {
      const { data, error: createError } = await admin.auth.admin.createUser({
        email: paso.email,
        email_confirm: true,
      });
      if (createError || !data.user) {
        console.error("[grantAllStudentsAccess] createUser:", createError?.message);
        fallos.push({ nombre: paso.nombre, motivo: "no se pudo crear la cuenta" });
        continue;
      }
      userId = data.user.id;
      creados++;
    } else {
      enlazados++;
    }

    // Con la sesión del admin, igual que el alta individual: pasa por la RLS y
    // por el guard de `students`.
    const { error: linkError } = await supabase
      .from("students")
      .update({ profile_id: userId })
      .eq("id", paso.studentId);

    if (linkError) {
      console.error("[grantAllStudentsAccess] enlazar:", linkError.message);
      fallos.push({
        nombre: paso.nombre,
        motivo:
          linkError.code === "23505"
            ? "esa cuenta ya está enlazada a otro alumno"
            : "cuenta creada, pero no se pudo enlazar a la ficha",
      });
    }
  }

  revalidatePath("/area-privada/admin/alumnos");
  const hechos = creados + enlazados;
  return {
    ok: fallos.length === 0,
    message:
      fallos.length === 0
        ? `Listo: ${hechos} ${hechos === 1 ? "alumno con acceso" : "alumnos con acceso"}. No se ha enviado ningún correo.`
        : `${hechos} con acceso, ${fallos.length} sin resolver. No se ha enviado ningún correo.`,
    creados,
    enlazados,
    fallos,
  };
}
