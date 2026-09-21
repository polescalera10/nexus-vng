import { describe, expect, it } from "vitest";
import { modalidadesContenido, metaDescripciones } from "@/content/modalidades";
import { paginasSeo } from "@/content/paginas-seo";
import { modalidadesFallback } from "@/content/landing";
import { tModalidad } from "@/i18n/textos/paginas";
import { site } from "@/lib/site";

/**
 * Barandilla del campo `seo` de las fichas de disciplina.
 *
 * Contexto (21-09-2026): Search Console enseñó que `/clases/cia-bachata-lady`
 * se llevaba 62 impresiones en posición 14,4 mientras
 * `/clases/lady-style-bachata` se quedaba en 10. Las dos llevaban "bachata
 * lady" en el title y Google elegía la de COMPAÑÍA, que es un grupo por
 * audición: 62 impresiones y cero clics. El campo `seo` existe para separarlas.
 *
 * Lo que se comprueba aquí es que el arreglo no se deshaga solo: dos fichas no
 * pueden volver a declarar el mismo title, ni pisar el de una página de entrada.
 */

/** Title que emitiría la plantilla si la ficha no declarara el suyo. */
function titlePlantilla(nombre: string): string {
  const base = tModalidad.es.title(nombre);
  const largo = `${base}${site.locality}`;
  return largo.length <= 48 ? largo : `${base}Vilanova`;
}

const nombrePorSlug = new Map(modalidadesFallback.map((m) => [m.slug, m.nombre]));

/** El title final de cada ficha: el propio si lo hay, si no el de plantilla. */
const titlesFicha = Object.entries(modalidadesContenido).map(([slug, c]) => ({
  slug,
  title: c.seo?.title ?? titlePlantilla(nombrePorSlug.get(slug) ?? slug),
}));

describe("titles de las fichas de disciplina", () => {
  it("ninguna ficha repite el title de otra", () => {
    const normal = titlesFicha.map((t) => t.title.toLocaleLowerCase("es-ES").trim());
    const repetidos = normal.filter((t, i) => normal.indexOf(t) !== i);
    expect(repetidos, `titles duplicados: ${repetidos.join(", ")}`).toEqual([]);
  });

  it("ninguna ficha pisa el title de una página de entrada", () => {
    const entradas = new Set(paginasSeo.map((p) => p.metaTitle.toLocaleLowerCase("es-ES").trim()));
    for (const { slug, title } of titlesFicha) {
      expect(entradas.has(title.toLocaleLowerCase("es-ES").trim()), `${slug} choca con una página de entrada`).toBe(false);
    }
  });

  it("los titles propios caben en el SERP", () => {
    for (const { slug, title } of titlesFicha) {
      expect(title.length, `title largo en ${slug}: "${title}"`).toBeLessThanOrEqual(48);
    }
  });

  /*
    La regla de fondo: un grupo de COMPAÑÍA no es un producto de captación (se
    entra por audición), así que su title no debe empezar por "Clases de". Si
    lo hace, vuelve a competir con la ficha que sí capta.
  */
  it("los grupos de compañía no se anuncian como clases", () => {
    for (const { slug, title } of titlesFicha) {
      if (!slug.startsWith("cia-")) continue;
      expect(title.toLocaleLowerCase("es-ES").startsWith("clases de"), `${slug} se anuncia como clase: "${title}"`).toBe(false);
    }
  });

  it("todo aviso de desvío apunta a una ruta que existe", () => {
    const fichas = new Set(Object.keys(modalidadesContenido));
    const entradas = new Set(paginasSeo.map((p) => p.slug));
    for (const [slug, c] of Object.entries(modalidadesContenido)) {
      const href = c.seo?.aviso?.enlace.href;
      if (!href) continue;
      const existe =
        (href.startsWith("/clases/") && fichas.has(href.slice("/clases/".length))) ||
        entradas.has(href.replace(/^\//, ""));
      expect(existe, `aviso roto en ${slug}: ${href}`).toBe(true);
    }
  });

  it("cada ficha sigue teniendo su meta description", () => {
    for (const slug of Object.keys(modalidadesContenido)) {
      expect(metaDescripciones[slug], `sin meta: ${slug}`).toBeTruthy();
    }
  });
});
