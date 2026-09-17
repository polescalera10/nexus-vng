/**
 * Genera docs/traduccions/revisio-piloto-ca.md: todo el texto del piloto en
 * catalán junto a su original en castellano, para revisarlo antes de publicar.
 *
 * Uso: node --no-warnings --import ./scripts/alias-src.mjs scripts/revision-ca.mts
 *
 * Lee los mismos módulos que pinta la web, así que el documento no se
 * desincroniza: tras corregir un texto, se vuelve a generar.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as comun from "@/i18n/textos/comun";
import * as inicio from "@/i18n/textos/inicio";
import * as paginas from "@/i18n/textos/paginas";
import { landingEn } from "@/content/por-idioma";
import { modalidadesFallback } from "@/content/landing";
import { descripcionesCa } from "@/content/ca/landing";
import { metaDescripciones, modalidadesContenido } from "@/content/modalidades";
import { metaDescripcionesCa, modalidadesContenidoCa } from "@/content/ca/modalidades";
import { altsCa, claimsCa } from "@/content/ca/media";
import { heroVideo, mediaModalidades, mediaMosaico, portadaAnchaModalidad, portadaModalidad } from "@/content/media";
import { profesores } from "@/content/profesores";
import { PAREJAS } from "@/i18n/rutas";
import { waContextForPath } from "@/lib/wa-page-context";
import { buildWaLink, type WaOrigin } from "@/lib/whatsapp";

type Fila = [clave: string, es: string, ca: string];

const celda = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Llama a una función de texto con valores de muestra visibles. */
function muestra(fn: (...a: unknown[]) => unknown): string {
  const marcas = ["‹A›", "‹B›", "‹C›", "‹D›"];
  try {
    const r = String(fn(...marcas));
    if (!r.includes("[object") && !r.includes("undefined")) return r;
  } catch {
    /* sigue con un objeto */
  }
  const obj = new Proxy({}, { get: (_t, k) => `‹${String(k)}›` });
  return String(fn(obj));
}

function aplanar(es: unknown, ca: unknown, clave: string, filas: Fila[]) {
  if (typeof es === "string") {
    filas.push([clave, es, String(ca ?? "")]);
  } else if (typeof es === "function") {
    filas.push([clave, muestra(es as never), muestra(ca as never)]);
  } else if (Array.isArray(es)) {
    es.forEach((v, i) => aplanar(v, (ca as unknown[])?.[i], `${clave}[${i}]`, filas));
  } else if (es && typeof es === "object") {
    for (const k of Object.keys(es)) {
      if (k === "accent" || k === "n" || k === "estilos" || k === "slug" || k === "price" || k === "priceOld") continue;
      aplanar((es as Record<string, unknown>)[k], (ca as Record<string, unknown>)?.[k], clave ? `${clave}.${k}` : k, filas);
    }
  }
}

function tabla(titulo: string, filas: Fila[]): string {
  const cuerpo = filas
    .filter(([, es, ca]) => es !== "" || ca !== "")
    .map(([k, es, ca]) => `| \`${k}\` | ${celda(es)} | ${celda(ca)} |`)
    .join("\n");
  return `### ${titulo}\n\n| Clave | Castellano | Català |\n|---|---|---|\n${cuerpo}\n`;
}

function bloque(titulo: string, pares: Record<string, { es: unknown; ca: unknown }>): string {
  const filas: Fila[] = [];
  for (const [nombre, par] of Object.entries(pares)) {
    if (!par || typeof par !== "object" || !("es" in par)) continue;
    aplanar(par.es, par.ca, nombre, filas);
  }
  return tabla(titulo, filas);
}

const partes: string[] = [];

