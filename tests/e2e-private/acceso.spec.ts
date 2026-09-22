import { expect, test } from "@playwright/test";
import { entrarComo, storageStatePath, USERS } from "./fixtures";

/**
 * Login, cierre de sesión y reparto por rol. Es la puerta de todo el panel:
 * un fallo aquí deja fuera a todo el mundo (o dentro a quien no toca).
 */

test.describe("sin sesión", () => {
  test("el panel manda al login y recuerda la página pedida", async ({ page }) => {
    await page.goto("/area-privada/admin/leads");
    await expect(page).toHaveURL(/\/area-privada\?redirect=%2Farea-privada%2Fadmin%2Fleads$/);
    await expect(page.getByRole("heading", { name: "Área privada" })).toBeVisible();
  });

  test("el login es solo por enlace: no hay contraseña", async ({ page }) => {
    await page.goto("/area-privada");
    await expect(page.getByRole("tab", { name: "Contraseña" })).toHaveCount(0);
    await expect(page.locator("#password")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Enviarme el enlace" })).toBeVisible();
  });

  test("con un email que no es de nadie no manda enlace", async ({ page }) => {
    await page.goto("/area-privada");
    await page.locator("#email").fill("no-existe-e2e@example.com");
    await page.getByRole("button", { name: "Enviarme el enlace" }).click();
    // Filtrado por texto: Next monta su propio role="alert" vacío (el anunciador
    // de rutas) en todas las páginas.
    await expect(
      page.getByRole("alert").filter({ hasText: "No hemos podido enviar el enlace" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/area-privada$/);
  });

  test("tras entrar vuelve a la página que se pidió", async ({ page }) => {
    await page.goto("/area-privada/admin/leads");
    await expect(page).toHaveURL(/redirect=%2Farea-privada%2Fadmin%2Fleads$/);
    await entrarComo(page, USERS.admin.email, "/area-privada/admin/leads");
    await expect(page).toHaveURL(/\/area-privada\/admin\/leads$/);
    await expect(page.getByRole("heading", { name: "Leads", level: 1 })).toBeVisible();
  });

  test("cerrar sesión devuelve al login y el panel ya no abre", async ({ page }) => {
    await entrarComo(page, USERS.salida.email);
    await expect(page).toHaveURL(/\/area-privada\/alumno$/);

    // En móvil y en escritorio hay un botón distinto (cabecera / barra lateral):
    // se pulsa el que esté visible.
    await page.getByRole("button", { name: "Cerrar sesión" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/area-privada$/);

    await page.goto("/area-privada/alumno");
    await expect(page).toHaveURL(/\/area-privada\?redirect=%2Farea-privada%2Falumno$/);
  });
});

test.describe("cada rol en su panel", () => {
  test.describe("alumno", () => {
    test.use({ storageState: storageStatePath("alumno") });

    test("no entra al panel de admin ni al de profesor", async ({ page }) => {
      await page.goto("/area-privada/admin/leads");
      await expect(page).toHaveURL(/\/area-privada\/alumno$/);
      await page.goto("/area-privada/profesor");
      await expect(page).toHaveURL(/\/area-privada\/alumno$/);
    });
  });

  test.describe("profesor", () => {
    test.use({ storageState: storageStatePath("profesor") });

    test("no entra al panel de admin ni al área de alumno", async ({ page }) => {
      await page.goto("/area-privada/admin");
      await expect(page).toHaveURL(/\/area-privada\/profesor$/);
      await page.goto("/area-privada/alumno");
      await expect(page).toHaveURL(/\/area-privada\/profesor$/);
    });
  });

  test.describe("admin", () => {
    test.use({ storageState: storageStatePath("admin") });

    test("el login le lleva a su panel", async ({ page }) => {
      await page.goto("/area-privada");
      await expect(page).toHaveURL(/\/area-privada\/admin$/);
    });
  });
});
