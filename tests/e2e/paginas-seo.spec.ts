import { expect, test } from "@playwright/test";

/**
 * Páginas de entrada SEO: lo que tiene que emitir cada una en producción.
 *
 * Existe porque estas URLs son las que se sacaron del índice en agosto en su
 * versión anterior (`/l/*`). Lo que las hace distintas no se ve en el
 * navegador: canonical propia, FAQPage, breadcrumbs y enlaces internos de ida
 * y vuelta. Si algo de eso se rompe en un refactor, vuelven a ser landings
 * huérfanas y nadie se entera hasta la siguiente auditoría.
 */

const PAGINAS = [
  { path: "/clases-de-salsa-en-vilanova", h1: "Clases de salsa en Vilanova i la Geltrú" },
  { path: "/clases-de-baile-sin-pareja", h1: "Clases de baile sin pareja en Vilanova i la Geltrú" },
  { path: "/aprender-a-bailar-desde-cero", h1: "Aprender a bailar desde cero en Vilanova i la Geltrú" },
  { path: "/precios-clases-de-baile-vilanova", h1: "Precios de las clases de baile en Vilanova i la Geltrú" },
  { path: "/clases-de-baile-sant-pere-de-ribes", h1: "Clases de baile en Sant Pere de Ribes" },
  { path: "/clases-de-baile-sitges", h1: "Clases de baile cerca de Sitges" },
];

for (const { path, h1 } of PAGINAS) {
  test.describe(`${path}`, () => {
    test("emite H1, canonical propia y title con la consulta", async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveText(h1);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toContain(path);

      // El SERP corta por encima de 60 caracteres.
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(60);

      // `index` por defecto: estas URLs SÍ se indexan (al contrario que /l/*).
      const robots = await page.locator('meta[name="robots"]').count();
      if (robots > 0) {
        const contenido = await page.locator('meta[name="robots"]').first().getAttribute("content");
        expect(contenido ?? "").not.toContain("noindex");
      }
    });

    test("emite FAQPage y BreadcrumbList, y NO Course", async ({ page }) => {
      await page.goto(path);
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const tipos = bloques.flatMap((b) => {
        try {
          const dato = JSON.parse(b) as { "@type"?: string };
          return dato["@type"] ? [dato["@type"]] : [];
        } catch {
          return [];
        }
      });
      expect(tipos).toContain("FAQPage");
      expect(tipos).toContain("BreadcrumbList");
      // El nodo Course vive en la ficha de disciplina. Duplicarlo aquí partiría
      // la señal del resultado enriquecido entre dos URLs.
      expect(tipos).not.toContain("Course");
    });

    test("enlaza a otras páginas del sitio y no queda aislada", async ({ page }) => {
      await page.goto(path);
      const internos = await page
        .locator('main a[href^="/"]:not([href^="//"])')
        .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
      // Migas, cuerpo, "Sigue por aquí" y CTA: por debajo de 6 es que algo
      // ha dejado de pintarse.
      expect(internos.length).toBeGreaterThanOrEqual(6);
    });
  });
}

test("una URL de primer nivel inexistente sigue siendo 404", async ({ page }) => {
  // Las 6 páginas son carpetas estáticas, no un `[slug]` de raíz: si alguien
  // lo convierte en dinámico, el sitio se queda sin 404 y este test lo canta.
  const res = await page.goto("/clases-de-baile-en-la-luna");
  expect(res?.status()).toBe(404);
});
