import { test, expect } from "@playwright/test";

/**
 * `Reveal` ya no usa Framer Motion: los bloques nacen ocultos (`reveal-pending`)
 * y un IntersectionObserver les pone `reveal-in` al entrar en pantalla.
 *
 * El modo de fallo de ese diseño es grave y silencioso: si el observer no
 * dispara, la web se queda en blanco por debajo del hero sin que salte ningún
 * error. Este test recorre la landing entera y exige que no quede ni un bloque
 * pendiente ni nada con opacidad por debajo de 1.
 */
const PAGINAS = ["/", "/clases", "/socio-fundador"] as const;

for (const ruta of PAGINAS) {
  test(`todo el contenido de ${ruta} acaba visible al hacer scroll`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");

    const alto = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= alto; y += 400) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(100);
    }
    // Margen para la última animación (0,8 s + retardo escalonado).
    await page.waitForTimeout(1200);

    const pendientes = await page.evaluate(() =>
      [...document.querySelectorAll(".reveal-pending")].map((el) =>
        (el.textContent || "").trim().slice(0, 45),
      ),
    );
    expect(pendientes, "bloques que se quedaron ocultos").toEqual([]);

    const translucidos = await page.evaluate(
      () =>
        [...document.querySelectorAll(".reveal-in, .reveal-pending, .reveal-slide")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 0.9,
        ).length,
    );
    expect(translucidos, "bloques que se quedaron a medio fundido").toBe(0);
  });
}
