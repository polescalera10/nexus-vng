import React from "react";
import { safeImageSrc } from "@/lib/images";

function parseInlineStyles(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Reemplazar **negrita**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Reemplazar *cursiva*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Enlaces [texto](url). Lista blanca: rutas internas ("/clases/bachata") y
  // https. Todo lo demás (javascript:, data:, http:, "//host") se queda como
  // texto plano: este HTML se inyecta con dangerouslySetInnerHTML y el Markdown
  // de los eventos lo escribe gente desde el panel.
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, texto: string, url: string) => {
    const interno = url.startsWith("/") && !url.startsWith("//");
    const externo = /^https:\/\/[^\s"'<>]+$/.test(url);
    if (!interno && !externo) return texto;
    const destino = url.replace(/"/g, "%22");
    const extra = externo ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${destino}"${extra} class="font-semibold text-neon underline-offset-2 hover:underline">${texto}</a>`;
  });

  return html;
}

/** Solo para tests: la conversión en línea (negrita, cursiva y enlaces). */
export const __parseInlineStyles = parseInlineStyles;

const ES_LISTA = /^[-*]\s/;
const ES_LISTA_NUMERADA = /^\d+\.\s/;
const ES_TABLA = /^\|.*\|$/;
/** Fila separadora de una tabla Markdown: `|---|:---:|`. */
const ES_SEPARADOR_TABLA = /^\|(?:\s*:?-{3,}:?\s*\|)+$/;

/** Celdas de una fila `| a | b |` (sin los bordes). */
function celdas(fila: string): string[] {
  return fila
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
}

/** ¿Empieza aquí un bloque que no es párrafo? Corta la fusión de líneas. */
function empiezaBloque(line: string): boolean {
  return (
    ES_LISTA.test(line) ||
    ES_LISTA_NUMERADA.test(line) ||
    ES_TABLA.test(line) ||
    line.startsWith("#") ||
    line.startsWith("![") ||
    line.startsWith("<!--")
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let currentOrderedItems: string[] = [];

  const flushList = (key: number) => {
    if (currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 space-y-2 text-text-body my-4">
          {currentListItems.map((item, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }}
            />
          ))}
        </ul>
      );
      currentListItems = [];
    }
    if (currentOrderedItems.length > 0) {
      renderedElements.push(
        <ol key={`olist-${key}`} className="list-decimal pl-6 space-y-2 text-text-body my-4">
          {currentOrderedItems.map((item, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }}
            />
          ))}
        </ol>
      );
      currentOrderedItems = [];
    }
  };

  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine === undefined) continue;
    const line = rawLine.trim();

    if (!line) {
      flushList(elementKey++);
      continue;
    }

    // Comentario HTML (<!-- … -->), de una o varias líneas: notas editoriales
    // que no se publican. Se saltan enteros.
    if (line.startsWith("<!--")) {
      flushList(elementKey++);
      while (i < lines.length && !(lines[i] ?? "").includes("-->")) i++;
      continue;
    }

    // Item de lista
    if (ES_LISTA.test(line)) {
      if (currentOrderedItems.length > 0) flushList(elementKey++);
      currentListItems.push(line.slice(2));
      continue;
    }

    // Item de lista numerada ("1. Texto"): el número lo pone el <ol>.
    if (ES_LISTA_NUMERADA.test(line)) {
      if (currentListItems.length > 0) flushList(elementKey++);
      currentOrderedItems.push(line.replace(ES_LISTA_NUMERADA, ""));
      continue;
    }

    // Si no es lista, vaciar lista acumulada
    flushList(elementKey++);

    // Tabla: cabecera, fila separadora y filas. Sin separador no es una tabla
    // y se pinta como párrafo, como hasta ahora.
    if (ES_TABLA.test(line) && ES_SEPARADOR_TABLA.test((lines[i + 1] ?? "").trim())) {
      const cabecera = celdas(line);
      const filas: string[][] = [];
      i += 2;
      while (i < lines.length && ES_TABLA.test((lines[i] ?? "").trim())) {
        filas.push(celdas((lines[i] as string).trim()));
        i++;
      }
      i--;
      renderedElements.push(
        // La tabla puede ser más ancha que un móvil de 320px: desplaza ella,
        // nunca la página.
        <div key={elementKey++} className="my-6 overflow-x-auto rounded-lg border border-white/8">
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
            <thead className="bg-bg-elevated">
              <tr>
                {cabecera.map((c, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className="px-4 py-3 font-semibold text-text-strong"
                    dangerouslySetInnerHTML={{ __html: parseInlineStyles(c) }}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, r) => (
                <tr key={r} className="border-t border-white/8">
                  {fila.map((c, idx) =>
                    idx === 0 ? (
                      <th
                        key={idx}
                        scope="row"
                        className="px-4 py-3 font-semibold text-text-strong"
                        dangerouslySetInnerHTML={{ __html: parseInlineStyles(c) }}
                      />
                    ) : (
                      <td
                        key={idx}
                        className="px-4 py-3 text-text-body"
                        dangerouslySetInnerHTML={{ __html: parseInlineStyles(c) }}
                      />
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Imagen: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const [, alt, rawSrc] = imgMatch;
      const src = safeImageSrc(rawSrc);
      // Origen no permitido: se ignora la línea en vez de cargar el recurso.
      if (!src) continue;
      renderedElements.push(
        <div key={elementKey++} className="my-8 overflow-hidden rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
          <img
            src={src}
            alt={alt || "Imagen del evento"}
            className="w-full h-auto max-h-[480px] object-cover"
          />
          {alt && (
            <div className="bg-bg-elevated px-4 py-2.5 text-center text-xs font-semibold text-text-muted border-t border-text-strong/5">
              {alt}
            </div>
          )}
        </div>
      );
      continue;
    }

    // Encabezado 1
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1 key={elementKey++} className="font-display text-3xl text-text-strong mt-10 mb-4 tracking-wide uppercase">
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // Encabezado 2
    if (line.startsWith("## ")) {
      renderedElements.push(
        <h2 key={elementKey++} className="font-display text-2xl text-text-strong mt-8 mb-3 tracking-wide uppercase">
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // Encabezado 3
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={elementKey++} className="font-display text-lg text-text-strong mt-6 mb-2 tracking-wide uppercase">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Párrafo de texto (combinamos líneas consecutivas)
    let paragraphText = line;
    while (
      i + 1 < lines.length &&
      lines[i + 1] !== undefined &&
      (lines[i + 1] as string).trim() !== "" &&
      !empiezaBloque((lines[i + 1] as string).trim())
    ) {
      i++;
      const nextLine = lines[i];
      if (nextLine !== undefined) {
        paragraphText += " " + nextLine.trim();
      }
    }

    renderedElements.push(
      <p
        key={elementKey++}
        className="text-text-body mb-4"
        dangerouslySetInnerHTML={{ __html: parseInlineStyles(paragraphText) }}
      />
    );
  }

  flushList(elementKey++);

  return <div className="space-y-4">{renderedElements}</div>;
}
