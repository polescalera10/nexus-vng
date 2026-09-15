import { expect, test } from "@playwright/test";
import { COURSE_NAME, IDS, STUDENT_NAME, storageStatePath } from "./fixtures";

/**
 * El gesto diario del profe: abrir su clase y pasar lista. Y la barrera: una
 * sesión de un curso que no da no se abre.
 */

test.use({ storageState: storageStatePath("profesor") });

test("ve su clase en la agenda", async ({ page }) => {
  await page.goto("/area-privada/profesor");
  await expect(page.getByRole("heading", { name: "Hoy", level: 1 })).toBeVisible();
  // La sesión es de hoy en Madrid; según la hora del runner puede caer en «Hoy»
  // o en «Próximas». Lo que importa es que aparezca.
  await expect(page.getByText(COURSE_NAME).first()).toBeVisible();
});

test("pasa lista y queda guardada", async ({ page }) => {
  await page.goto(`/area-privada/profesor/asistencia/${IDS.session}`);

  const alumna = () => page.getByRole("button", { name: new RegExp(`^${STUDENT_NAME}`) });
  await expect(alumna()).toBeVisible();

  // Se invierte el estado que haya: el test corre en varios proyectos sobre la
  // misma BD y no puede dar por hecho cómo lo dejó el anterior.
  const before = await alumna().getAttribute("aria-pressed");
  const after = before === "true" ? "false" : "true";

  await alumna().click();
  await expect(alumna()).toHaveAttribute("aria-pressed", after);
  await page.getByRole("button", { name: /^Guardar (lista|cambios)$/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Lista guardada" })).toBeVisible();

  await page.reload();
  await expect(alumna()).toHaveAttribute("aria-pressed", after);
});

test("no puede abrir la lista de una sesión de otro curso", async ({ page }) => {
  const response = await page.goto(`/area-privada/profesor/asistencia/${IDS.otherSession}`);
  expect(response?.status()).toBe(404);
});
