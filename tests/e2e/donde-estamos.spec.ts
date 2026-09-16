import { expect, test } from "@playwright/test";

/*
  Home: reseñas de Google en carrusel dentro de la sección de comunidad, sello
  de nota en el hero y mapa de la sala después de "Cómo empezar".
  Privacidad: el navegador nunca habla con Google ni con Featurable. El único
  tercero permitido es MapTiler, y solo si hay clave (en local no la hay y se
  enseña la fachada de Google Maps, que no pide nada hasta el clic).
*/
const TERCEROS_PROHIBIDOS = /(^|\.)google\.com$|googleapis\.com$|googleusercontent\.com$|featurable\.com$/;

test.describe("home: reseñas y mapa", () => {
  test("el mapa va después de 'Cómo empezar' y nada se pide a Google ni a Featurable", async ({ page }) => {
    const prohibidas: string[] = [];
    page.on("request", (r) => {
      if (TERCEROS_PROHIBIDOS.test(new URL(r.url()).hostname)) prohibidas.push(r.url());
    });

    await page.goto("/");
    const orden = await page.evaluate(() =>
      [...document.querySelectorAll("h2")].map((h) => h.textContent?.trim() ?? ""),
    );
    const iEmpezar = orden.findIndex((t) => /tres pasos/i.test(t));
    const iMapa = orden.findIndex((t) => /dónde estamos/i.test(t));
    expect(iEmpezar).toBeGreaterThan(-1);
    expect(iMapa).toBe(iEmpezar + 1);

    const seccion = page.locator("section", { has: page.getByRole("heading", { name: /dónde estamos/i }) });
    await seccion.scrollIntoViewIfNeeded();
    await expect(seccion.getByText("Rambla del Garraf, 32, 1a Planta")).toBeVisible();
    await page.waitForTimeout(1000);
    expect(prohibidas).toEqual([]);
  });

  test("las reseñas, si las hay, van en carrusel en la sección de comunidad y sin enlaces a Google", async ({ page }) => {
    await page.goto("/");
    const carrusel = page.locator('section[aria-roledescription="carrusel"]');
    test.skip((await carrusel.count()) === 0, "Sin reseñas en este build (Featurable no respondió).");

    const comunidad = page.locator("section", { has: page.getByRole("heading", { name: /el corazón son las personas/i }) });
    await expect(comunidad.locator('section[aria-roledescription="carrusel"]')).toHaveCount(1);
    await carrusel.scrollIntoViewIfNeeded();
    await expect(carrusel.getByRole("listitem").first()).toBeVisible();
    await expect(carrusel.getByRole("link")).toHaveCount(0);
    await expect(carrusel.getByText(/sin filtrar por puntuación/i)).toBeVisible();

    // La lista se desplaza en horizontal y no ensancha la página.
    const lista = carrusel.getByRole("list", { name: "Reseñas" });
    const antes = await lista.evaluate((el) => el.scrollLeft);
    await lista.evaluate((el) => el.scrollBy({ left: 400, behavior: "auto" }));
    await expect.poll(() => lista.evaluate((el) => el.scrollLeft)).toBeGreaterThan(antes);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(1);
  });

  test("el sello del hero, si lo hay, dice la nota de Google", async ({ page }) => {
    await page.goto("/");
    const sello = page.locator("section").first().getByText(/en Google/);
    test.skip((await sello.count()) === 0, "Sin reseñas en este build.");
    await expect(sello).toBeVisible();
    await expect(sello).toContainText(/\d,\d en Google/);
  });

  test("el proxy de fotos rechaza orígenes que no son de Google", async ({ request }) => {
    const res = await request.get(`/api/resenas/avatar?u=${encodeURIComponent("https://example.com/x.png")}`);
    expect(res.status()).toBe(400);
  });
});