partes.push(`# Revisión del piloto en catalán

**Generado:** ${new Date().toISOString().slice(0, 10)} con \`scripts/revision-ca.mts\`. No se edita a mano: se corrige el texto en el código y se vuelve a generar.

## Cómo revisarlo

1. Lee la columna **Català**. La castellana está al lado solo como referencia.
2. Marca lo que quieras cambiar con un comentario o reescríbelo en la propia tabla y pásamelo: aplico los cambios y regenero el documento.
3. Los \`‹A›\`, \`‹B›\`… son huecos que la web rellena (una fecha, un nombre, un número).
4. Registro elegido: catalán central, de **tú** (no *vostè*). Los nombres de disciplina (salsa cubana, bachata, reparto, lady style, heels, sexy style) no se traducen: se buscan así.

## Correcciones de datos (afectan también al castellano)

Al traducir aparecieron datos del castellano que no coinciden con lo que confirmaste el 16-09-2026. **En catalán ya van corregidos**; el castellano sigue igual hasta que me digas:

| Dónde | Castellano hoy | Dato confirmado | ¿Corrijo el castellano? |
|---|---|---|---|
| FAQ de la home · «¿Dónde estáis?» | «Dentro del gimnasio Aranha, en Vilanova i la Geltrú. Escríbenos por WhatsApp y te mandamos la ubicación exacta.» | La dirección ya es pública: Rambla del Garraf, 32, 1.ª planta, Sant Pere de Ribes | Sí / No |
| FAQ de la home · «¿Cuánto cuesta?» | Menciona la clase de prueba sin decir que tiene coste | Tiene un coste que se descuenta si te inscribes | Sí / No |
| FAQ de la home · «¿Qué horarios hay?» | «Estamos cerrando el cuadro definitivo de la temporada…» | La parrilla 26·27 ya está publicada: lunes a viernes, 18:30 a 22:30 | Sí / No |
| FAQ de la home · «¿Necesito venir con pareja?» | «Rotamos en clase» | La rotación es voluntaria, aunque recomendada | Sí / No |
| FAQ de la home · «¿Qué nivel necesito?» | «te ubicamos en el que mejor encaja» | El nivel lo asigna el profesor | Sí / No |
| Fichas de salsa cubana y bachata · «Cómo es una clase» | «Se rota de pareja toda la clase. Es la norma…» | Rotación voluntaria y recomendada | Sí / No |
| Horarios · «Si no sabes dónde encajas…» | «te proponemos el grupo» | Lo asigna el profesor | Sí / No |

## Decisiones que conviene que confirmes

- **Enlaces a páginas solo en castellano.** Desde las páginas en catalán, los enlaces a profesores, socio fundador, FAQ, blog y textos legales llevan la marca «(en castellà)».
- **Reseñas de Google.** Se muestran tal como las escribieron (en castellano), sin traducir: lo exige la Directiva Ómnibus. El aviso de debajo lo dice.
- **Mensajes de WhatsApp.** Quien escribe desde \`/ca\` manda el primer mensaje en catalán: así sabrás en qué idioma contestar.
- **Aviso legal.** El Codi de consum de Catalunya (Llei 22/2010, art. 128-1) reconoce el derecho a recibir en catalán la información de la oferta. El piloto la cubre, pero privacidad y cookies siguen en castellano: conviene confirmarlo con quien lleve lo legal.
`);

