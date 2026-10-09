/**
 * FAQ COMPLETA — página `/faq`.
 *
 * No hay copy nuevo inventado aquí: todas las respuestas son texto ya escrito y
 * validado en el repo, seleccionado y deduplicado desde dos fuentes:
 *
 *   · las 7 preguntas universales de `content/landing.ts` (bloque `faqs`)
 *   · los `faqExtra` de las 30 landings de campaña (`content/campanas/*.ts`)
 *
 * El texto se COPIA en vez de importarse a propósito: `landing.ts` y
 * `campanas/*` son fuentes de copy con vida propia (una landing puede reescribir
 * su FAQ para su dolor concreto) y la página general no debe romperse ni cambiar
 * de tono cuando eso ocurra. Lo único que se importa son los datos duros
 * (precios, parrilla), que sí tienen fuente única.
 *
 * Dos respuestas se han ACTUALIZADO respecto al original porque el original ya
 * no es cierto:
 *   · "¿Qué horarios hay?" — decía "estamos cerrando el cuadro de la temporada";
 *     la parrilla 26·27 ya existe y se publica en `/horarios`.
 *   · "¿Cuánto cuesta?" — se deriva de `content/precios.ts` en vez de repetir
 *     cifras a mano, y remite a `/socio-fundador` para la tarifa fundadora en
 *     lugar de fijar un número de plazas (Directiva Ómnibus: nada de escasez
 *     que no podamos sostener).
 */

import { diasSemana, horarioRegular } from "@/content/horario-regular";
import { precios } from "@/content/precios";

export type FaqItem = { q: string; a: string };

export type FaqGrupo = {
  /** Ancla estable para enlazar desde otras páginas. */
  id: string;
  titulo: string;
  items: FaqItem[];
  /** Enlace a la página que desarrolla el tema del grupo. */
  link?: { href: string; label: string };
};

/* Datos derivados: si cambia el cartel o la tarifa, cambia la respuesta. */
const primerDia = (diasSemana[0] ?? "").toLowerCase();
const ultimoDia = (diasSemana[diasSemana.length - 1] ?? "").toLowerCase();
const franjas = horarioRegular.map((f) => f.hora);
const franjasTexto = franjas.slice(0, -1).join(", ") + " y " + franjas[franjas.length - 1];

