import { expect, test, type Page } from "@playwright/test";

/**
 * El bug que originó esta suite: en móvil la nav estaba en `hidden md:flex`
 * y no existía menú alternativo, así que por debajo de 768px la web no tenía
 * ninguna navegación. Estos tests impiden que vuelva a pasar.
 *
 * Segundo bug (24-08-2026), cubierto por el describe "el panel ocupa toda la
 * pantalla": en las páginas de soporte el panel abría con 128 px de alto (~1/6
 * del viewport) y los enlaces quedaban recortados. `SiteHeader` lleva
 * `backdrop-blur` y `backdrop-filter` convierte al elemento en bloque
 * contenedor de sus descendientes `position: fixed`, así que el `inset-0` del
 * panel se resolvía contra la cabecera y no contra el viewport. La landing no
 * fallaba (su cabecera no lleva filtro), de ahí que los tests anteriores
 * pasaran: `toBeVisible` no comprueba que el elemento quepa en pantalla.
 */

const MOBILE = { width: 390, height: 844 };
/** El móvil pequeño del parque real: si los enlaces caben aquí, caben siempre. */
const MOBILE_SMALL = { width: 320, height: 568 };
const DESKTOP = { width: 1280, height: 800 };

/** Rutas con las dos cabeceras del sitio: landing (Header) y soporte (SiteHeader). */
const PAGES = ["/", "/faq"] as const;

/**
 * Las medidas de layout llegan con decimales (843,999997 para 844 px de
 * viewport). 1 px de holgura evita falsos rojos sin dejar pasar el bug, que
 * recortaba el panel a 128 px.
 */
const SUBPIXEL = 1;

/**
 * Abre el menú y espera a que termine la animación de entrada (`panel-in`
 * arranca en `translateY(-12px)`): medir a mitad del fundido da posiciones
 * desplazadas y tests intermitentes.
 */
async function openMenu(page: Page) {
  await page.getByTestId("mobile-nav-toggle").click();
  const panel = page.getByTestId("mobile-nav-panel");
  await expect(panel).toBeVisible();
  await panel.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  return panel;
}

