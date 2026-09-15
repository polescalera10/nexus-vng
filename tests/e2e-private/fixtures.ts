import type { Page } from "@playwright/test";

/**
 * Datos fijos de los e2e del área privada. Solo existen en el Supabase LOCAL
 * que levanta la CI (ver playwright.private.config.ts): la contraseña está en
 * el repo a propósito y no vale para nada fuera de ese contenedor.
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

export const IDS = {
  teacher: "e2e00000-0000-4000-8000-000000000011",
  student: "e2e00000-0000-4000-8000-000000000021",
  course: "e2e00000-0000-4000-8000-000000000031",
  otherCourse: "e2e00000-0000-4000-8000-000000000032",
  session: "e2e00000-0000-4000-8000-000000000041",
  otherSession: "e2e00000-0000-4000-8000-000000000042",
} as const;

/** Rellena y envía el login por contraseña (hay que estar ya en /area-privada). */
export async function fillPasswordLogin(page: Page, email: string, password = E2E_PASSWORD) {
  await page.getByRole("tab", { name: "Contraseña" }).click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}
