/**
 * Contenido de /llms.txt (formato de llmstxt.org): un índice en Markdown para
 * que los asistentes de IA sepan qué es la escuela y dónde está cada cosa.
 *
 * Se genera con los mismos datos que la web (site, precios, blog, páginas de
 * entrada, profesores, disciplinas de la BD), así que no puede decir nada que
 * la web no diga, ni quedarse atrás cuando se publica una guía nueva. Por la
 * misma regla de honestidad: solo datos confirmados. La clase de prueba no
 * lleva precio porque la web tampoco lo da.
 */
import { site } from "@/lib/site";
import { precios } from "@/content/precios";

export type EntradaLlms = { url: string; titulo: string; texto?: string };

export type DatosLlms = {
  disciplinas: EntradaLlms[];
  paginas: EntradaLlms[];
  guias: EntradaLlms[];
  profesores: EntradaLlms[];
};

const linea = ({ url, titulo, texto }: EntradaLlms) =>
  `- [${titulo}](${url})${texto ? `: ${texto.replace(/\s+/g, " ").trim()}` : ""}`;

const seccion = (titulo: string, entradas: EntradaLlms[]) =>
  entradas.length ? [`## ${titulo}`, "", ...entradas.map(linea), ""] : [];

export function construirLlmsTxt(d: DatosLlms): string {
  const { nap } = site;
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `Escuela de baile de ${site.locality} (${site.area}). La sala está en el ${nap.venue}, ` +
      `${nap.streetAddress}, ${nap.postalCode} ${nap.addressLocality}, pegada a ${site.locality}.`,
    "",
    `- Curso regular: ${precios.base} €/${precios.periodo} un estilo, +${precios.estiloExtra} € por estilo adicional, ` +
      `tarifa plana de ${precios.flat} €/${precios.periodo} con todos los estilos.`,
    "- Grupos por nivel, desde cero. No hace falta venir con pareja.",
    "- La clase de prueba se reserva por WhatsApp.",
    `- Teléfono y WhatsApp: ${nap.telephoneDisplay}`,
    `- Instagram: ${site.social.instagram}`,
    `- Ficha de Google: ${site.google.mapsUrl}`,
    "",
    ...seccion("Clases", d.disciplinas),
    ...seccion("Páginas principales", d.paginas),
    ...seccion("Guías", d.guias),
    ...seccion("Profesores", d.profesores),
  ].join("\n");
}
