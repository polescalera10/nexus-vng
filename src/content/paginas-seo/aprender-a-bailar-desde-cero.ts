import type { PaginaSeo } from "@/content/paginas-seo";

/*
  Consulta de NIVEL, no de estilo: "no he bailado nunca". La respuesta útil no
  es una disciplina, es el jueves del cartel, que es donde están los dos grupos
  0 seguidos (Salsa 0 a las 20:30 y Bachata 0 a las 21:30).

  Ese dato sale de `content/horario-regular.ts`, no se escribe a mano en el
  cuerpo más que como referencia: el horario real lo pinta `estilosHorario`.
*/
export const desdeCero: PaginaSeo = {
  slug: "aprender-a-bailar-desde-cero",
  keywordPrincipal: "aprender a bailar desde cero",
  keywordsSecundarias: [
    "clases de baile para principiantes adultos",
    "nunca he bailado",
    "clases de baile nivel cero Vilanova",
    "empezar a bailar de adulto",
  ],
  noCanibaliza:
    "La home y /clases atacan estilo + ciudad. Esta ataca el nivel: quien no sabe qué baile quiere, sabe que no sabe bailar. Su cuerpo habla de grupos 0, de tiempos de aprendizaje y de miedos, no de una disciplina.",
  metaTitle: "Aprender a bailar desde cero en Vilanova",
  description:
    "Nunca has bailado y quieres empezar de adulto. Los grupos desde cero, qué pasa el primer mes y cuánto tardarás, en Vilanova i la Geltrú. Escríbenos.",
  eyebrow: "Nivel cero",
  h1: "Aprender a bailar desde cero en Vilanova i la Geltrú",
  lead: "Empezar de adulto, sin haber bailado nunca y sin sentido del ritmo declarado. Es el punto de partida de la mitad de la escuela cada septiembre.",
  estilosHorario: ["Salsa", "Bachata"],
  imagen: {
    src: "/media/clases/bachata-ancha.jpg",
    alt: "Alumnos aprendiendo el paso base en una clase de nivel inicial de NEXUS VNG",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `Hay dos grupos pensados para quien no ha bailado nunca: **Salsa 0** y **Bachata 0**. Los dos son el mismo día, seguidos, así que se puede probar uno o encadenar los dos y decidir después.

No se da nada por sabido. Ni el paso base, ni el tiempo musical, ni saber distinguir dónde empieza una canción. Eso se enseña en clase.

## "Es que yo no tengo ritmo"

Es la frase que más se repite en el primer WhatsApp, y casi siempre significa otra cosa: que nunca nadie te ha enseñado a contar la música. Contar hasta ocho y reconocer dónde cae el golpe fuerte es una habilidad que se entrena, igual que leer.

Lo que sí es verdad es que a algunas personas les cuesta más tiempo. Y que ese tiempo se acorta muchísimo si vienes cada semana. La constancia gana al talento en los tres primeros meses, sin excepción.

## Qué pasa el primer mes

| Semana | Qué se trabaja | Qué sientes |
|---|---|---|
| 1 | Paso base, peso del cuerpo, cuenta de ocho | Torpe, mirando los pies |
| 2 | Paso base sin mirar al suelo, primera figura | Sigues contando en voz baja |
| 3 | Dos o tres figuras encadenadas | La primera vez que sale sin pensarlo |
| 4 | Enlazar figuras sobre una canción entera | Empiezas a escuchar la música, no a contar |

No es una promesa de resultados, es lo que se ve en la sala curso tras curso. Hay gente que va más rápido y gente que necesita el doble. Ninguna de las dos cosas dice nada sobre si vas a acabar bailando.

## Salsa o bachata para empezar

La bachata suele costar menos las primeras semanas: el paso base es corto, se repite y la música va más despacio. La salsa cubana pide algo más de paciencia, pero engancha por otra cosa, que es que se baila en grupo.

La comparación completa, con orígenes, música y qué cuesta más de cada una, está en [salsa cubana o bachata: por cuál empezar](/blog/salsa-cubana-o-bachata-cual-empezar).

Si la duda es otra (qué salsa se baila aquí), la respuesta está en [clases de salsa en Vilanova](/clases-de-salsa-en-vilanova).

## El nivel lo asigna el profe

No hay examen ni formulario de autoevaluación. En la clase de prueba el profesor te ve bailar y te dice en qué grupo encajas. Si vienes de cero, el grupo es el 0 y no hay más que hablar. Si has bailado algo alguna vez, puede que te mande directo al 1.

Es deliberado: la mitad de la gente se pone un nivel de más por vergüenza y la otra mitad, uno de menos.

## Miedos que se pasan solos

- **"Voy a ser el peor."** En un grupo 0 todo el mundo es el peor. Ese es el punto.
- **"Soy mayor para empezar."** Los grupos se forman por nivel, no por edad. En un grupo de cero, lo que os iguala a todos es que ninguno sabe el paso base.
- **"No voy a conocer a nadie."** Se rota de pareja cada pocos minutos, así que en una hora bailas con casi todo el grupo. Lo explicamos en [clases de baile sin pareja](/clases-de-baile-sin-pareja).
- **"Y si no me gusta, ¿me he atado un año?"** No. La cuota es mensual.

## Cuánto tardas en bailar una canción entera

Depende de ti y de cuánto vengas, pero el hito que la gente recuerda no es dominar una figura difícil: es la primera canción entera en una fiesta sin pararse a contar. Cuánto se tarda en llegar ahí lo desarrollamos en [cuánto se tarda en aprender a bailar salsa](/blog/cuanto-se-tarda-en-aprender-a-bailar-salsa).`,
  faq: [
    {
      q: "¿Hay clases para quien no ha bailado nunca?",
      a: "Sí. Salsa 0 y Bachata 0 son los grupos de nivel inicial y se empieza por el paso base. No se da por sabido nada.",
    },
    {
      q: "No tengo sentido del ritmo. ¿Puedo aprender igual?",
      a: "Sí. Contar la música y reconocer el golpe fuerte es algo que se entrena en clase. A algunas personas les lleva más semanas que a otras, pero no es un requisito previo.",
    },
    {
      q: "¿Hay edad máxima para empezar a bailar?",
      a: "No. Los grupos se forman por nivel y no por edad, así que en un mismo grupo hay gente de edades muy distintas.",
    },
    {
      q: "¿Tengo que comprometerme por un curso entero?",
      a: "No. La cuota es mensual, así que puedes probar un mes y decidir después.",
    },
    {
      q: "¿Qué me llevo a la primera clase?",
      a: "Ropa cómoda y un calzado con la suela lisa que no se agarre al suelo. No hace falta comprar zapatos de baile para empezar.",
    },
  ],
  waMensaje: "¡Hola! No he bailado nunca y me gustaría empezar desde cero 🙂",
  enlaces: [
    {
      href: "/clases-de-salsa-en-vilanova",
      label: "Clases de salsa en Vilanova i la Geltrú",
      texto: "Qué salsa se baila aquí y en qué grupo entrarías.",
    },
    {
      href: "/clases/bachata",
      label: "Clases de bachata en Vilanova i la Geltrú",
      texto: "La ficha de bachata: qué se aprende y cómo es la clase.",
    },
    {
      href: "/clases-de-baile-sin-pareja",
      label: "Clases de baile sin pareja",
      texto: "Cómo funciona la rotación si vienes solo.",
    },
    {
      href: "/blog/cuanto-se-tarda-en-aprender-a-bailar-salsa",
      label: "Cuánto se tarda en aprender a bailar salsa",
      texto: "Los hitos reales, mes a mes, sin promesas de treinta días.",
    },
    {
      href: "/faq",
      label: "Preguntas frecuentes",
      texto: "El resto de dudas que llegan antes de la primera clase.",
    },
  ],
};
