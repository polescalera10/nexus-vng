import { expect, test } from "@playwright/test";

/*
  Bloque "Dónde estamos" de la home: mapa con fachada y reseñas de Google
  traídas por nuestro servidor. La garantía que importa es de privacidad:
  cargar y recorrer la home no hace que el navegador hable con Google Maps,
  Places ni los servidores de fotos de Google.
*/
test.describe("Dónde estamos en la home", () => {
  test("se ve la sala y el mapa espera a que lo pidan", async ({ page }) => {
    const aGoogle: string[] = [];
    page.on("request", (r) => {
      const host = new URL(r.url()).hostname;
      if (/(^|\.)google\.com$|googleapis\.com$|googleusercontent\.com$/.test(host)) aGoogle.push(r.url());
    });

    await page.goto("/");
    const seccion = page.locator("section", { has: page.getByRole("heading", { name: /dónde estamos/i }) });
    await seccion.scrollIntoViewIfNeeded();
    await expect(seccion).toBeVisible();
    await expect(seccion.getByText("Rambla del Garraf, 32, 1a Planta")).toBeVisible();
    await expect(seccion.getByRole("button", { name: /ver el mapa/i })).toBeVisible();

    // Margen para que el bloque de reseñas haga su petición a /api/resenas.
    await page.waitForTimeout(1500);
    expect(aGoogle).toEqual([]);
  });

  test("las reseñas se piden a nuestro servidor, sin caché", async ({ request }) => {
    const res = await request.get("/api/resenas");
    // Sin clave de Places (local y CI) no hay reseñas: 204. Con clave, 200.
    expect([200, 204]).toContain(res.status());
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("con reseñas, se pintan con autor, estrellas, aviso y atribución", async ({ page }) => {
    // Sin clave de Places en local: se simula la respuesta de nuestra ruta.
    await page.route("**/api/resenas", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          nota: 4.8,
          total: 12,
          fichaUrl: "https://maps.google.com/?cid=16291257308548571784",
          resenas: [
            {
              autor: "Laura M.",
              autorUrl: "https://www.google.com/maps/contrib/123",
              avatar: null,
              estrellas: 5,
              cuando: "hace 2 semanas",
              publicada: "2026-09-01T10:00:00Z",
              texto: "Texto de prueba de la reseña.",
            },
          ],
        }),
      }),
    );

    await page.goto("/");
    const bloque = page.getByRole("region", { name: /lo que dicen en google/i });
    await page.getByRole("heading", { name: /dónde estamos/i }).scrollIntoViewIfNeeded();
    await expect(bloque).toBeVisible();
    await expect(bloque.getByRole("link", { name: "Laura M." })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/contrib/123",
    );
    await expect(bloque.getByRole("img", { name: "Nota media 4,8 de 5" })).toBeVisible();
    await expect(bloque.getByRole("img", { name: "5 de 5 estrellas" })).toBeVisible();
    await expect(bloque.getByText("Texto de prueba de la reseña.")).toBeVisible();
    await expect(bloque.getByText(/hasta cinco, las que considera más relevantes/i)).toBeVisible();
    await expect(bloque.getByText("Google Maps", { exact: true })).toBeVisible();
    await expect(bloque.getByRole("link", { name: /ver todas en google maps/i })).toBeVisible();
  });

  test("el proxy de fotos rechaza orígenes que no son de Google", async ({ request }) => {
    const res = await request.get(`/api/resenas/avatar?u=${encodeURIComponent("https://example.com/x.png")}`);
    expect(res.status()).toBe(400);
  });
});