test.describe("navegación en móvil", () => {
  test.use({ viewport: MOBILE });

  test("la landing ofrece un botón de menú accesible", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByTestId("mobile-nav-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // Objetivo táctil mínimo de 44×44 px.
    const box = await toggle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("el menú abre y muestra los enlaces del sitio", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();

    const panel = page.getByTestId("mobile-nav-panel");
    await expect(panel).toBeVisible();

    for (const label of ["Clases", "Profesores", "Eventos", "Horarios", "FAQ"]) {
      await expect(panel.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("desde el menú se puede navegar de verdad a otra página", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();
    await page.getByTestId("mobile-nav-panel").getByRole("link", { name: "Clases" }).click();

    await expect(page).toHaveURL(/\/clases$/);
    // Tras navegar el panel se cierra solo: si no, taparía la página de destino.
    await expect(page.getByTestId("mobile-nav-panel")).toBeHidden();
  });

  test("el menú se cierra con Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();
    await expect(page.getByTestId("mobile-nav-panel")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-nav-panel")).toBeHidden();
    await expect(page.getByTestId("mobile-nav-toggle")).toBeFocused();
  });

  test("el menú se cierra volviendo a pulsar el botón", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("mobile-nav-toggle");

    await toggle.click();
    await expect(page.getByTestId("mobile-nav-panel")).toBeVisible();
    await toggle.click();
    await expect(page.getByTestId("mobile-nav-panel")).toBeHidden();
  });

  test("el menú incluye el CTA de WhatsApp", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();

    const cta = page.getByTestId("mobile-nav-panel").getByRole("link", {
      name: /clase de prueba/i,
    });
    await expect(cta).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
  });

  test("las páginas de soporte también tienen menú móvil", async ({ page }) => {
    await page.goto("/faq");
    await page.getByTestId("mobile-nav-toggle").click();

    const panel = page.getByTestId("mobile-nav-panel");
    await expect(panel.getByRole("link", { name: "Intensivos" })).toBeVisible();
  });

  test("con el menú abierto el fondo no se desplaza", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();
    await expect(page.getByTestId("mobile-nav-panel")).toBeVisible();

    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  });
});

test.describe("la cabecera en móvil", () => {
  test.use({ viewport: MOBILE });

  for (const path of PAGES) {
    test(`en ${path} el CTA de WhatsApp de la cabecera no se pinta`, async ({ page }) => {
      await page.goto(path);

      // Regresión del 24-08-2026: el CTA llevaba `hidden md:inline-flex`, pero
      // `WaLink` tiene `inline-flex` en sus clases base y Tailwind v4 emite
      // `.inline-flex` después de `.hidden`, así que ganaba y el botón se
      // pintaba en móvil junto a la hamburguesa. Por debajo de md la única
      // navegación de la cabecera debe ser el botón de menú.
      const headerCta = page
        .locator("header")
        .first()
        .getByRole("link", { name: /whatsapp/i });
      await expect(headerCta).toBeHidden();
    });
  }
});

test.describe("el panel ocupa toda la pantalla", () => {
  test.use({ viewport: MOBILE });

  for (const path of PAGES) {
    test(`en ${path} el panel cubre el viewport entero`, async ({ page }) => {
      await page.goto(path);
      const panel = await openMenu(page);

      const box = (await panel.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(box.width).toBeGreaterThanOrEqual(viewport.width - SUBPIXEL);
      expect(box.height).toBeGreaterThanOrEqual(viewport.height - SUBPIXEL);
    });

    test(`en ${path} todos los enlaces se ven sin hacer scroll`, async ({ page }) => {
      await page.goto(path);
      const panel = await openMenu(page);
      const links = panel.getByRole("link");
      const viewport = page.viewportSize()!;
      const total = await links.count();
      // Los enlaces de nav + el CTA de WhatsApp.
      expect(total).toBeGreaterThanOrEqual(6);

      for (let index = 0; index < total; index += 1) {
        const link = links.nth(index);
        const label = (await link.textContent())?.trim();
        const box = (await link.boundingBox())!;
        expect(box.y, `"${label}" empieza por encima del viewport`).toBeGreaterThanOrEqual(
          -SUBPIXEL,
        );
        expect(box.y + box.height, `"${label}" cae por debajo del viewport`).toBeLessThanOrEqual(
          viewport.height + SUBPIXEL,
        );
      }
    });

    test(`en ${path} el panel cuelga de <body>, no de la cabecera`, async ({ page }) => {
      await page.goto(path);
      await openMenu(page);

      // El portal es lo que blinda el `fixed inset-0`: si el panel vuelve a
      // renderizarse dentro de la cabecera, cualquier `backdrop-filter`,
      // `filter` o `transform` de un ancestro lo encoge otra vez.
      const parent = await page
        .getByTestId("mobile-nav-panel")
        .evaluate((element) => element.parentElement?.tagName ?? "NONE");
      expect(parent).toBe("BODY");
    });

    test(`en ${path} ningún ancestro del panel crea bloque contenedor`, async ({ page }) => {
      await page.goto(path);
      await openMenu(page);

      const offenders = await page.getByTestId("mobile-nav-panel").evaluate((element) => {
        const found: string[] = [];
        for (let node = element.parentElement; node; node = node.parentElement) {
          const style = getComputedStyle(node);
          const props = [style.transform, style.filter, style.backdropFilter, style.perspective];
          if (props.some((value) => value && value !== "none")) {
            found.push(`${node.tagName}.${node.className}`);
          }
          if (style.contain.includes("paint") || style.contain.includes("layout")) {
            found.push(`${node.tagName}.${node.className} (contain)`);
          }
        }
        return found;
      });

      expect(offenders).toEqual([]);
    });

    test(`en ${path} el panel tapa el contenido de la página`, async ({ page }) => {
      await page.goto(path);
      await openMenu(page);

      // El centro y el pie del viewport deben pertenecer al panel: ahí es donde
      // vivían los enlaces recortados y el CTA fijo de WhatsApp (z-[60]).
      const viewport = page.viewportSize()!;
      for (const y of [viewport.height / 2, viewport.height - 30]) {
        const insidePanel = await page.evaluate(
          ([x, pointY]) =>
            document
              .elementFromPoint(x as number, pointY as number)
              ?.closest('[data-testid="mobile-nav-panel"]') !== null,
          [viewport.width / 2, y],
        );
        expect(insidePanel, `el punto y=${y} no pertenece al panel`).toBe(true);
      }
    });

    test(`en ${path} la hamburguesa sigue pulsable con el panel abierto`, async ({ page }) => {
      await page.goto(path);
      await openMenu(page);
      const toggle = page.getByTestId("mobile-nav-toggle");

      // Sin `force`: si el panel tapase el botón, Playwright fallaría al ver
      // que otro elemento intercepta el clic.
      await toggle.click({ timeout: 3000 });
      await expect(page.getByTestId("mobile-nav-panel")).toBeHidden();
    });
  }
});

test.describe("el panel también cabe en un móvil pequeño", () => {
  test.use({ viewport: MOBILE_SMALL });

  for (const path of PAGES) {
    test(`en ${path} a 320×568 se llega a todos los enlaces`, async ({ page }) => {
      await page.goto(path);
      const panel = await openMenu(page);

      const box = (await panel.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(box.height).toBeGreaterThanOrEqual(viewport.height - SUBPIXEL);

      // Aquí el contenido puede no caber de una vez, pero el panel es
      // desplazable: el último enlace tiene que poder alcanzarse.
      const last = panel.getByRole("link", { name: /clase de prueba/i });
      await last.scrollIntoViewIfNeeded();
      const lastBox = (await last.boundingBox())!;
      expect(lastBox.y).toBeGreaterThanOrEqual(-SUBPIXEL);
      expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(viewport.height + SUBPIXEL);
    });
  }
});

test.describe("navegación en escritorio", () => {
  test.use({ viewport: DESKTOP });

  test("los enlaces se ven en línea y no hay botón de menú", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("mobile-nav-toggle")).toBeHidden();
    const header = page.locator("header").first();
    await expect(header.getByRole("link", { name: "Clases" })).toBeVisible();
    await expect(header.getByRole("link", { name: "FAQ" })).toBeVisible();
  });

  test("al ensanchar la ventana con el menú abierto se cierra y el scroll vuelve", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").click();
    await expect(page.getByTestId("mobile-nav-panel")).toBeVisible();

    await page.setViewportSize(DESKTOP);
    await expect(page.getByTestId("mobile-nav-panel")).toBeHidden();
    // El bloqueo de scroll del body no puede quedarse pegado en escritorio.
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
});
