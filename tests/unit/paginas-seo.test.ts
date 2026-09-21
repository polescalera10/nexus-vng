import { describe, expect, it } from "vitest";
import { paginasSeo, paginasQueEnlazanA } from "@/content/paginas-seo";
import { articulos } from "@/content/blog";
import { modalidadesContenido } from "@/content/modalidades";

/**
 * Este fichero es la barandilla anticanibalización y antidoorway de las
 * páginas de entrada SEO.
 *
 * Contexto: el 14-08-2026 hubo que sacar del índice 30 landings de campaña por
 * ser contenido escalado (94 % de texto compartido, plantilla con variables y
 * cero enlaces internos). Las páginas de `content/paginas-seo/` corren ese
 * mismo riesgo si alguien duplica un fichero para "hacer otra ciudad". Estas
 * comprobaciones fallan antes de que eso llegue a producción.
 */

/** Rutas estáticas que existen en `app/(es)/(public)`. */
const RUTAS_ESTATICAS = new Set([
  "/",
  "/clases",
  "/socio-fundador",
  "/intensivos",
  "/profesores",
  "/horarios",
  "/eventos",
  "/sobre-nosotros",
  "/contacto",
  "/faq",
  "/blog",
  "/aviso-legal",
  "/privacidad",
  "/cookies",
]);

/** Palabras del cuerpo, en minúscula y sin marcado ni signos. */
function palabras(markdown: string): string[] {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ")
    .toLocaleLowerCase("es-ES")
    .split(/[^0-9a-záéíóúüñ]+/)
    .filter((w) => w.length > 3);
}

/** Similitud de Jaccard sobre trigramas de palabras. Mide texto compartido. */
function similitud(a: string, b: string): number {
  const trigramas = (texto: string) => {
    const w = palabras(texto);
    return new Set(w.slice(0, -2).map((_, i) => w.slice(i, i + 3).join(" ")));
  };
  const A = trigramas(a);
  const B = trigramas(b);
  if (A.size === 0 || B.size === 0) return 0;
  let comunes = 0;
  for (const t of A) if (B.has(t)) comunes += 1;
  return comunes / (A.size + B.size - comunes);
}

