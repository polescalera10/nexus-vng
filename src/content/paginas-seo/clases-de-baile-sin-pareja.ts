import type { PaginaSeo } from "@/content/paginas-seo";

/*
  La objeción número uno que llega por WhatsApp. Tenía respuesta en /faq y en
  las fichas, en una línea suelta cada vez; aquí tiene página propia porque es
  una consulta con intención propia, no un matiz de otra.

  Confirmado por Pol (16-09-2026): la rotación es voluntaria y el nivel lo
  asigna el profe. Nada de cifras de alumnos ni porcentajes inventados.
*/
export const sinPareja: PaginaSeo = {
  slug: "clases-de-baile-sin-pareja",
  keywordPrincipal: "clases de baile sin pareja",
  keywordsSecundarias: [
    "bailar salsa sin pareja",
    "apuntarse a clases de baile solo",
    "clases de bachata sin pareja",
    "rotación en clases de baile",
  ],
  noCanibaliza:
    "Ninguna página del sitio ataca 'sin pareja'. La home y /clases atacan el estilo y la ciudad; /faq lo resuelve en dos líneas dentro de una lista de 20 preguntas. Aquí la consulta es la objeción, no el baile.",
  metaTitle: "Clases de baile sin pareja en Vilanova",
  description:
    "¿Se puede aprender a bailar sin pareja? Sí: así funciona la rotación en las clases de salsa y bachata de Vilanova i la Geltrú. Pregúntanos por WhatsApp.",
  eyebrow: "La duda de siempre",
  h1: "Clases de baile sin pareja en Vilanova i la Geltrú",
  lead: "Se puede, y es lo más habitual. La mayoría de la gente que empieza a bailar salsa o bachata viene sola. Esto es lo que pasa en clase cuando llegas sin nadie.",
  estilosHorario: [],
  imagen: {
    src: "/media/comunidad/clase-bachata.jpg",
    alt: "Alumnos rotando de pareja durante una clase de bachata en NEXUS VNG",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `**Sí, puedes apuntarte solo.** No hace falta traer pareja a ninguna clase de NEXUS VNG, ni a las de salsa y bachata, que se bailan en pareja, ni mucho menos a las que se bailan en solitario. La mayoría de la gente que entra por la puerta en septiembre viene sin conocer a nadie.

Que la pregunta se repita tanto tiene sentido: si nunca has pisado una sala, lo lógico es imaginarte plantado en una esquina mientras el resto baila en parejas ya formadas. No funciona así.

## Cómo funciona la rotación

En las clases en pareja la gente **rota**: cada pocos minutos cambias de compañero y sigues con el mismo ejercicio. El profe marca el cambio, todos se mueven un puesto y se repite la secuencia con otra persona.

Rotar no es solo una solución logística para los que vienen solos. Es la forma de aprender de verdad:

- Cada persona lleva y sigue distinto. Si solo bailas con una, aprendes a bailar con esa una.
- Los fallos se localizan antes. Si una figura te sale con cuatro personas y con la quinta no, el problema ya no es tuyo ni suyo: es concreto y se corrige.
- Cuando salgas a bailar a una fiesta, vas a bailar con desconocidos. La clase es el ensayo.

**La rotación es voluntaria.** Quien prefiere quedarse con la misma persona toda la clase, se queda, y nadie insiste. Pasa con parejas que vienen juntas, con quien está empezando y quiere terreno conocido, y con quien simplemente prefiere no tocar a desconocidos ese día.

## Si vienes con pareja, tampoco pasa nada

Las parejas que se apuntan juntas entran igual. Pueden rotar con el resto, que es lo que recomendamos, o quedarse juntos toda la hora. Lo único que no funciona bien es que los dos miembros estén en grupos de nivel distinto, porque el grupo lo asigna el profe según lo que ve, no según con quién llegas.

## Las clases que se bailan sin pareja, siempre

Hay una parte del cartel donde la pregunta ni se plantea, porque se baila en solitario de principio a fin:

- **Lady style salsa** y **lady style bachata**: brazos, cadera, giros y presencia.
- **Reggaetón** y **reparto**: técnica y actitud del género urbano.
- **Heels** y **sexy style**: potencia, líneas y control, con tacón o sin él.

Muchos alumnos combinan un baile en pareja con uno de estos. La [tarifa por estilos](/precios-clases-de-baile-vilanova) está pensada justo para eso.

## Qué pasa el primer día, en orden

1. Llegas y te presentas. No hay que formar pareja antes de entrar.
2. El profe coloca el círculo o las filas y reparte los roles.
3. Se empieza por el paso base, todos a la vez, sin pareja.
4. A los pocos minutos se prueba en pareja y empieza la rotación.
5. Si el número no cuadra, alguien descansa un turno o el profe entra a bailar. No se queda nadie mirando la hora entera.

Si quieres el detalle completo del primer día, está en [tu primera clase de baile, minuto a minuto](/blog/primera-clase-de-baile-que-esperar).

## Y si vengo solo, ¿voy a conocer a alguien?

Esa es la otra mitad de la pregunta, y es la que de verdad importa. La rotación hace que en una hora bailes con casi todo el grupo. En dos o tres semanas te sabes los nombres. Es el motivo por el que mucha gente que vino a aprender un paso se queda por la gente.`,
  faq: [
    {
      q: "¿Puedo apuntarme a clases de baile si no tengo pareja?",
      a: "Sí. No hace falta pareja para ninguna clase. En las de salsa y bachata se rota de compañero cada pocos minutos, y la mayoría de alumnos empieza viniendo solo.",
    },
    {
      q: "¿Es obligatorio rotar de pareja?",
      a: "No. La rotación es voluntaria: quien prefiere quedarse con la misma persona toda la clase, se queda, y no se le insiste.",
    },
    {
      q: "¿Qué pasa si sobra gente de un rol?",
      a: "Alguien descansa un turno o el profesor entra a bailar para cuadrar el número. Nadie se queda la hora entera sin bailar.",
    },
    {
      q: "Vengo con mi pareja. ¿Nos separan?",
      a: "Solo si queréis. Podéis rotar con el resto o quedaros juntos toda la clase. Lo que sí decide el profe es el grupo de nivel de cada uno, y puede no ser el mismo.",
    },
    {
      q: "¿Hay clases que se bailen sin pareja de principio a fin?",
      a: "Sí: lady style de salsa y de bachata, reggaetón, reparto, heels y sexy style se bailan en solitario. Muchos alumnos las combinan con un baile en pareja.",
    },
  ],
  waMensaje: "¡Hola! Quería apuntarme a bailar pero no tengo pareja, ¿cómo funciona? 🙂",
  enlaces: [
    {
      href: "/clases",
      label: "Todas las clases de baile",
      texto: "Las disciplinas del curso regular, en pareja y en solitario.",
    },
    {
      href: "/aprender-a-bailar-desde-cero",
      label: "Aprender a bailar desde cero",
      texto: "Si además de venir solo es la primera vez que bailas, empieza por aquí.",
    },
    {
      href: "/clases/lady-style-salsa",
      label: "Lady style salsa",
      texto: "Una de las clases que se bailan en solitario de principio a fin.",
    },
    {
      href: "/blog/primera-clase-de-baile-que-esperar",
      label: "Tu primera clase, minuto a minuto",
      texto: "Qué pasa desde que entras por la puerta hasta que te vas.",
    },
    {
      href: "/faq",
      label: "Preguntas frecuentes",
      texto: "Nivel, ritmo, precios y ambiente, resueltos en una página.",
    },
  ],
};
