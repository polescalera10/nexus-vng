import { expect, test } from "@playwright/test";

/*
  Bloque "Dónde estamos" de la home: mapa con fachada y reseñas de Google que
  llegan ya en el HTML (Featurable, pedidas en el servidor). La garantía que
  importa es de privacidad: cargar y recorrer la home no hace que el navegador
  hable con Google, Featurable ni los servidores de fotos de Google.
  El pintado de las reseñas se prueba en tests/unit/resenas-google.test.tsx:
  aquí no hay clave de Featurable y el bloque de reseñas no sale.
*/
test.describe("Dónde estamos en la home", () => {
  test("se ve la sala y nada se pide a terceros", async ({ page }) => {
    const aTerceros: string[] = [];
    page.on("request", (r) => {
      const host = new URL(r.url()).hostname;
      if (/(^|\.)google\.com$|googleapis\.com$|googleusercontent\.com$|featurable\.com$/.test(host)) {
        aTerceros.push(r.url());
      }
    });

    await page.goto("/");
    const seccion = page.locator("section", { has: page.getByRole("heading", { name: /dónde estamos/i }) });
    await seccion.scrollIntoViewIfNeeded();
    await expect(seccion).toBeVisible();
    await expect(seccion.getByText("Rambla del Garraf, 32, 1a Planta")).toBeVisible();
    await expect(seccion.getByRole("button", { name: /ver el mapa/i })).toBeVisible();

    await page.waitForTimeout(1000);
    expect(aTerceros).toEqual([]);
  });

  test("el proxy de fotos rechaza orígenes que no son de Google", async ({ request }) => {
    const res = await request.get(`/api/resenas/avatar?u=${encodeURIComponent("https://example.com/x.png")}`);
    expect(res.status()).toBe(400);
  });
});
