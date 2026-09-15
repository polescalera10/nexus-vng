import { expect, test } from "@playwright/test";
import { REWARD_NAME, STUDENT_NAME, storageStatePath } from "./fixtures";

/**
 * El circuito completo de un premio: la alumna lo canjea desde su área y el
 * admin lo marca como entregado. Cruza la RLS de `reward_redemptions`, el
 * trigger que descuenta el saldo y la revalidación de las dos pantallas.
 */

test.use({ storageState: storageStatePath("alumno") });

test("la alumna canjea un premio y el admin lo entrega", async ({ page, browser }, testInfo) => {
  await page.goto("/area-privada/alumno");

  const premio = page.getByRole("listitem").filter({ hasText: REWARD_NAME });
  await premio.getByRole("button", { name: "Canjear" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Canje solicitado. Te lo entregamos en clase." }),
  ).toBeVisible();

  const adminContext = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    storageState: storageStatePath("admin"),
  });
  const admin = await adminContext.newPage();
  await admin.goto("/area-privada/admin/gamificacion");

  // Filas pendientes de este premio y esta alumna. Puede haber más de una si
  // el test ya corrió en otro proyecto: se entrega una y se comprueba que baja.
  const pendientes = admin
    .getByRole("listitem")
    .filter({ hasText: STUDENT_NAME })
    .filter({ hasText: REWARD_NAME })
    .filter({ has: admin.getByRole("button", { name: "Entregado" }) });
  await expect(pendientes.first()).toBeVisible();
  const antes = await pendientes.count();

  await pendientes.first().getByRole("button", { name: "Entregado" }).click();
  await expect(pendientes).toHaveCount(antes - 1);

  await admin.reload();
  await expect(pendientes).toHaveCount(antes - 1);
  await adminContext.close();
});
