import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Datos fijos de los e2e del área privada. Solo existen en el Supabase LOCAL
 * que levanta la CI (ver playwright.private.config.ts): la contraseña está en
 * el repo a propósito y no vale para nada fuera de ese contenedor.
 */

/**
 * Los usuarios se siguen creando con contraseña (la API de administración de
 * Auth la pide para crear la identidad), pero el login de la web ya no la
 * acepta: se entra por enlace. Ver `entrarComo`.
 */
export const E2E_PASSWORD = "e2e-solo-local-Nexus-1";

export const USERS = {
  admin: { email: "e2e-admin@example.com", role: "admin" },
  profesor: { email: "e2e-profe@example.com", role: "profesor" },
  alumno: { email: "e2e-alumna@example.com", role: "alumno" },
  /**
   * Usuario solo para el test de cerrar sesión. `signOut()` revoca TODAS las
   * sesiones del usuario: con el de la alumna, el resto de tests que reutilizan
   * su sesión guardada fallarían a partir de ahí.
   */
  salida: { email: "e2e-salida@example.com", role: "alumno" },
} as const;

export type E2EUser = keyof typeof USERS;

/** Sesiones guardadas por el proyecto `setup` (gitignorado). */
export const AUTH_DIR = "tests/e2e-private/.auth";
export const storageStatePath = (user: E2EUser) => `${AUTH_DIR}/${user}.json`;

export const TEACHER_NAME = "Profe E2E";
export const STUDENT_NAME = "Alumna E2E";
export const COURSE_NAME = "Salsa E2E";
export const OTHER_COURSE_NAME = "Bachata E2E ajena";
export const REWARD_NAME = "Premio E2E";
/** Diario de la sesión de AYER, sembrado en global-setup (el de hoy lo escribe el profe en su test). */
export const DIARIO_RESUMEN = "Resumen E2E: enchufla doble y vuelta de la vecina.";
export const DIARIO_VIDEO_TITULO = "Secuencia E2E";

export const IDS = {
  teacher: "e2e00000-0000-4000-8000-000000000011",
  student: "e2e00000-0000-4000-8000-000000000021",
  course: "e2e00000-0000-4000-8000-000000000031",
  otherCourse: "e2e00000-0000-4000-8000-000000000032",
  session: "e2e00000-0000-4000-8000-000000000041",
  otherSession: "e2e00000-0000-4000-8000-000000000042",
  pastSession: "e2e00000-0000-4000-8000-000000000043",
  reward: "e2e00000-0000-4000-8000-000000000051",
  pointEvent: "e2e00000-0000-4000-8000-000000000061",
} as const;

/**
 * Entra en el panel como `email`. El login de la web es solo por enlace, así
 * que no hay formulario que rellenar: se pide un magic link por la API de
 * administración y se abre el callback igual que haría el correo. Recorre el
 * mismo camino que un usuario real (verifyOtp + cookie de sesión del servidor),
 * sin depender de Inbucket.
 */
export async function entrarComo(page: Page, email: string, next = "/area-privada") {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    throw new Error(`[e2e] generateLink ${email}: ${error?.message ?? "sin token"}`);
  }

  const callback = new URL("/area-privada/callback", "http://localhost");
  callback.searchParams.set("token_hash", tokenHash);
  callback.searchParams.set("type", "magiclink");
  callback.searchParams.set("next", next);
  await page.goto(`${callback.pathname}${callback.search}`);
}
