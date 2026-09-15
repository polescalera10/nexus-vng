import { expect, test } from "@playwright/test";
import { COURSE_NAME, STUDENT_NAME, storageStatePath } from "./fixtures";

/**
 * Las tres pantallas de la alumna abren con sus datos. Si una RLS se rompe
 * (como el 42P17 de agosto), aquí sale la página vacía o el error.
 */

test.use({ storageState: storageStatePath("alumno") });

test("en Inicio ve su saludo y su clase", async ({ page }) => {
  await page.goto("/area-privada/alumno");
  const firstName = STUDENT_NAME.split(" ")[0];
  await expect(page.getByRole("heading", { name: `Hola, ${firstName}`, level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tus clases" })).toBeVisible();
  await expect(page.getByText(COURSE_NAME).first()).toBeVisible();
});

test("Perfil y Ranking abren sin salir de su área", async ({ page }) => {
  for (const path of ["/area-privada/alumno/perfil", "/area-privada/alumno/ranking"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
