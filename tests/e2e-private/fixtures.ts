import type { Page } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
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
 * Entra en el panel como `email`, sin pasar por el formulario: el login de la
 * web es solo por enlace y el correo no llega a un test.
 *
 * Se pide un enlace con la API de administración, se canjea AQUÍ (en Node) con
 * el mismo `@supabase/ssr` que usa la app y se meten en el navegador las
 * cookies tal cual las escribiría el servidor. Así la clave de la cookie, el
 * troceado y el formato salen de la librería, no de una copia a mano.
 *
 * Lo que este atajo NO cubre es la ruta `/area-privada/callback`: en el
 * servidor de los e2e la redirección sale con host `localhost` mientras que
 * `baseURL` es `127.0.0.1`, así que la cookie de sesión se quedaría por el
 * camino. La parte del formulario (qué se envía y qué avisa) está cubierta en
 * `tests/unit/login-form.test.tsx`.
 */
export async function entrarComo(page: Page, email: string, next = "/area-privada") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    throw new Error(`[e2e] generateLink ${email}: ${error?.message ?? "sin token"}`);
  }

  const escritas: { name: string; value: string; options?: { maxAge?: number } }[] = [];
  const servidor = createServerClient(url, anon, {
    cookies: {
      getAll: () => [],
      setAll: (cookies) => {
        escritas.push(...cookies);
      },
    },
  });

  const verificado = await servidor.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (verificado.error || !verificado.data.session) {
    throw new Error(`[e2e] verifyOtp ${email}: ${verificado.error?.message ?? "sin sesión"}`);
  }
  if (escritas.length === 0) {
    throw new Error(`[e2e] verifyOtp ${email}: no escribió ninguna cookie de sesión`);
  }

  // Mismo host que `baseURL` en playwright.private.config.ts: una cookie de
  // 127.0.0.1 no viaja a localhost aunque sea el mismo servidor.
  const base = new URL(`http://127.0.0.1:${process.env.E2E_PRIVATE_PORT ?? 3300}`);
  await page.context().addCookies(
    escritas.map(({ name, value, options }) => ({
      name,
      value,
      domain: base.hostname,
      path: "/",
      expires: Math.floor(Date.now() / 1000) + (options?.maxAge ?? 3600),
      httpOnly: false,
      secure: base.protocol === "https:",
      sameSite: "Lax" as const,
    })),
  );

  await page.goto(next);
}
