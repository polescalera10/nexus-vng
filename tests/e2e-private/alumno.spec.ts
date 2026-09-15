import { expect, test } from "@playwright/test";
import {
  COURSE_NAME,
  DIARIO_RESUMEN,
  DIARIO_VIDEO_TITULO,
  IDS,
  STUDENT_NAME,
  storageStatePath,
} from "./fixtures";

/**
 * Las pantallas de la alumna abren con sus datos. Si una RLS se rompe (como el
 * 42P17 de agosto), aquí sale la página vacía o el error.
 */

test.use({ storageState: storageStatePath("alumno") });

/** PNG de 1×1 px: suficiente para que el navegador lo recorte y lo suba. */
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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

test("lee el diario de su clase y el vídeo no se carga hasta darle al play", async ({ page }) => {
  await page.goto(`/area-privada/alumno/clase/${IDS.course}`);
  await expect(page.getByText(DIARIO_RESUMEN)).toBeVisible();

  // Fachada RGPD: antes del clic no hay ningún iframe de terceros.
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: new RegExp(DIARIO_VIDEO_TITULO) }).click();
  await expect(page.locator(`iframe[title="${DIARIO_VIDEO_TITULO}"]`)).toHaveAttribute(
    "src",
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("no abre el diario de un curso en el que no está", async ({ page }) => {
  await page.goto(`/area-privada/alumno/clase/${IDS.otherCourse}`);
  // El área de alumno no tiene not-found propio: sale el 404 general de la web.
  await expect(
    page.getByRole("heading", { name: "¡Ups! Te has quedado fuera de tiempo", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Lo que hemos dado")).toHaveCount(0);
});

test("sube su foto de perfil y la quita", async ({ page }) => {
  await page.goto("/area-privada/alumno/perfil");
  const quitar = page.getByRole("button", { name: "Quitar" });

  // Si otro proyecto dejó una foto a medias, se empieza limpio.
  if (await quitar.isVisible()) {
    await quitar.click();
    await expect(page.getByRole("button", { name: "Subir foto" })).toBeVisible();
  }

  await page.locator('input[type="file"]').setInputFiles({
    name: "foto.png",
    mimeType: "image/png",
    buffer: PNG_1PX,
  });
  await expect(quitar).toBeVisible();

  // Tras recargar, la foto sale del bucket privado con URL firmada.
  await page.reload();
  await expect(page.locator('img[src*="/storage/v1/object/sign/avatars/"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Quitar" }).click();
  await expect(page.getByRole("button", { name: "Subir foto" })).toBeVisible();
  await page.reload();
  await expect(page.locator('img[src*="/storage/v1/object/sign/avatars/"]')).toHaveCount(0);
});
