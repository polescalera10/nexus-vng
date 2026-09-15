import { mkdir } from "node:fs/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AUTH_DIR,
  COURSE_NAME,
  E2E_PASSWORD,
  IDS,
  OTHER_COURSE_NAME,
  STUDENT_NAME,
  TEACHER_NAME,
  USERS,
} from "./fixtures";

/**
 * Prepara el Supabase local para los e2e del área privada:
 *   · un usuario por rol, con contraseña (vía API de administración de Auth,
 *     que es la que crea también la identidad; un INSERT en auth.users a pelo
 *     no deja entrar con contraseña en las versiones actuales de GoTrue);
 *   · la ficha de profe y de alumna enlazadas a esos usuarios;
 *   · un curso con sesión HOY que da el profe y otro ajeno, también con sesión.
 *
 * Idempotente: en CI la BD es nueva en cada ejecución, pero en local se puede
 * relanzar sin `pnpm db:reset` (los duplicados se ignoran).
 */

function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

/** 1 = lunes … 7 = domingo, como `courses.weekday`. */
function isoWeekday(isoDate: string): number {
  const day = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

async function insertIgnoringDuplicates(
  admin: SupabaseClient,
  table: string,
  row: Record<string, unknown>,
) {
  const { error } = await admin.from(table).insert(row);
  if (error && error.code !== "23505") {
    throw new Error(`[e2e setup] insert en ${table}: ${error.message}`);
  }
}

async function ensureUser(admin: SupabaseClient, email: string): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email,
    password: E2E_PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) return created.data.user.id;

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(`[e2e setup] listUsers: ${error.message}`);
  const existing = data.users.find((u) => u.email === email);
  if (!existing) {
    throw new Error(`[e2e setup] createUser ${email}: ${created.error?.message ?? "sin detalle"}`);
  }
  await admin.auth.admin.updateUserById(existing.id, { password: E2E_PASSWORD });
  return existing.id;
}

export default async function globalSetup() {
  await mkdir(AUTH_DIR, { recursive: true });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const userIds = {} as Record<keyof typeof USERS, string>;
  for (const [key, user] of Object.entries(USERS) as [keyof typeof USERS, (typeof USERS)[keyof typeof USERS]][]) {
    const id = await ensureUser(admin, user.email);
    // El trigger handle_new_user crea el perfil como alumno; el service role
    // puede cambiar el rol (el guard de 0022 solo frena a sesiones de usuario).
    const { error } = await admin.from("profiles").update({ role: user.role }).eq("id", id);
    if (error) throw new Error(`[e2e setup] rol de ${user.email}: ${error.message}`);
    userIds[key] = id;
  }

  const { data: modalidad, error: modalidadError } = await admin
    .from("modalidades")
    .select("id")
    .limit(1)
    .single();
  if (modalidadError || !modalidad) {
    throw new Error(`[e2e setup] no hay modalidades (¿faltan migraciones?): ${modalidadError?.message}`);
  }

  const today = todayInMadrid();
  const weekday = isoWeekday(today);

  await insertIgnoringDuplicates(admin, "teachers", {
    id: IDS.teacher,
    full_name: TEACHER_NAME,
    email: USERS.profesor.email,
    profile_id: userIds.profesor,
    active: true,
  });

  for (const [id, name] of [
    [IDS.course, COURSE_NAME],
    [IDS.otherCourse, OTHER_COURSE_NAME],
  ] as const) {
    await insertIgnoringDuplicates(admin, "courses", {
      id,
      name,
      modalidad_id: modalidad.id,
      weekday,
      start_time: "20:00",
      active: true,
    });
  }

  // Solo el primer curso es del profe: el segundo existe para comprobar que no
  // puede abrir la lista de una sesión ajena.
  await insertIgnoringDuplicates(admin, "course_teachers", {
    course_id: IDS.course,
    teacher_id: IDS.teacher,
  });

  await insertIgnoringDuplicates(admin, "students", {
    id: IDS.student,
    full_name: STUDENT_NAME,
    phone: "+34600000099",
    dance_role: "follower",
    profile_id: userIds.alumno,
    active: true,
    // Sin esto, la bienvenida de la primera vez tapa la pantalla.
    onboarding_seen_at: new Date().toISOString(),
  });

  await insertIgnoringDuplicates(admin, "enrollments", {
    student_id: IDS.student,
    course_id: IDS.course,
    role_in_course: "follower",
    status: "activa",
  });

  for (const [id, courseId] of [
    [IDS.session, IDS.course],
    [IDS.otherSession, IDS.otherCourse],
  ] as const) {
    await insertIgnoringDuplicates(admin, "class_sessions", {
      id,
      course_id: courseId,
      session_date: today,
    });
  }
}
