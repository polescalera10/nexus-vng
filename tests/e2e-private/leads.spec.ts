import { expect, test } from "@playwright/test";
import { storageStatePath } from "./fixtures";

/**
 * El recorrido que paga la web: alguien rellena /contacto y el admin lo ve en
 * su bandeja. Cruza el formulario, la Server Action, la escritura con service
 * role (desde 0023 el anónimo no puede insertar) y la lectura con RLS de admin.
 */

test("un lead enviado desde /contacto llega a la bandeja del admin", async ({
  page,
  browser,
}, testInfo) => {
  const nombre = `Lead E2E ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/contacto");
  await page.locator("#lf-nombre").fill(nombre);
  await page.locator("#lf-telefono").fill("+34 600 123 456");
  await page.getByRole("checkbox", { name: /política de privacidad/ }).check();
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("¡Mensaje enviado!")).toBeVisible();

  const adminContext = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    storageState: storageStatePath("admin"),
  });
  const adminPage = await adminContext.newPage();
  await adminPage.goto("/area-privada/admin/leads");
  await expect(adminPage.getByText(nombre)).toBeVisible();
  await adminContext.close();
});