partes.push(`## URLs y títulos\n\n| Castellano | Català |\n|---|---|\n${PAREJAS.map(([es, ca]) => `| \`${es}\` | \`${ca}\` |`).join("\n")}\n`);

partes.push("## Metadatos (title y description)\n");
partes.push(
  bloque("Home", { tInicioMeta: inicio.tInicioMeta }) +
    "\n" +
    tabla(
      "Fichas de disciplina",
      ["salsa-cubana", "bachata"].map((s) => [`meta.${s}`, metaDescripciones[s] ?? "", metaDescripcionesCa[s] ?? ""]),
    ),
);

partes.push("## Home\n");
const es = landingEn("es");
const ca = landingEn("ca");
{
  const filas: Fila[] = [];
  for (const k of ["hero", "levels", "experience", "steps", "faqs", "ctaFinal", "founding"] as const) {
    aplanar(es[k], ca[k], k, filas);
  }
  partes.push(tabla("Contenido (content/landing)", filas));
}
partes.push(
  bloque("Secciones", {
    tIntro: inicio.tIntro,
    tParaTi: inicio.tParaTi,
    tExperiencia: inicio.tExperiencia,
    tModalidades: inicio.tModalidades,
    tComunidad: inicio.tComunidad,
    tProfesores: inicio.tProfesores,
    tFounding: inicio.tFounding,
    tComoEmpezar: inicio.tComoEmpezar,
    tDondeEstamos: inicio.tDondeEstamos,
    tFaq: inicio.tFaq,
  }),
);
partes.push(
  tabla(
    "Descripción corta de cada disciplina",
    modalidadesFallback.map((m) => [m.slug, m.descripcion, descripcionesCa[m.slug] ?? "⚠ SIN TRADUCIR"]),
  ),
);

partes.push("## Páginas\n");
partes.push(bloque("Curso regular (/ca/classes)", { tClases: paginas.tClases }));
partes.push(bloque("Ficha de disciplina (textos comunes)", { tModalidad: paginas.tModalidad }));
for (const slug of ["salsa-cubana", "bachata"]) {
  const filas: Fila[] = [];
  aplanar(modalidadesContenido[slug], modalidadesContenidoCa[slug], slug, filas);
  partes.push(tabla(`Ficha de ${slug}`, filas));
}
partes.push(bloque("Horarios (/ca/horaris)", { tHorarios: paginas.tHorarios }));
partes.push(bloque("Contacto (/ca/contacte)", { tContacto: paginas.tContacto }));

partes.push("## Piezas comunes\n");
partes.push(
  bloque("Menú, pie, cookies, migas, horario, precios, reseñas, mapa y formularios", {
    tMenu: comun.tMenu,
    tIdioma: comun.tIdioma,
    tPie: comun.tPie,
    tCookies: comun.tCookies,
    tMigas: comun.tMigas,
    tDias: comun.tDias,
    tNiveles: comun.tNiveles,
    tHorario: comun.tHorario,
    tPrecios: comun.tPrecios,
    tResenas: comun.tResenas,
    tMapa: comun.tMapa,
    tFormulario: comun.tFormulario,
    tServidor: comun.tServidor,
  }),
);
partes.push(tabla("Errores de los formularios", Object.entries(comun.ERRORES_CA).map(([k, v], i) => [`error[${i}]`, k, v])));

partes.push("## WhatsApp (primer mensaje)\n");
{
  const filas: Fila[] = PAREJAS.map(([pEs, pCa]) => [pEs, waContextForPath(pEs).message, waContextForPath(pCa).message]);
  const origenes: WaOrigin[] = ["hero", "founding", "cta-final", "contacto"];
  for (const o of origenes) {
    const leer = (u: string) => decodeURIComponent(u.split("text=")[1] ?? "");
    filas.push([`origen:${o}`, leer(buildWaLink(o)), leer(buildWaLink(o, undefined, "ca"))]);
  }
  partes.push(tabla("Mensajes", filas));
}

partes.push("## Textos alternativos de las fotos\n");
{
  const altEs = new Map<string, string>();
  altEs.set("hero", heroVideo.alt);
  for (const m of modalidadesFallback) {
    const p = portadaModalidad(m.slug);
    const pa = portadaAnchaModalidad(m.slug);
    if (p) altEs.set(p.src, p.alt);
    if (pa) altEs.set(pa.src, pa.alt);
  }
  for (const s of ["salsa-cubana", "bachata"]) for (const g of mediaModalidades[s]?.galeria ?? []) altEs.set(g.src, g.alt);
  for (const i of mediaMosaico) altEs.set(i.src, i.alt);
  for (const p of profesores) altEs.set(`profesor:${p.slug}`, p.fotoAlt);
  const filas: Fila[] = [...altEs].map(([k, v]) => [k, v, altsCa[k] ?? "⚠ SIN TRADUCIR"]);
  for (const p of profesores) filas.push([`claim:${p.slug}`, p.claim, claimsCa[p.slug] ?? "⚠ SIN TRADUCIR"]);
  partes.push(tabla("Fotos y profesores", filas));
}

const salida = path.resolve(import.meta.dirname, "../docs/traduccions/revisio-piloto-ca.md");
mkdirSync(path.dirname(salida), { recursive: true });
const texto = partes.join("\n");
writeFileSync(salida, texto);
const pendientes = (texto.match(/⚠ SIN TRADUCIR/g) ?? []).length;
console.log(`${salida}\n${texto.split("\n").length} líneas · ${pendientes} sin traducir`);
