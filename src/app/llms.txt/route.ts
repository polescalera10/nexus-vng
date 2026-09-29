import { site } from "@/lib/site";
import { construirLlmsTxt } from "@/lib/llms-txt";
import { getModalidades } from "@/lib/queries/modalidades";
import { metaDescripciones } from "@/content/modalidades";
import { articulos, articulosOrdenados } from "@/content/blog";
import { paginasSeo } from "@/content/paginas-seo";
import { profesores } from "@/content/profesores";

/**
 * /llms.txt — índice del sitio para asistentes de IA (ver `lib/llms-txt.ts`).
 * Las disciplinas salen de la BD, igual que /clases y el sitemap: se revalida
 * con la misma hora que la home.
 */
export const revalidate = 3600;

export async function GET() {
  const base = site.url;
  const modalidades = await getModalidades();

  const cuerpo = construirLlmsTxt({
    disciplinas: modalidades.map((m) => ({
      url: `${base}/clases/${m.slug}`,
      titulo: m.nombre,
      texto: metaDescripciones[m.slug] ?? m.descripcion ?? undefined,
    })),
    paginas: [
      { url: `${base}/clases`, titulo: "Curso regular y todas las clases" },
      { url: `${base}/horarios`, titulo: "Horario semanal" },
      { url: `${base}/profesores`, titulo: "Profesores" },
      { url: `${base}/faq`, titulo: "Preguntas frecuentes" },
      { url: `${base}/contacto`, titulo: "Contacto y cómo llegar" },
      ...paginasSeo.map((p) => ({ url: `${base}/${p.slug}`, titulo: p.h1, texto: p.description })),
    ],
    guias: articulosOrdenados(articulos).map((a) => ({
      url: `${base}/blog/${a.slug}`,
      titulo: a.titulo,
      texto: a.resumen,
    })),
    profesores: profesores.map((p) => ({
      url: `${base}/profesores/${p.slug}`,
      titulo: p.nombre,
      texto: p.claim,
    })),
  });

  return new Response(cuerpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
