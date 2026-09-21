import type { PaginaSeo } from "@/content/paginas-seo";

/*
  Por qué existe (21-09-2026, a la vista de Search Console).

  `/clases/heels` está en posición 4,8 con 36 impresiones y CERO clics. Eso no
  es falta de página: es que aparece y no se pulsa. Abrir otra ficha con la
  misma consulta ("clases de heels en Vilanova") sería canibalizarla.

  El hueco es otro, y es el mismo patrón que la salsa genérica: quien no conoce
  la palabra "heels" busca "clases de baile en tacones". Y además llega sin
  saber que aquí hay TRES clases distintas que se bailan con tacón. Esta página
  desambigua y reparte; la ficha de cada disciplina sigue explicando la suya.

  Horario leído de `content/horario-regular.ts` vía `estilosHorario`: aquí no
  se escriben días ni horas a mano.
*/
export const enTacones: PaginaSeo = {
  slug: "clases-de-baile-en-tacones",
  keywordPrincipal: "clases de baile en tacones",
  keywordsSecundarias: [
    "bailar con tacones",
    "clases de tacones en Vilanova",
    "qué es heels baile",
    "heels o sexy style",
  ],
  noCanibaliza:
    "/clases/heels explica qué es el heels y cómo es su clase, y es la que lleva el schema Course de esa disciplina. Esta responde antes: qué clases se bailan con tacón aquí (heels, sexy style y lady style) y cuál te toca. Enlaza a las tres.",
  metaTitle: "Clases de baile en tacones en Vilanova",
  description:
    "Tres clases se bailan con tacón en Vilanova i la Geltrú: heels, sexy style y lady style. En qué se diferencian y cuál te toca. Escríbenos por WhatsApp.",
  eyebrow: "Con tacón",
  h1: "Clases de baile en tacones en Vilanova i la Geltrú",
  lead: "Heels, sexy style y lady style. Las tres se bailan con tacón, las tres son distintas y en ninguna hace falta saber andar con ellos.",
  estilosHorario: ["Heels", "Sexy Style", "Lady Salsa", "Bachata Lady"],
  imagen: {
    src: "/media/clases/heels-ancha.jpg",
    alt: "Alumna bailando con tacones durante una clase de heels en NEXUS VNG",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  waMensaje: "¡Hola! Me gustaría info sobre las clases que se bailan con tacones 👠",
  cuerpo: `Si has buscado "clases de baile en tacones" es probable que no supieras cómo se llama lo que quieres. Normal: el nombre cambia según qué se trabaje.

En NEXUS VNG hay **tres clases distintas** que se bailan con tacón, todas en solitario y sin pareja. Esto es qué hace cada una y cuál te encaja.

## Las tres, cara a cara

| | Heels | Sexy style | Lady style |
|---|---|---|---|
| De dónde viene | Danza urbana de estudio | Trabajo de suelo y actitud | Salsa y bachata |
| Qué entrena | Líneas, potencia y coreografía | Control, respiración y presencia | Brazos, cadera y giros |
| El tacón es… | El material de trabajo | Un recurso más | Opcional |
| Para qué sirve fuera | Escenario, vídeo, show | Seguridad y desinhibición | Bailar mejor en pareja |
| Hace falta pareja | No | No | No |

**Heels** es el que más se parece a lo que ves en vídeos: coreografía sobre tacones, con técnica de danza detrás. Se trabaja la línea, el peso y la forma de caminar antes que la figura difícil.

**Sexy style** va por otro lado. Hay trabajo de suelo, respiración y control, y el objetivo no es la coreografía escénica sino cómo te mueves y cómo te sientes moviéndote.

**Lady style** no es una clase de tacones: es el trabajo en solitario del lenguaje corporal de la [salsa](/clases/lady-style-salsa) y de la [bachata](/clases/lady-style-bachata). Aparece aquí porque mucha gente que busca tacones en realidad quiere esto: mejorar lo que hace en pareja.

## Cuál te toca

- **Quieres aprender a moverte con tacones y que se vea bien:** heels.
- **Quieres soltarte y ganar seguridad con tu cuerpo:** sexy style.
- **Ya bailas salsa o bachata y quieres que tu parte luzca:** lady style.
- **No lo tienes claro:** heels y sexy style son el mismo día, seguidos. Se prueban los dos en una tarde y se decide después.

## No hace falta saber andar con tacones

Es la objeción que más llega, y la respuesta es que **la primera clase se puede hacer con zapatilla plana**. Lo que se entrena al principio es el peso, el eje y las líneas, y eso se aprende igual sin tacón.

Cuando pases al tacón, empieza bajo y con sujeción en el tobillo. Una tira o un cordón cambian por completo la sensación en un giro. El detalle está en [qué zapatos llevar a clase](/blog/zapatos-para-bailar-salsa-y-bachata).

## Tampoco hace falta un cuerpo concreto

Ni una condición física de partida, ni experiencia en danza, ni un tipo de cuerpo. Lo que sí se trabaja desde el primer día es la movilidad de tobillo y la fuerza de tren inferior, porque es de donde sale el control.

Si vienes de años sin moverte, dilo al llegar y se adapta el ritmo. Si tienes una lesión de rodilla o tobillo, dilo también: no impide bailar, pero cambia qué se te propone.

## Y si al final no quieres tacón

Ninguna de las tres lo obliga. Hay gente que lleva temporadas en heels bailando con zapatilla, y nadie le ha dicho nada. El tacón es una herramienta, no el requisito de entrada.

## Qué cuesta

Un estilo son 35 € al mes y cada estilo adicional suma 20 €, así que heels y sexy style juntos salen por 55 €. El desglose completo está en [precios](/precios-clases-de-baile-vilanova).

Y si además de esto nunca has bailado nada, el punto de partida está en [aprender a bailar desde cero](/aprender-a-bailar-desde-cero).`,
  faq: [
    {
      q: "¿Hace falta saber andar con tacones para empezar?",
      a: "No. La primera clase se puede hacer con zapatilla plana: lo que se entrena al principio es el peso, el eje y las líneas, y eso se aprende igual sin tacón.",
    },
    {
      q: "¿Qué diferencia hay entre heels y sexy style?",
      a: "Heels es danza urbana sobre tacones, con coreografía y trabajo de líneas. Sexy style trabaja control, respiración, suelo y presencia, y no persigue el resultado escénico.",
    },
    {
      q: "¿El lady style también se baila con tacones?",
      a: "Puede, pero es opcional. El lady style es el trabajo en solitario del lenguaje corporal de la salsa y de la bachata, pensado para que luzca cuando bailas en pareja.",
    },
    {
      q: "¿Puedo probar heels y sexy style el mismo día?",
      a: "Sí. Las dos clases son el mismo día y en franjas seguidas, así que se pueden encadenar en una sola tarde y decidir después.",
    },
    {
      q: "¿Estas clases son solo para mujeres?",
      a: "No. Son clases en solitario y abiertas a quien quiera hacerlas. Lo que define el grupo es la disciplina, no quién la baila.",
    },
  ],
  enlaces: [
    {
      href: "/clases/heels",
      label: "Clases de heels en Vilanova i la Geltrú",
      texto: "La ficha completa: qué es el heels, qué se aprende y cómo es la clase.",
    },
    {
      href: "/clases/sexy-style",
      label: "Clases de sexy style",
      texto: "Control, respiración y actitud trabajados con técnica.",
    },
    {
      href: "/clases/lady-style-bachata",
      label: "Clases de bachata lady",
      texto: "El lenguaje corporal de la bachata, entrenado en solitario.",
    },
    {
      href: "/clases-de-baile-sin-pareja",
      label: "Clases de baile sin pareja",
      texto: "Las tres se bailan en solitario. El resto del cartel, también se puede.",
    },
  ],
};