describe("páginas de entrada SEO", () => {
  it("hay al menos una y todas tienen slug único", () => {
    expect(paginasSeo.length).toBeGreaterThan(0);
    const slugs = paginasSeo.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ningún slug pisa una ruta que ya existe", () => {
    for (const p of paginasSeo) {
      expect(RUTAS_ESTATICAS.has(`/${p.slug}`)).toBe(false);
    }
  });

  /*
    LA REGLA. Dos páginas que declaren la misma consulta compiten entre ellas
    en el SERP y Google acaba eligiendo una al azar (o ninguna). Si hace falta
    cubrir la misma consulta desde dos ángulos, se amplía una página, no se
    abre otra.
  */
  it("ninguna consulta principal está repetida", () => {
    const claves = paginasSeo.map((p) => p.keywordPrincipal.toLocaleLowerCase("es-ES").trim());
    expect(new Set(claves).size).toBe(claves.length);
  });

  it("ninguna consulta principal es la de la home ni la del catálogo", () => {
    // Las tiene la home (`app/(es)/layout.tsx`) y no se le quitan.
    const ocupadas = ["clases de baile en vilanova i la geltrú", "escuela de baile en vilanova i la geltrú"];
    for (const p of paginasSeo) {
      expect(ocupadas).not.toContain(p.keywordPrincipal.toLocaleLowerCase("es-ES").trim());
    }
  });

  /*
    ANTIDOORWAY. El umbral no es arbitrario: las `/l/` que hubo que despublicar
    compartían el 94 % del texto. Por encima de 0,25 de Jaccard sobre trigramas
    ya se está rellenando una plantilla, no escribiendo una página.
  */
  it("dos páginas nunca comparten más del 25 % del texto", () => {
    for (let i = 0; i < paginasSeo.length; i += 1) {
      for (let j = i + 1; j < paginasSeo.length; j += 1) {
        const s = similitud(paginasSeo[i]!.cuerpo, paginasSeo[j]!.cuerpo);
        expect(
          s,
          `${paginasSeo[i]!.slug} y ${paginasSeo[j]!.slug} comparten demasiado texto (${s.toFixed(2)})`,
        ).toBeLessThan(0.25);
      }
    }
  });

  it("ninguna pregunta frecuente se repite entre páginas", () => {
    const todas = paginasSeo.flatMap((p) => p.faq.map((f) => f.q.toLocaleLowerCase("es-ES").trim()));
    expect(new Set(todas).size).toBe(todas.length);
  });

  it("cada página tiene cuerpo largo y preguntas propias", () => {
    for (const p of paginasSeo) {
      expect(palabras(p.cuerpo).length, `${p.slug} tiene el cuerpo corto`).toBeGreaterThan(280);
      expect(p.faq.length, `${p.slug} no tiene preguntas`).toBeGreaterThanOrEqual(4);
    }
  });

  /*
    Los límites del SERP. El title lleva el sufijo " · NEXUS VNG" (11
    caracteres) que pone la plantilla del layout raíz.
  */
  it("los titles y las descriptions caben en el SERP", () => {
    for (const p of paginasSeo) {
      expect(p.metaTitle.length, `title largo en ${p.slug}`).toBeLessThanOrEqual(48);
      expect(p.description.length, `meta corta en ${p.slug}`).toBeGreaterThanOrEqual(120);
      expect(p.description.length, `meta larga en ${p.slug}`).toBeLessThanOrEqual(160);
    }
  });

  it("todos los enlaces internos apuntan a algo que existe", () => {
    const slugsArticulo = new Set(articulos.map((a) => a.slug));
    const slugsModalidad = new Set(Object.keys(modalidadesContenido));
    const slugsEntrada = new Set(paginasSeo.map((p) => p.slug));

    for (const p of paginasSeo) {
      for (const { href } of p.enlaces) {
        const existe =
          RUTAS_ESTATICAS.has(href) ||
          slugsEntrada.has(href.replace(/^\//, "")) ||
          (href.startsWith("/blog/") && slugsArticulo.has(href.slice("/blog/".length))) ||
          (href.startsWith("/clases/") && slugsModalidad.has(href.slice("/clases/".length)));
        expect(existe, `enlace roto en ${p.slug}: ${href}`).toBe(true);
      }
    }
  });

  /*
    ANTIHUÉRFANA. Una página sin enlaces entrantes es exactamente lo que eran
    las `/l/`: existe en el sitemap y en ningún sitio más.
  */
  it("ninguna página de entrada queda huérfana", () => {
    const enPie = new Set([
      "/precios-clases-de-baile-vilanova",
      "/aprender-a-bailar-desde-cero",
    ]);
    for (const p of paginasSeo) {
      const entrantes = paginasQueEnlazanA(`/${p.slug}`).length;
      expect(
        entrantes > 0 || enPie.has(`/${p.slug}`),
        `${p.slug} no recibe ningún enlace interno`,
      ).toBe(true);
    }
  });

  it("los enlaces del cuerpo también existen", () => {
    const slugsArticulo = new Set(articulos.map((a) => a.slug));
    const slugsModalidad = new Set(Object.keys(modalidadesContenido));
    const slugsEntrada = new Set(paginasSeo.map((p) => p.slug));

    for (const p of paginasSeo) {
      const internos = [...p.cuerpo.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]!);
      for (const href of internos) {
        const existe =
          RUTAS_ESTATICAS.has(href) ||
          slugsEntrada.has(href.replace(/^\//, "")) ||
          (href.startsWith("/blog/") && slugsArticulo.has(href.slice("/blog/".length))) ||
          (href.startsWith("/clases/") && slugsModalidad.has(href.slice("/clases/".length)));
        expect(existe, `enlace roto en el cuerpo de ${p.slug}: ${href}`).toBe(true);
      }
    }
  });
});
