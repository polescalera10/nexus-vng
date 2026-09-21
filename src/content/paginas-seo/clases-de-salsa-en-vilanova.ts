import type { PaginaSeo } from "@/content/paginas-seo";

/*
  "Clases de salsa en Vilanova" es la consulta de quien todavía no sabe que hay
  varias salsas. Por eso esta página NO se llama "salsa cubana": si el título
  te obliga a elegir antes de saber qué eliges, te vas.

  Datos de la escuela confirmados por Pol (16-09-2026) y horario leído del
  cartel 26·27 (`content/horario-regular.ts`).
*/
export const salsaVilanova: PaginaSeo = {
  slug: "clases-de-salsa-en-vilanova",
  keywordPrincipal: "clases de salsa en Vilanova i la Geltrú",
  keywordsSecundarias: [
    "bailar salsa en Vilanova",
    "academia de salsa Vilanova",
    "salsa cubana o salsa en línea",
    "clases de salsa para principiantes",
  ],
  noCanibaliza:
    "/clases/salsa-cubana explica qué es la salsa cubana y cómo es su clase, y es la que lleva el schema Course. Esta responde antes: qué salsas existen, cuál se da aquí y en qué grupo entras. Enlaza hacia la ficha, no compite con ella.",
  metaTitle: "Clases de salsa en Vilanova i la Geltrú",
  description:
    "Clases de salsa en Vilanova i la Geltrú, de cero a avanzado. Qué salsa se baila aquí, en qué grupo entras y cuándo. Reserva tu clase de prueba por WhatsApp.",
  eyebrow: "Empezar por aquí",
  h1: "Clases de salsa en Vilanova i la Geltrú",
  lead: "Hay más de una salsa y casi nadie lo sabe antes de la primera clase. Aquí se baila salsa cubana. Esto es lo que significa, en qué grupo entrarías y qué día te toca.",
  estilosHorario: ["Salsa", "Lady Salsa", "Cía Salsa"],
  imagen: {
    src: "/media/clases/salsa-cubana-ancha.jpg",
    alt: "Grupo de alumnos bailando salsa cubana en una clase de NEXUS VNG, junto a Vilanova i la Geltrú",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `En NEXUS VNG se baila **salsa cubana**, también llamada casino. Es la que se baila en círculo, cambiando de pareja, con figuras que se encadenan sin parar. Si buscas clases de salsa en Vilanova i la Geltrú y no tenías ni idea de que había variantes, no pasa nada: casi nadie lo sabe hasta que entra en una sala.

Hay tres grupos de salsa en el cartel semanal, de nivel cero a intermedio, y dos formatos más para quien quiere ir por libre: lady style y compañía. La sala está en el Gimnasio Aranha, en la Rambla del Garraf 32, a cinco minutos de Vilanova.

## Las dos salsas: cubana y en línea

La diferencia se ve en el suelo. En la **salsa cubana** la pareja gira una alrededor de la otra, describiendo un círculo. En la **salsa en línea** (también llamada salsa LA o New York) la pareja se desplaza adelante y atrás sobre una línea imaginaria, como si compartiera un carril.

Eso cambia casi todo lo demás:

| | Salsa cubana | Salsa en línea |
|---|---|---|
| Recorrido | Circular, los dos giran | Recto, ida y vuelta sobre un eje |
| Ambiente | Callejero y de grupo | Más técnico y escénico |
| Se baila en grupo | Sí, es la rueda de casino | Poco habitual |
| Música típica | Son y timba cubanos | Salsa dura, salsa romántica |

Ninguna es mejor. Son dos formas de bailar sobre la misma familia musical, que según la [Britannica](https://www.britannica.com/art/salsa-music) hunde sus raíces en el son cubano y en la música afrocaribeña que llegó a Nueva York a mediados del siglo XX.

Si vienes de bailar en línea, la cubana te va a pedir que sueltes el eje y aprendas a llevar el peso en círculo. Es cuestión de semanas, no de empezar de cero.

## En qué grupo entras

El nivel no lo eliges tú en un formulario. Lo dice el profe después de verte bailar, normalmente en la clase de prueba. Es la forma más rápida de no acabar en un grupo que te queda grande o pequeño.

- **Salsa 0** es para quien no ha bailado nunca. El primer mes se trabaja el paso base, el peso del cuerpo y las dos o tres figuras con las que ya se puede bailar una canción entera.
- **Salsa 1** da por sabido el paso base. Se entra en figuras encadenadas, cambios de mano y los primeros giros.
- **Salsa 2** trabaja ya musicalidad, tiempo partido y figuras largas, y es donde la rueda de casino empieza a funcionar de verdad.

Si llevas años bailando, el grupo que te toca puede sorprenderte en cualquiera de los dos sentidos. Es normal y se corrige sobre la marcha.

## Cómo es una clase de salsa aquí

Dura una hora. Se empieza en círculo con el paso base y una entrada en calor corta, se monta una secuencia nueva y se baila durante el resto de la clase.

La pareja **rota**, es decir, vas cambiando de compañero cada pocos minutos. Es voluntario: quien prefiere quedarse con la misma persona toda la clase, se queda. Pero la salsa cubana es un baile social y aprender a llevar y a seguir a gente distinta es la mitad del oficio.

No hace falta venir con pareja. La mayoría de la gente que empieza viene sola. Lo contamos entero en [clases de baile sin pareja](/clases-de-baile-sin-pareja).

## Lady style y compañía

Además de los grupos en pareja hay dos formatos que se bailan en solitario o por proyecto:

- **Lady Salsa** trabaja brazos, cadera, giros y presencia sin depender de nadie. Es el complemento natural de la salsa en pareja, no su sustituto.
- **Cía Salsa** es el grupo de compañía: un montaje coreográfico de temporada, con ensayo continuo y actuaciones. Se entra por audición.

Los dos entran en la tarifa plana y en la cuota como una clase más.

## Qué cuesta

Un estilo son 35 € al mes. Cada estilo adicional suma 20 €, y a partir del cuarto compensa la tarifa plana de 100 €, que da acceso a todo. La clase de prueba tiene un coste que se te descuenta si te apuntas. El desglose está en [precios de las clases de baile](/precios-clases-de-baile-vilanova).

## Y si al final lo tuyo es la bachata

Pasa a menudo: se viene a por salsa y se acaba en las dos. Son los dos bailes con más grupos del cartel y muchos alumnos combinan. Si dudas, la comparación está aquí: [salsa cubana o bachata, por cuál empezar](/blog/salsa-cubana-o-bachata-cual-empezar).`,
  faq: [
    {
      q: "¿Qué tipo de salsa se baila en NEXUS VNG?",
      a: "Salsa cubana, también llamada casino. La pareja gira en círculo y las figuras se encadenan. No se dan clases de salsa en línea (LA o New York).",
    },
    {
      q: "Nunca he bailado salsa. ¿Puedo empezar igual?",
      a: "Sí. El grupo Salsa 0 está pensado exactamente para eso: se empieza por el paso base y no se da nada por sabido. Cada temporada entra gente que no ha bailado nunca.",
    },
    {
      q: "¿Quién decide en qué grupo de salsa entro?",
      a: "El profesor, después de verte bailar en la clase de prueba. Así el grupo encaja con lo que ya sabes y no con lo que crees saber.",
    },
    {
      q: "Vengo de bailar salsa en línea. ¿Me sirve de algo?",
      a: "Sí. El oído, el tiempo musical y la conexión con la pareja se aprovechan enteros. Lo que cambia es el recorrido: hay que acostumbrarse a girar en círculo en vez de avanzar sobre una línea.",
    },
    {
      q: "¿Cuántas clases de salsa hay a la semana?",
      a: "Tres grupos por nivel (Salsa 0, 1 y 2), más Lady Salsa y el grupo de compañía. Los días y horas exactos están en el cartel de horarios.",
    },
  ],
  waMensaje: "¡Hola! Me gustaría info sobre las clases de salsa 💃",
  enlaces: [
    {
      href: "/clases/salsa-cubana",
      label: "Clases de salsa cubana en Vilanova i la Geltrú",
      texto: "La ficha completa: qué es el casino, qué se aprende y cómo es la clase por dentro.",
    },
    {
      href: "/clases/lady-style-salsa",
      label: "Lady style salsa",
      texto: "Brazos, cadera y giros trabajados en solitario para tu salsa en pareja.",
    },
    {
      href: "/horarios",
      label: "Horarios de clases de baile",
      texto: "El cartel de la temporada 26·27 con los cinco días y todas las franjas.",
    },
    {
      href: "/blog/rueda-de-casino-que-es",
      label: "Qué es la rueda de casino",
      texto: "La forma de bailar salsa cubana en grupo, con las voces que se cantan.",
    },
  ],
};
