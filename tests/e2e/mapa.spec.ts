import { expect, test } from "@playwright/test";

/*
  El mapa de /contacto va detrás de una fachada (RGPD): abrir la página no
  puede mandar ni una petición a Google. Solo al pulsar se monta el iframe, y
  la CSP tiene que dejarlo cargar (frame-src).
*/
test.describe("mapa de /contacto", () => {
  test("no pide nada a Google hasta que se pulsa", async ({ page }) => {
    const aGoogle: string[] = [];
    page.on("request", (r) => {
      if (new URL(r.url()).hostname.endsWith("google.com")) aGoogle.push(r.url());
    });

    await page.goto("/contacto");
    const boton = page.getByRole("button", { name: /ver el mapa/i });
    await boton.scrollIntoViewIfNeeded();
    await expect(boton).toBeVisible();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0);
    expect(aGoogle).toEqual([]);

    await boton.click();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  });

  test("la CSP permite el iframe del mapa", async ({ page }) => {
    const bloqueos: string[] = [];
    page.on("console", (m) => {
      if (/content security policy|frame-src/i.test(m.text())) bloqueos.push(m.text());
    });

    await page.goto("/contacto");
    await page.getByRole("button", { name: /ver el mapa/i }).click();
    await page.waitForTimeout(1500);
    expect(bloqueos.filter((b) => b.includes("google.com"))).toEqual([]);
  });
});