export const faqGrupos: FaqGrupo[] = [
  {
    id: "antes-de-empezar",
    titulo: "Antes de empezar",
    link: { href: "/clases", label: "Ver el curso regular" },
    items: [
      {
        q: "¿Hace falta experiencia previa en baile?",
        a: "No, ninguna. Los grupos de nivel inicial parten de cero absoluto.",
      },
      {
        q: "¿Qué llevo a la clase de prueba?",
        a: "Ropa cómoda y unas zapatillas limpias. El resto —música, grupo y buen rollo— lo ponemos nosotros.",
      },
      {
        q: "¿Hay edad mínima o máxima?",
        a: "Somos una escuela para adultos: hay gente de los 18 a los 60 y pico. El único requisito es tener ganas.",
      },
      {
        q: "¿Necesito estar en forma para empezar?",
        a: "No. Se entra por nivel y el cuerpo coge forma con las clases, no al revés.",
      },
    ],
  },
  {
    id: "nivel-y-ritmo",
    titulo: "Nivel y ritmo",
    link: { href: "/horarios", label: "Ver los grupos por nivel" },
    items: [
      {
        q: "¿Qué nivel necesito?",
        a: "El que tengas. Hay grupos desde cero absoluto hasta avanzado, y el profesor te asigna el que mejor encaja contigo.",
      },
      {
        q: "¿Cómo sabéis en qué grupo encajo?",
        a: "Nos cuentas qué llevas bailado y qué quieres trabajar, y te ubicamos en el grupo que mejor encaja. Si hace falta, se ajusta sobre la marcha.",
      },
      {
        q: "¿De verdad se puede aprender sin tener ritmo natural?",
        a: "Sí. El ritmo se trabaja con ejercicios concretos, igual que cualquier técnica; no es un rasgo con el que se nace o no.",
      },
      {
        q: "¿Se ríe la gente si te equivocas?",
        a: "No. Equivocarse es parte de aprender y le pasa a todo el mundo, cada clase.",
      },
    ],
  },
  {
    id: "bailar-en-pareja",
    titulo: "Bailar en pareja",
    link: { href: "/clases/bachata", label: "Ver bachata" },
    items: [
      {
        q: "¿Necesito venir con pareja?",
        a: "No hace falta. En clase la rotación de pareja es voluntaria, pero la recomendamos: bailar con personas distintas ayuda mucho a aprender. La mayoría de la gente viene sola.",
      },
      {
        q: "¿Hace falta experiencia previa bailando en pareja?",
        a: "No, la mayoría de parejas empieza sin haber bailado nunca juntas.",
      },
      {
        q: "¿Y si uno de los dos tiene mucho peor ritmo que el otro?",
        a: "No pasa nada: se trabaja a nivel de pareja, sin comparar a uno con el otro.",
      },
    ],
  },
  {
    id: "horarios-y-lugar",
    titulo: "Horarios, días y dónde estamos",
    link: { href: "/horarios", label: "Ver la parrilla completa" },
    items: [
      {
        q: "¿Qué horarios hay?",
        a: `El curso regular 26·27 va de ${primerDia} a ${ultimoDia}, en las franjas de ${franjasTexto}. La parrilla completa, con el estilo y el nivel de cada franja, está publicada en la página de horarios.`,
      },
      {
        q: "¿Dónde estáis?",
        a: "En el Gimnasio Aranha, en la Rambla del Garraf, 32, primera planta, en Sant Pere de Ribes, pegado a Vilanova i la Geltrú. Si te cuesta encontrarnos, escríbenos por WhatsApp y te guiamos.",
      },
      {
        q: "¿Puedo cambiarme de grupo a mitad de temporada?",
        a: "Escríbenos y vemos qué grupo tiene hueco y encaja con tu nivel en ese momento.",
      },
    ],
  },
  {
    id: "precios-y-plazas",
    titulo: "Precios y plazas",
    link: { href: "/socio-fundador", label: "Ver la plaza fundadora" },
    items: [
      {
        q: "¿Cuánto cuesta?",
        a: `Un estilo son ${precios.base} €/${precios.periodo} y cada estilo adicional suma ${precios.estiloExtra} €/${precios.periodo}, hasta la tarifa plana de ${precios.flat} €/${precios.periodo} con todas las disciplinas. Durante la apertura hay además una tarifa fundadora más baja, con plazas limitadas, que tienes detallada en la página de socio fundador. Y antes de decidir, tienes una clase de prueba para conocer el ambiente.`,
      },
      {
        q: "¿Puedo combinar varias disciplinas?",
        a: "Sí. Puedes sumar los estilos que quieras y, a partir de cuatro, sale a cuenta la tarifa plana; la plaza fundadora incluye directamente todas las disciplinas regulares de tu nivel o inferior.",
      },
      {
        q: "¿Hay permanencia?",
        a: "No. Puedes darte de baja cuando quieras; ten en cuenta solo que la tarifa fundadora, si la tienes, no se recupera al volver.",
      },
    ],
  },
  {
    id: "ambiente-y-comunidad",
    titulo: "Ambiente y comunidad",
    link: { href: "/eventos", label: "Ver los próximos eventos" },
    items: [
      {
        q: "¿Hay ambiente de verdad o es solo la clase?",
        a: "Se queda gente charlando al acabar y hay salidas informales fuera de horario — no es solo entrar, bailar y salir.",
      },
      {
        q: "¿Es un ambiente ligón o es normal?",
        a: "Es un grupo normal centrado en bailar y pasarlo bien; nadie te va a incomodar.",
      },
      {
        q: "¿Organizáis socials o eventos fuera de clase?",
        a: "Escríbenos y te contamos qué hay planeado; la idea es que el grupo se vea también fuera del horario de clase.",
      },
    ],
  },
];

/** Todas las preguntas en orden, para el `FAQPage` de JSON-LD. */
export const faqTodas: FaqItem[] = faqGrupos.flatMap((g) => g.items);
