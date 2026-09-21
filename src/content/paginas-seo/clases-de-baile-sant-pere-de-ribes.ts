import type { PaginaSeo } from "@/content/paginas-seo";
import { site } from "@/lib/site";

/*
  La única página del sitio donde la ciudad del copy y la del NAP coinciden.

  Contexto (decisión de Pol, 01-08-2026): el copy de marca usa Vilanova porque
  es de donde viene el público y donde estará el local propio, pero la sala
  está físicamente en Sant Pere de Ribes. Esa asimetría tiene un coste en SEO
  local (Google no te pone en el mapa de Vilanova con dirección de Ribes) y la
  auditoría del 15-09-2026 lo dejó por escrito: atacar también Ribes, donde la
  competencia es más floja Y la dirección es la de verdad.

  Por eso aquí el NAP se interpola desde `lib/site.ts` en vez de escribirse:
  una citación local que no coincide letra por letra con la ficha de Google no
  suma, resta.
*/
export const santPereDeRibes: PaginaSeo = {
  slug: "clases-de-baile-sant-pere-de-ribes",
  keywordPrincipal: "clases de baile en Sant Pere de Ribes",
  keywordsSecundarias: [
    "clases de salsa Sant Pere de Ribes",
    "bachata Sant Pere de Ribes",
    "escuela de baile Les Roquetes",
    "bailar en el Garraf",
  ],
  noCanibaliza:
    "Municipio distinto al de todas las demás páginas, que hablan de Vilanova i la Geltrú. Aquí la dirección del cuerpo es la del NAP real, así que no compite: completa.",
  metaTitle: "Clases de baile en Sant Pere de Ribes",
  description:
    "La sala está en Sant Pere de Ribes: salsa, bachata y clases urbanas en la Rambla del Garraf, dentro del Gimnasio Aranha. Reserva tu clase de prueba.",
  eyebrow: "Aquí mismo",
  h1: "Clases de baile en Sant Pere de Ribes",
  lead: "Si buscas dónde bailar en Ribes, no hace falta que salgas del municipio: la sala de NEXUS VNG está en la Rambla del Garraf, dentro del Gimnasio Aranha.",
  estilosHorario: ["Salsa", "Bachata", "Reparto", "Reggaetón", "Heels", "Sexy Style"],
  imagen: {
    src: "/media/comunidad/sala-panoramica.jpg",
    alt: "Sala de baile de NEXUS VNG en el Gimnasio Aranha de Sant Pere de Ribes",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `La escuela se llama NEXUS VNG y la mayoría de sus alumnos vienen de Vilanova i la Geltrú, pero **la sala está en Sant Pere de Ribes**: ${site.nap.venue}, ${site.nap.streetAddress}, ${site.nap.postalCode}.

Es el mismo cartel de clases, los mismos profes y los mismos precios. La diferencia, si vives en Ribes, es que no tienes que coger el coche para ir a otro municipio.

## Dónde es exactamente

| | |
|---|---|
| Sala | ${site.nap.venue} |
| Dirección | ${site.nap.streetAddress} |
| Municipio | ${site.nap.addressLocality} (${site.nap.postalCode}), ${site.area} |
| Teléfono | ${site.nap.telephoneDisplay} |

Las clases son en la primera planta del gimnasio. Hay aparcamiento en la zona y desde cualquier punto del municipio el trayecto en coche es de pocos minutos.

El mapa, con la ficha verificada de Google, está en [contacto](/contacto).

## Qué se baila

Seis disciplinas en el cartel semanal, repartidas de lunes a viernes entre las 18:30 y las 22:30:

- **Salsa cubana** y **bachata**, en pareja, con grupos por nivel desde cero.
- **Reparto** y **reggaetón**, el género urbano cubano y el latino, sin pareja.
- **Heels** y **sexy style**, técnica, líneas y potencia.
- **Lady style** de salsa y de bachata, y dos grupos de **compañía** por proyecto.

El cartel completo con días y horas está en [horarios](/horarios).

## Qué día encaja con qué

El cartel reparte las disciplinas de forma que casi cualquier agenda encuentra hueco. Los grupos de nivel cero están concentrados el mismo día y seguidos, así que quien empieza puede probar los dos bailes de pareja en una sola tarde. Las clases en solitario se reparten entre el martes y el miércoles, y los grupos de compañía cierran la semana.

Si un día te va bien y otro no, dilo al escribir: a veces hay el mismo estilo en dos franjas distintas.

## Si vienes desde Vilanova, Sitges o Cubelles

Buena parte del grupo lo hace. Ribes está en el centro del Garraf, así que la sala queda a un trayecto corto desde los municipios de alrededor. Para quien viene de Sitges lo contamos aparte, en [clases de baile en Sitges](/clases-de-baile-sitges).

## Por qué la escuela se llama NEXUS VNG si está en Ribes

Porque el público es de Vilanova y el local propio previsto también. La sala de hoy es la del Gimnasio Aranha, que está en Ribes, y lo decimos tal cual en la dirección, en la ficha de Google y aquí. Preferimos que el nombre no cuadre con el mapa a que la dirección no cuadre con la realidad.

Si algún día se abre en Vilanova, cambiará la dirección en la web, en la ficha y en los directorios el mismo día.

## Bailar en un gimnasio no es bailar en una sala de aeróbic

Es la duda que aparece cuando alguien lee "gimnasio". La sala de baile es una sala de baile: suelo para girar, espejo y equipo de sonido, en la primera planta y con su horario propio. No se comparte el espacio con máquinas ni con otra actividad a la vez.

Lo que sí aporta estar dentro del Aranha es lo obvio: vestuarios, un sitio donde dejar las cosas y una puerta a la que llegar en coche sin dar vueltas.

## Cómo se empieza

Escribes por WhatsApp, nos dices qué te apetece bailar y qué días te van, y te decimos a qué grupo venir. La primera clase es de prueba: tiene coste y se descuenta de la cuota si te quedas. El desglose de tarifas está en [precios](/precios-clases-de-baile-vilanova).

No hace falta ser socio del gimnasio. Las clases de baile tienen su propia cuota y son independientes.

Si no has bailado nunca, el punto de entrada es otro y lo explicamos entero en [aprender a bailar desde cero](/aprender-a-bailar-desde-cero). Y si lo que te frena es venir sin nadie, se resuelve en [clases de baile sin pareja](/clases-de-baile-sin-pareja).`,
  faq: [
    {
      q: "¿Dónde está la sala de NEXUS VNG?",
      a: `En el ${site.nap.venue}, ${site.nap.streetAddress}, ${site.nap.postalCode} ${site.nap.addressLocality}. Las clases son en la primera planta.`,
    },
    {
      q: "La escuela se llama NEXUS VNG. ¿Está en Vilanova o en Sant Pere de Ribes?",
      a: "La sala está en Sant Pere de Ribes. El nombre viene de Vilanova i la Geltrú, que es de donde vienen la mayoría de alumnos y donde está previsto el local propio.",
    },
    {
      q: "¿Hay dónde aparcar?",
      a: "Sí, hay aparcamiento en la zona de la Rambla del Garraf. Desde cualquier punto del municipio el trayecto en coche es de pocos minutos.",
    },
    {
      q: "¿Hace falta ser socio del gimnasio para venir a bailar?",
      a: "No. Las clases de baile son de NEXUS VNG y tienen su propia cuota, independiente de la del gimnasio.",
    },
    {
      q: "¿Qué días hay clase?",
      a: "De lunes a viernes, entre las 18:30 y las 22:30, con cuatro franjas por día. El cartel completo está en la página de horarios.",
    },
  ],
  waMensaje: "¡Hola! Vivo en Sant Pere de Ribes y me gustaría info sobre las clases 🙂",
  enlaces: [
    {
      href: "/contacto",
      label: "Cómo llegar y mapa",
      texto: "La ubicación exacta, el mapa y las formas de escribirnos.",
    },
    {
      href: "/horarios",
      label: "Horarios de clases de baile",
      texto: "El cartel de la temporada 26·27, día por día.",
    },
    {
      href: "/clases-de-baile-sitges",
      label: "Clases de baile en Sitges",
      texto: "Si vienes del municipio vecino, el trayecto y los horarios que encajan.",
    },
    {
      href: "/sobre-nosotros",
      label: "Sobre NEXUS VNG",
      texto: "Quiénes somos, de dónde sale la escuela y cómo trabajamos.",
    },
  ],
};
