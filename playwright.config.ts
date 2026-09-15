import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * E2E de la web pública. Levanta un build de producción en un puerto propio
 * para no chocar con el 3000 de trabajo. Se usa `next build && next start` y no
 * `next dev` a propósito: en dev, Next compila cada ruta la primera vez que se
 * pide y con varios workers en paralelo eso provoca fallos intermitentes por
 * tiempo de espera que no son bugs de la web.
 *
 * Los tests no tocan Supabase: las páginas públicas caen al contenido de
 * fallback cuando no hay BD (ver lib/queries/modalidades).
 *
 * El proyecto "mobile" es el que manda: la web es mobile-first y el grueso del
 * tráfico llega desde el móvil. "desktop" solo verifica que no se ha roto nada.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 12"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // E2E_HTTP=1: el build de pruebas no lleva `upgrade-insecure-requests` en la
    // CSP (ver next.config.ts). Sin él, WebKit no carga ni el CSS por http.
    command: `E2E_HTTP=1 npx next build && E2E_HTTP=1 npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
