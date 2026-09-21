import type { PaginaSeo } from "@/content/paginas-seo";
import { precios, precioEstilos } from "@/content/precios";

/*
  Las cifras NO se escriben en el texto: se interpolan desde
  `content/precios.ts`, que es la fuente única. Si Pol cambia la tarifa, esta
  página cambia con ella y no queda un precio viejo colgado en el SERP, que es
  publicidad engañosa además de un problema de confianza.

  Lo que NO se dice aquí: el precio de la clase de prueba. Sigue sin
  confirmar (TODO en content/landing.ts). Se dice que tiene coste y que se
  descuenta, que es lo que Pol confirmó el 16-09-2026, y nada más.
*/
export const preciosBaile: PaginaSeo = {
  slug: "precios-clases-de-baile-vilanova",
  keywordPrincipal: "precio de las clases de baile en Vilanova",
  keywordsSecundarias: [
    "cuánto cuestan las clases de baile",
    "tarifas academia de baile Vilanova",
    "cuota mensual clases de salsa",
    "clase de prueba de baile",
  ],
  noCanibaliza:
    "El precio sale como bloque dentro de la home y de /clases, pero ninguna URL responde a la consulta 'cuánto cuesta'. /socio-fundador es un producto con plazas limitadas, no la tarifa. Esta página es la tarifa y enlaza a las otras dos.",
  metaTitle: "Precios de las clases de baile en Vilanova",
  description:
    "Cuánto cuestan las clases de baile en Vilanova i la Geltrú: cuota por estilo, tarifa plana y cómo funciona la clase de prueba. Pregúntanos por WhatsApp.",
  eyebrow: "Tarifas",
  h1: "Precios de las clases de baile en Vilanova i la Geltrú",
  lead: "Cuota mensual, sin matrícula y sin permanencia. Pagas por estilos, y a partir del cuarto compensa la tarifa plana.",
  estilosHorario: [],
  imagen: {
    src: "/media/comunidad/sala-panoramica.jpg",
    alt: "Sala de baile de NEXUS VNG en el Gimnasio Aranha, junto a Vilanova i la Geltrú",
    ancho: 1200,
    alto: 900,
  },
  actualizado: "2026-09-21",
  cuerpo: `Un estilo son **${precios.base} € al mes**. Cada estilo adicional suma **${precios.estiloExtra} €**, y la tarifa plana de **${precios.flat} €** da acceso a todas las clases del cartel. Es cuota mensual: no hay matrícula ni permanencia.

## La tarifa, en una tabla

| Estilos a la semana | Cuota mensual |
|---|---|
| 1 estilo | ${precioEstilos(1)} € |
| 2 estilos | ${precioEstilos(2)} € |
| 3 estilos | ${precioEstilos(3)} € |
| 4 estilos o más | ${precios.flat} € (tarifa plana) |

Un "estilo" es una disciplina del cartel: salsa, bachata, reparto, reggaetón, heels, sexy style, lady style o un grupo de compañía. Si vienes a salsa y a bachata, son dos.

A partir del cuarto estilo la cuenta se detiene sola: ${precioEstilos(3)} € + ${precios.estiloExtra} € ya superaría la tarifa plana, así que se te aplica la plana y punto. Con ella puedes venir a todo lo que te quepa en la semana.

## La clase de prueba

Antes de apuntarte vienes a una clase. **Tiene un coste y se te descuenta** de la primera cuota si te quedas. No la vendemos como gratuita porque no lo es, y prometer lo contrario en el anuncio para cobrarla después sería publicidad engañosa.

Se agenda por WhatsApp: nos dices qué te apetece bailar y qué días puedes, y te decimos a qué grupo venir. El precio exacto te lo confirmamos en ese mismo mensaje.

## Qué entra en la cuota

- Las clases semanales de los estilos que hayas cogido, de una hora cada una.
- El grupo de nivel que te asigne el profe, y el cambio de grupo si subes.
- Los grupos de compañía cuentan como un estilo más, no aparte.

## Qué no entra

- Los **intensivos** y talleres puntuales, que se pagan por separado. Están en [intensivos](/intensivos).
- Los **eventos y fiestas**, cuando los haya, que van con su propia entrada.
- El calzado. No hace falta comprar zapatos de baile para empezar: lo explicamos en [qué zapatos llevar a clase](/blog/zapatos-para-bailar-salsa-y-bachata).

## La plaza de socio fundador

Hay una cuota reducida para las primeras plazas de la escuela, con un número limitado de sitios y condiciones propias. No es la tarifa general, así que vive en su página: [socio fundador](/socio-fundador). Si quedan plazas, se ven ahí en tiempo real.

## Tres combinaciones reales

Para ver cómo sale la cuenta, tres formas de organizarse que se repiten en la sala:

**Un solo baile, un día a la semana.** Bachata y nada más. ${precioEstilos(1)} € al mes. Es por donde empieza casi todo el mundo y es suficiente para llegar a bailar en una fiesta.

**En pareja y en solitario.** Salsa más lady style, o bachata más reparto. ${precioEstilos(2)} € al mes. El trabajo en solitario acelera lo que haces en pareja, porque el cuerpo aprende por separado lo que luego tiene que coordinar.

**Todo lo que quepa en la semana.** Tarifa plana, ${precios.flat} € al mes. Tiene sentido a partir de cuatro clases, y es lo que cogen los que van a grupos de compañía.

## Descuentos: lo que hay y lo que no

No hay descuento por pagar un trimestre por adelantado, ni matrícula que perdonar, ni precio de captación que sube a los tres meses. La cuota es la misma el primer mes y el décimo.

Lo único que existe aparte de la tarifa general es la plaza de socio fundador, que es limitada y tiene sus propias condiciones.

## Si un mes no puedes venir

Se habla. Una lesión, un viaje largo o un mes complicado de trabajo se gestionan mejor con una baja temporal ordenada que desapareciendo y volviendo en enero: así sabemos si guardamos el sitio en tu grupo.

## Cómo se paga

Cuota mensual por los medios que acordemos al inscribirte. El alta se hace por WhatsApp, sin formularios ni papeleo, y el primer pago no se hace hasta después de la clase de prueba.`,
  faq: [
    {
      q: "¿Cuánto cuestan las clases de baile al mes?",
      a: `Un estilo cuesta ${precios.base} € al mes. Cada estilo adicional suma ${precios.estiloExtra} €, y la tarifa plana de ${precios.flat} € da acceso a todas las clases del cartel.`,
    },
    {
      q: "¿La clase de prueba es gratis?",
      a: "No. Tiene un coste y se te descuenta de la primera cuota si te apuntas. El importe te lo confirmamos por WhatsApp al agendarla.",
    },
    {
      q: "¿Hay matrícula o permanencia?",
      a: "No hay matrícula y la cuota es mensual, así que no hay permanencia ni curso completo que pagar por adelantado.",
    },
    {
      q: "¿Qué cuenta como un estilo?",
      a: "Cada disciplina del cartel: salsa, bachata, reparto, reggaetón, heels, sexy style, lady style o un grupo de compañía. Los grupos de compañía tarifan como una clase más.",
    },
    {
      q: "¿Los intensivos están incluidos en la cuota?",
      a: "No. Los intensivos y talleres puntuales se pagan aparte y tienen su propio precio en la página de intensivos.",
    },
  ],
  waMensaje: "¡Hola! Me gustaría saber los precios y cómo va la clase de prueba 🙂",
  enlaces: [
    {
      href: "/socio-fundador",
      label: "Plaza de socio fundador",
      texto: "La cuota reducida de las primeras plazas, con sus condiciones y las que quedan.",
    },
    {
      href: "/clases",
      label: "Todas las clases de baile",
      texto: "Las disciplinas que cuentan como estilo dentro de la cuota.",
    },
    {
      href: "/horarios",
      label: "Horarios de clases de baile",
      texto: "Cuántas clases te caben en la semana antes de decidir la tarifa.",
    },
    {
      href: "/intensivos",
      label: "Intensivos y talleres",
      texto: "Lo que se paga aparte de la cuota mensual.",
    },
  ],
};
