import { expect, test, type Page } from "@playwright/test";

/**
 * Garantías mobile-first del sitio público. 320px es el ancho realista más
 * estrecho (iPhone SE 1ª gen / navegadores con zoom de accesibilidad); si algo
 * desborda ahí, desborda en todas partes.
 */

const PAGES = [
  "/",
  "/clases",
  "/socio-fundador",
  "/intensivos",
  "/profesores",
  "/eventos",
  "/horarios",
  "/faq",
  "/blog",
  // Páginas de entrada SEO (content/paginas-seo). Llevan tabla en el cuerpo,
  // que es justo lo que desborda a 320px si la columna no tiene `min-w-0`.
  "/clases-de-salsa-en-vilanova",
  "/clases-de-baile-sin-pareja",
  "/aprender-a-bailar-desde-cero",
  "/precios-clases-de-baile-vilanova",
  "/clases-de-baile-sant-pere-de-ribes",
  "/clases-de-baile-sitges",
  "/clases-de-baile-en-tacones",
];

/** Diferencia entre el ancho del documento y el del viewport. */
async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return Math.round(doc.scrollWidth - doc.clientWidth);
  });
}

test.describe("sin desbordamiento horizontal", () => {
  for (const width of [320, 390]) {
    for (const path of PAGES) {
      test(`${path} a ${width}px no genera scroll lateral`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        // 1px de tolerancia por redondeo de subpíxeles.
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
      });
    }
  }
});

test.describe("elementos que no deben salirse de la pantalla", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("ningún bloque de la landing es más ancho que el viewport", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const desbordados = await page.evaluate(() => {
      const limite = document.documentElement.clientWidth + 1;
      return [...document.querySelectorAll<HTMLElement>("main *")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) return false;
          // Los fondos decorativos van a propósito más anchos que la pantalla.
          if (getComputedStyle(el).position === "absolute") return false;
          // Lo que vive dentro de un contenedor con scroll horizontal propio (el
          // carrusel de reseñas, una tabla) sale de la vista a propósito: se
          // desplaza él, no la página. El contenedor sí se sigue comprobando.
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === "auto" || ox === "scroll") return false;
          }
          return rect.right > limite || rect.left < -1;
        })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 60)}`);
    });

    expect(desbordados).toEqual([]);
  });

  test("el titular del hero cabe sin cortarse", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const ancho = await page.evaluate(() => document.documentElement.clientWidth);
    const box = await h1.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(ancho);
  });
});

test.describe("CTA de WhatsApp en móvil", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("el CTA del hero es visible sin hacer scroll", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /WhatsApp/i }).first();
    await expect(cta).toBeInViewport();
  });

  test("el botón sticky aparece al bajar y sigue accesible", async ({ page }) => {
    await page.goto("/");
    const sticky = page.getByRole("link", { name: /Reserva tu clase de prueba/i }).last();

    // scrollTo y no mouse.wheel: en WebKit móvil la rueda no genera scroll.
    await page.evaluate(() => window.scrollTo(0, 1400));
    await expect(sticky).toBeInViewport();

    // Cabe entero en el ancho del viewport (nada recortado por los lados).
    const ancho = await page.evaluate(() => document.documentElement.clientWidth);
    const box = await sticky.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(ancho);
  });

  test("todos los CTA de WhatsApp llevan mensaje prerrellenado", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute("href") ?? ""));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+/);
    }
  });
});

test.describe("objetivos táctiles", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("los CTA principales miden al menos 44px de alto", async ({ page }) => {
    await page.goto("/faq");

    const alturas = await page
      .locator('a[href^="https://wa.me/"]:visible, button:visible')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));

    for (const alto of alturas) {
      expect(alto).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("formularios en móvil", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("los campos usan 16px para que iOS no haga zoom al enfocar", async ({ page }) => {
    await page.goto("/contacto");

    const campos = page.locator("input:visible, select:visible, textarea:visible");
    const total = await campos.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i += 1) {
      const fontSize = await campos
        .nth(i)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(16);
    }
  });

  test("ningún campo se sale del ancho de la pantalla", async ({ page }) => {
    await page.goto("/contacto");

    const limite = await page.evaluate(() => document.documentElement.clientWidth + 1);
    const anchos = await page
      .locator("input:visible, select:visible, textarea:visible")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().right));

    for (const derecha of anchos) {
      expect(derecha).toBeLessThanOrEqual(limite);
    }
  });
});
