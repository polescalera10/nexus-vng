import { defineConfig, devices } from "@playwright/test";

/**
 * E2E del ÁREA PRIVADA (login, roles, leads, asistencia, alumna).
 *
 * Crean usuarios, fichas, sesiones y leads, así que corren SOLO contra un
 * Supabase local: el que levanta `bash scripts/db-reset-local.sh --full`
 * (Docker + Supabase CLI). En la CI es el job `e2e-privado`.
 *
 * Variables que hay que pasar en el entorno (no se leen de .env.local, que
 * apunta a producción): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * y SUPABASE_SERVICE_ROLE_KEY del Supabase local (`supabase status`).
 *
 * Un solo worker: los tests comparten la BD y alguno cambia estado (la lista
 * de asistencia).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Candado: nunca contra producción, pase lo que pase con las variables.
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(supabaseUrl)) {
  throw new Error(
    `E2E privados: NEXT_PUBLIC_SUPABASE_URL tiene que ser un Supabase LOCAL y es "${
      supabaseUrl || "(vacía)"
    }". Estos tests crean usuarios y datos: no se ejecutan contra producción.`,
  );
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "E2E privados: faltan NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY del Supabase local.",
  );
}

const PORT = Number(process.env.E2E_PRIVATE_PORT ?? 3300);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e-private",
  globalSetup: "./tests/e2e-private/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: `npx next build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
