import { expect, test } from "@playwright/test";
import { REWARD_NAME, STUDENT_NAME, storageStatePath } from "./fixtures";

/**
 * El circuito completo de un premio: la alumna lo canjea desde su área y el
 * admin lo marca como entregado. Cruza la RLS de `reward_redemptions`, el
 * trigger que descuenta el saldo y la revalidación de las dos pantallas.
 */

test.use({ storageState: storageStatePath("alumno") });

test("la alumna canjea un premio y el admin lo entrega", async ({ page, browser }, testInfo) => {
  await page.goto("/area-privada/alumno/premios");

  const premio = page.getByRole("listitem").filter({ hasText: REWARD_NAME });
  await premio.getByRole("button", { name: "Canjear" }).click();

  // Confirmación en dos pasos: el canje descuenta puntos al momento.
  const dialogo = page.getByRole("dialog", { name: "¿Lo canjeas?" });
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole("button", { name: "Sí, canjear" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Canje pedido. Te escribimos para dártelo." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendido" }).click();

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

  // El canje queda en el historial global de puntos.
  await admin.goto("/area-privada/admin/gamificacion/historial?regla=canje");
  // Tabla en escritorio y tarjetas en móvil: las dos están en el DOM y una
  // oculta, así que se busca la que se ve.
  await expect(
    admin.getByText(`Canje: ${REWARD_NAME}`).filter({ visible: true }).first(),
  ).toBeVisible();
  await adminContext.close();
});
