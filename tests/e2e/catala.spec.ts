import { expect, test } from "@playwright/test";

/*
  Piloto en catalán (6 páginas, `src/i18n/rutas.ts`).
  - Cada página catalana declara `lang="ca"` y hreflang recíproco con su pareja.
  - El selector lleva a la página equivalente en los dos sentidos.
  - El primer mensaje de WhatsApp sale en catalán: así se sabe en qué idioma
    contestar.
*/
const PAREJAS: ReadonlyArray<readonly [string, string]> = [
  ["/", "/ca"],
  ["/clases", "/ca/classes"],
  ["/clases/salsa-cubana", "/ca/classes/salsa-cubana"],
  ["/clases/bachata", "/ca/classes/bachata"],
  ["/horarios", "/ca/horaris"],
  ["/contacto", "/ca/contacte"],
];

/** Ruta de una URL absoluta o relativa, sin barra final (salvo la raíz). */
function ruta(href: string | null): string {
  const p = new URL(href ?? "", "https://nexusvng.es").pathname;
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

test.describe("catalán", () => {
  for (const [es, ca] of PAREJAS) {
    test(`${ca}: lang=ca, canonical propio y hreflang con ${es}`, async ({ page }) => {
      const res = await page.goto(ca);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "ca");
      expect(ruta(await page.locator('link[rel="canonical"]').getAttribute("href"))).toBe(ca);
      expect(ruta(await page.locator('link[rel="alternate"][hreflang="es"]').getAttribute("href"))).toBe(es);
      expect(ruta(await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute("href"))).toBe(es);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test(`${es}: sigue en castellano y apunta a ${ca}`, async ({ page }) => {
      await page.goto(es);
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      expect(ruta(await page.locator('link[rel="alternate"][hreflang="ca"]').getAttribute("href"))).toBe(ca);
    });
  }

  test("una disciplina sin ficha en catalán da 404", async ({ page }) => {
    const res = await page.goto("/ca/classes/heels");
    expect(res?.status()).toBe(404);
  });

  test("el selector del pie lleva a la pareja en los dos sentidos", async ({ page }) => {
    await page.goto("/horarios");
    await page.getByTestId("selector-idioma-pie").click();
    await expect(page).toHaveURL(/\/ca\/horaris$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ca");

    await page.getByTestId("selector-idioma-pie").click();
    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("sin pareja, la cabecera no ofrece cambiar de idioma y el pie lleva a /ca", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByTestId("selector-idioma-cabecera")).toHaveCount(0);
    expect(ruta(await page.getByTestId("selector-idioma-pie").getAttribute("href"))).toBe("/ca");
  });

  test("el WhatsApp de la página catalana escribe en catalán", async ({ page }) => {
    await page.goto("/ca/contacte");
    const href = await page.locator('a[href^="https://wa.me/"]').first().getAttribute("href");
    const texto = decodeURIComponent(new URL(href ?? "").searchParams.get("text") ?? "");
    expect(texto).toMatch(/Hola!|classes|M'agradaria|Us escric/);
    expect(texto).not.toMatch(/Me gustaría|Te escribo/);
  });

  test("el sitemap incluye las 6 páginas catalanas", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const [, ca] of PAREJAS) {
      expect(xml).toContain(`${ca}</loc>`);
    }
    expect(xml).toContain('hreflang="ca"');
  });
});
