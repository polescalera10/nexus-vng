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

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

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

    // Item de lista
    if (line.startsWith("- ") || line.startsWith("* ")) {
      currentListItems.push(line.slice(2));
      continue;
    }

    // Si no es lista, vaciar lista acumulada
    flushList(elementKey++);

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
      !(lines[i + 1] as string).trim().startsWith("- ") &&
      !(lines[i + 1] as string).trim().startsWith("* ") &&
      !(lines[i + 1] as string).trim().startsWith("# ") &&
      !(lines[i + 1] as string).trim().startsWith("![")
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
