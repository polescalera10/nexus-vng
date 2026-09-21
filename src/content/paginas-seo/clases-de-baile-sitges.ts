import type { PaginaSeo } from "@/content/paginas-seo";
import { site } from "@/lib/site";

/*
  Página de municipio VECINO. El riesgo aquí no es SEO, es legal y de
  confianza: una página titulada "clases de baile en Sitges" que dé a entender
  que hay sala en Sitges es engañosa. Por eso lo primero que dice el cuerpo,
  antes que nada, es que la sala está en Sant Pere de Ribes.

  Mismo motivo por el que no lleva horario propio ni NAP de Sitges: el NAP es
  uno solo (lib/site.ts) y una citación local inventada en un municipio donde
  no hay local hace daño a la ficha de Google, no la ayuda.

  Nada de minutos de trayecto ni de números de carretera: son dato verificable
  y aquí no hay fuente. Lo que sí es verificable es que los dos municipios son
  limítrofes.
*/
export const sitges: PaginaSeo = {
  slug: "clases-de-baile-sitges",
  keywordPrincipal: "clases de baile en Sitges",
  keywordsSecundarias: [
    "clases de salsa Sitges",
    "clases de bachata Sitges",
    "bailar salsa cerca de Sitges",
  ],
  noCanibaliza:
    "Municipio distinto de Vilanova i la Geltrú y de Sant Pere de Ribes. Es la única página que habla del desplazamiento desde Sitges; no repite el NAP ni el horario, que viven en la página de Sant Pere de Ribes.",
  metaTitle: "Clases de baile cerca de Sitges",
  description:
    "Salsa, bachata y clases urbanas a un paso de Sitges: la sala está en Sant Pere de Ribes, municipio vecino. Reserva tu clase de prueba por WhatsApp.",
  eyebrow: "Desde Sitges",
  h1: "Clases de baile cerca de Sitges",
  lead: "No tenemos sala en Sitges. La tenemos en Sant Pere de Ribes, el municipio de al lado, y buena parte del grupo hace ese trayecto cada semana.",
  estilosHorario: [],
  imagen: {
    src: "/media/clases/bachata-ancha.jpg",
    alt: "Clase de bachata en la sala de NEXUS VNG, a pocos kilómetros de Sitges",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `Vamos con lo primero: **la sala no está en Sitges**. Está en ${site.nap.addressLocality}, que es el municipio limítrofe, dentro del ${site.nap.venue} (${site.nap.streetAddress}).

Lo decimos así de claro porque hay páginas que titulan con el nombre de un municipio y luego te mandan a veinte kilómetros. Si buscabas una escuela dentro de Sitges, esta no lo es. Si lo que buscabas es dónde bailar salsa o bachata sin irte a Barcelona, sigue leyendo.

## Por qué mucha gente de Sitges acaba aquí

Sitges tiene mucha oferta de fiesta y bastante poca de aprendizaje continuado en bailes latinos. Lo que suele haber son talleres sueltos, intensivos de fin de semana y clases atadas a un local de ocio. Están bien para probar, pero no dan lo que sí da un curso regular: un grupo fijo, un nivel que progresa y el mismo profe cada semana.

Eso es lo que hay en NEXUS VNG: cartel semanal de lunes a viernes, grupos por nivel de cero a intermedio y cuota mensual.

## Qué encaja bien si vienes de fuera

Si haces trayecto, la clase de una hora suelta compensa poco. Dos cosas funcionan mejor:

- **Encadenar dos clases el mismo día.** Las franjas van seguidas cada hora, así que se pueden coger dos estilos en la misma tarde y hacer un solo viaje.
- **Coger la tarifa plana** si vas a venir varias veces por semana. A partir del cuarto estilo sale a cuenta, y el cálculo está en [precios](/precios-clases-de-baile-vilanova).

El cartel con las franjas de cada día está en [horarios](/horarios), y la dirección exacta con mapa, en [contacto](/contacto).

## Qué se baila

Salsa cubana y bachata en pareja, con grupos desde cero. Reparto y reggaetón. Heels y sexy style. Lady style de salsa y de bachata. Y dos grupos de compañía, por proyecto y audición.

La lista entera, con la ficha de cada disciplina, está en [clases](/clases).

## Taller suelto o curso regular: no es lo mismo

Vale la pena tenerlo claro antes de decidir si el trayecto compensa.

Un **taller suelto** te enseña una secuencia concreta en dos horas. Sales sabiendo hacer esa secuencia y poco más, porque no hay nadie haciendo seguimiento de cómo colocas el peso o de por qué ese giro se te va.

Un **curso regular** es lo contrario: se avanza poco cada semana, con el mismo profe, que ya sabe lo que te costó el martes pasado. Es más lento de sensación y muchísimo más rápido de resultado.

Los intensivos tienen su sitio, y aquí también los hay: están en [intensivos](/intensivos). Pero no sustituyen al curso, lo complementan.

## Qué se necesita para la primera clase

Ropa cómoda, un calzado de suela lisa que gire sin agarrarse y agua. Nada más. No hace falta comprar zapatos de baile ni traer pareja, y no hay ropa de uniforme.

## Si nunca has bailado

No importa que vengas de fuera: los grupos de nivel cero empiezan por el paso base y no dan nada por sabido. Está contado en [aprender a bailar desde cero](/aprender-a-bailar-desde-cero).

Y si lo que te frena es venir sin nadie, la respuesta está en [clases de baile sin pareja](/clases-de-baile-sin-pareja): se rota de compañero durante la clase y la mayoría empieza sola.

## Dónde bailar de verdad una vez sepas

Aprender es la mitad. La otra es tener dónde soltarlo un sábado. Las fiestas y socials de la comarca las recogemos en [dónde bailar salsa y bachata en el Garraf](/blog/donde-bailar-salsa-y-bachata-en-el-garraf).`,
  faq: [
    {
      q: "¿Tenéis sala en Sitges?",
      a: `No. La sala está en ${site.nap.addressLocality}, el municipio limítrofe, dentro del ${site.nap.venue}.`,
    },
    {
      q: "¿Merece la pena el desplazamiento desde Sitges?",
      a: "Depende de lo que busques. Si quieres un taller suelto, probablemente no. Si quieres un curso regular con grupo fijo y progresión por niveles, es la oferta más cercana.",
    },
    {
      q: "¿Puedo hacer dos clases el mismo día para no venir dos veces?",
      a: "Sí. Las franjas van seguidas cada hora, así que se pueden encadenar dos estilos en la misma tarde. Es lo que hace casi todo el que viene de otro municipio.",
    },
    {
      q: "¿Hay clases en fin de semana?",
      a: "El curso regular es de lunes a viernes. Los fines de semana se reservan para intensivos y eventos puntuales, que se anuncian aparte.",
    },
  ],
  waMensaje: "¡Hola! Vengo de Sitges y me gustaría info sobre las clases de baile 🙂",
  enlaces: [
    {
      href: "/clases-de-baile-sant-pere-de-ribes",
      label: "Clases de baile en Sant Pere de Ribes",
      texto: "La sala, la dirección exacta y cómo llegar.",
    },
    {
      href: "/clases",
      label: "Todas las clases de baile",
      texto: "Las disciplinas del cartel, una por una.",
    },
    {
      href: "/precios-clases-de-baile-vilanova",
      label: "Precios de las clases",
      texto: "Cuota por estilo y cuándo compensa la tarifa plana si haces trayecto.",
    },
    {
      href: "/blog/donde-bailar-salsa-y-bachata-en-el-garraf",
      label: "Dónde bailar salsa y bachata en el Garraf",
      texto: "Las fiestas y socials de la comarca, para soltar lo aprendido.",
    },
  ],
};
