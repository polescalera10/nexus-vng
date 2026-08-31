/**
 * SOCIO FUNDADOR — copy de la landing de venta dedicada (`/socio-fundador`).
 *
 * POSICIONAMIENTO (Pol, 01-08-2026). El punto diferencial NO es el descuento:
 * es que puedes hacer **todas las disciplinas que quieras, siempre que sean de
 * tu nivel o inferior**. Es la tarifa de quien quiere bailar mucho — venir
 * todos los días de la semana y tocar hasta las 8 disciplinas regulares. Quien
 * solo vaya a una o dos clases a la semana NO debe cogerla: le sale mejor la
 * mensualidad de 35 € (1 clase) o 55 € (2 clases). Decirlo así, en la propia
 * landing, cualifica y evita bajas al segundo mes.
 *
 * NO entran los grupos de COMPAÑÍA (Cía Salsa, Cía Lady Bachata): no se
 * consideran clases regulares.
 *
 * Precios y aforo NO se escriben a mano aquí: se leen de `precios.ts` y de
 * `founding` en `landing.ts` para que no existan dos verdades. La lista de
 * disciplinas se deriva del horario (`horario-regular.ts`).
 *
 * Regla legal (CLAUDE.md): urgencia basada en hechos. Nada de contadores
 * inventados, ni testimonios, ni cifras de alumnos que no existan.
 */

import { founding } from "@/content/landing";
import { precios, precioEstilos } from "@/content/precios";
import { disciplinasRegulares, gruposCompania } from "@/content/horario-regular";

/**
 * Aforo de la promoción. `founding.spotsTotal` es `number | null` (null = dato
 * sin confirmar); aquí se normaliza para poder interpolarlo en el copy sin que
 * salga un "null" impreso en pantalla.
 *
 * Solo el TOTAL es estático: las plazas que quedan salen de `leads` en cada
 * render (`getFoundingSpots()`), así que el copy que dependa de ellas se compone
 * con `kickerPlazas()` en lugar de fijarse aquí.
 */
const SPOTS_TOTAL = founding.spotsTotal ?? 10;
export const plazas = { total: SPOTS_TOTAL } as const;

/**
 * Kicker del formulario. Con dato vivo dice cuántas quedan; sin él (Supabase
 * caído) cae a un titular sin cifras en vez de inventarse una.
 */
export function kickerPlazas(left: number | null): string {
  return left === null ? "Plaza de socio fundador" : `Quedan ${left} de ${SPOTS_TOTAL} plazas`;
}

/** Cuota fundadora en número, para poder hacer cuentas con ella. */
const CUOTA = Number(founding.price.replace(/\D/g, ""));

/** Las 8 disciplinas regulares que cubre la plaza (derivadas del horario). */
export const disciplinas = disciplinasRegulares;
export const companias = gruposCompania;

/** Precio por clase suelta según cuántas veces vengas a la semana. */
function porClase(clasesSemana: number) {
  return CUOTA / (clasesSemana * 4);
}

/** Redondeo a un decimal con coma, formato español. */
function eur(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export const numeros = {
  cuota: CUOTA,
  /** Mensualidad de 1 y de 2 clases a la semana (el punto de comparación real). */
  una: precios.base,
  dos: precioEstilos(2),
  flat: precios.flat,
  disciplinas: disciplinas.length,
  /** Céntimos por clase si vienes 4 veces por semana. */
  porClase4: eur(porClase(4)),
  porClase2Mensualidad: eur(precioEstilos(2) / (2 * 4)),
} as const;

export const socioFundador = {
  hero: {
    kicker: `Solo ${plazas.total} plazas · Vilanova i la Geltrú`,
    title: "Baila todos los días",
    titleAccent: `por ${founding.price} al mes`,
    subtitle: `La plaza de socio fundador te abre las ${numeros.disciplinas} disciplinas regulares de la escuela —de tu nivel o inferior— de lunes a viernes. Sin elegir una. Sin contar clases.`,
    cta: `Quiero una de las ${plazas.total} plazas`,
    ctaNote: "Sin permanencia. Respondemos el mismo día.",
  },

  /** La promesa: qué es y, sobre todo, para quién es. */
  promesa: {
    title: "Una cuota, toda la semana",
    body: `Aquí no compras "un estilo". Compras la semana entera: salsa el miércoles, bachata el jueves, heels el martes y reggaetón otra vez el miércoles si te apetece. Todas las clases de tu nivel o inferior, con la misma cuota.`,
    body2: `Por eso la plaza fundadora no es para todo el mundo. Si vas a venir una o dos veces por semana, la mensualidad normal (${numeros.una} € o ${numeros.dos} €) te sale mejor y te lo decimos nosotros. Esto es para quien quiere bailar mucho: a partir de cuatro clases semanales, la plaza fundadora sale a ${numeros.porClase4} € por clase.`,
  },

  /** Las 8 disciplinas incluidas, con lo que queda fuera dicho sin letra pequeña. */
  incluye: {
    title: `Las ${numeros.disciplinas} disciplinas que entran`,
    intro:
      "De lunes a viernes, de 18:30 a 21:30. Puedes venir a todas las que estén abiertas a tu nivel o por debajo — y sí, se puede repetir estilo en distintos días.",
    fuera: `Los grupos de compañía (${companias.join(" y ")}) no son clases regulares y quedan fuera de la plaza fundadora.`,
    nivelNota:
      "«De tu nivel o inferior» significa que si estás en Salsa 2 puedes bajar a Salsa 1 o Salsa 0 cuando quieras repasar, pero no saltar a un grupo por encima hasta que el profe te vea listo.",
  },

  /** Cuándo sale a cuenta y cuándo no. Cualifica en vez de vender a todo el mundo. */
  cuandoSale: {
    title: "¿Te sale a cuenta?",
    intro: "Las cuentas, claras, para que no te lleves una sorpresa al segundo mes.",
    filas: [
      {
        perfil: "Vengo 1 vez por semana",
        recomendado: `Mensualidad ${numeros.una} €`,
        nota: "Una disciplina, tu grupo, tu día. La plaza fundadora no te compensa.",
        destacado: false,
      },
      {
        perfil: "Vengo 2 veces por semana",
        recomendado: `Mensualidad ${numeros.dos} €`,
        nota: `Sale a ${numeros.porClase2Mensualidad} € por clase. Sigue siendo mejor que la plaza fundadora.`,
        destacado: false,
      },
      {
        perfil: "Vengo 3 veces o más",
        recomendado: `Socio fundador ${founding.price}`,
        nota: `A partir de aquí ya ganas — y con 4 clases semanales bajas a ${numeros.porClase4} € por clase.`,
        destacado: true,
      },
      {
        perfil: "Quiero probarlo todo",
        recomendado: `Socio fundador ${founding.price}`,
        nota: `Las ${numeros.disciplinas} disciplinas, los 5 días, sin contar clases ni pedir permiso.`,
        destacado: true,
      },
    ],
  },

  /** Beneficios: por qué fundador y no simplemente tarifa plana. */
  beneficios: {
    title: "Lo que se llevan solo los primeros",
    intro: `La tarifa plana existirá siempre; la fundadora no. Estas ${plazas.total} plazas son las únicas que se quedan con estas condiciones.`,
    items: [
      {
        n: "01",
        title: `Las ${numeros.disciplinas} disciplinas, sin elegir`,
        text: `${disciplinas.join(", ")}. Todas las que estén abiertas a tu nivel o por debajo, los cinco días de la semana.`,
        accent: "text-neon",
      },
      {
        n: "02",
        title: "Cuota bloqueada, no descuento temporal",
        text: `No caduca a los tres meses. Mientras la suscripción siga activa sigues pagando ${founding.price}, aunque la tarifa general suba.`,
        accent: "text-neon-mint",
      },
      {
        n: "03",
        title: `${numeros.flat - CUOTA} € menos al mes que la tarifa plana`,
        text: `La misma tarifa plana costará ${numeros.flat} €/mes cuando se acaben las plazas: ${(numeros.flat - CUOTA) * 12} € más al año, cada año que sigas bailando.`,
        accent: "text-neon-lime",
      },
      {
        n: "04",
        title: "Cambia de estilo cuando quieras",
        text: "¿Empezaste con salsa y te engancha la bachata? Te pasas y ya está: no hay cambio de tarifa, ni papeleo, ni esperar a fin de mes.",
        accent: "text-neon",
      },
      {
        n: "05",
        title: "Prioridad en eventos y masterclasses",
        text: "Fiestas sociales, workshops y masterclasses con profesor invitado: los fundadores reservan antes que nadie.",
        accent: "text-neon-mint",
      },
      {
        n: "06",
        title: "Voz en cómo crece la escuela",
        text: "Horarios, estilos nuevos, tipo de eventos: a los fundadores se os pregunta primero. NEXUS se construye con quien estuvo desde el día uno.",
        accent: "text-neon-lime",
      },
    ],
  },

  /** Cualificación explícita. */
  paraQuien: {
    title: "¿Es para ti?",
    si: {
      title: "Sí, si…",
      items: [
        "Quieres venir tres, cuatro o cinco días a la semana y que la cuota te dé igual.",
        "Te apetece tocarlo todo: salsa un día, bachata otro, y meter heels o reggaetón por el camino.",
        "Empiezas de cero y quieres repetir el mismo nivel varias veces por semana para coger base rápido.",
        "Vienes solo o sola y buscas gente: cuantos más días vengas, antes eres de la casa.",
      ],
    },
    no: {
      title: "No, si…",
      items: [
        `Solo vas a venir una o dos veces por semana: la mensualidad de ${numeros.una} € o ${numeros.dos} € te sale más barata y te la recomendamos nosotros.`,
        "Buscas únicamente el grupo de compañía: no entra en la plaza fundadora.",
        "No puedes venir de forma regular entre semana de 18:30 a 21:30.",
      ],
    },
  },

  pasos: {
    title: "Cómo se coge la plaza",
    items: [
      {
        n: "1",
        title: "Rellenas el formulario",
        text: "Un minuto: tus datos y por dónde andas de nivel. Nada más — la plaza lo incluye todo.",
      },
      {
        n: "2",
        title: "Te escribimos por WhatsApp",
        text: "Confirmamos que queda plaza, te ubicamos el nivel y montamos contigo tu semana. Sin compromiso.",
      },
      {
        n: "3",
        title: "Vienes a tu primera clase",
        text: "Ropa cómoda y ganas. La cuota fundadora queda fijada a tu nombre desde el alta.",
      },
    ],
  },

  faqs: [
    {
      q: "¿De verdad puedo ir a todas las clases que quiera?",
      a: `Sí, siempre que sean de tu nivel o inferior. Puedes venir los cinco días y combinar las ${numeros.disciplinas} disciplinas regulares: ${disciplinas.join(", ")}. Lo único que queda fuera son los grupos de compañía (${companias.join(" y ")}), que no se consideran clases regulares.`,
    },
    {
      q: "¿Qué significa «de tu nivel o inferior»?",
      a: "Que puedes bajar, pero no saltar. Si estás en Bachata 2 puedes meterte en Bachata 1 o Bachata 0 para repasar o para bailar un día más, pero no entrar en un grupo por encima del tuyo hasta que el profe te vea listo. Los grupos por nivel existen para que la clase avance, no para poner barreras.",
    },
    {
      q: "Solo puedo venir dos días. ¿Me la cojo igual?",
      a: `No te la recomendamos. Con dos clases a la semana la mensualidad de ${numeros.dos} € te sale mejor (${numeros.porClase2Mensualidad} € por clase). La plaza fundadora empieza a compensar a partir de la tercera clase semanal. Preferimos decírtelo antes que cobrarte de más.`,
    },
    {
      q: `¿Qué pasa cuando se agoten las ${plazas.total} plazas?`,
      a: `La tarifa fundadora desaparece y el alta pasa a la tarifa vigente: ${numeros.una} €/mes por una disciplina, +${precios.estiloExtra} €/mes por cada disciplina extra, o ${numeros.flat} €/mes de tarifa plana. Quien ya sea fundador mantiene sus ${founding.price}.`,
    },
    {
      q: "¿Hay permanencia?",
      a: "No. Puedes darte de baja cuando quieras, sin penalización. Lo único es que la tarifa fundadora va ligada a que la suscripción no se interrumpa: si te das de baja y vuelves más adelante, entras con la tarifa vigente en ese momento.",
    },
    {
      q: "Nunca he bailado. ¿Voy a hacer el ridículo?",
      a: "Los grupos 0 son literalmente para gente que no ha bailado nunca. Se empieza por el paso básico y por cómo escuchar la música. Y con la plaza fundadora puedes repetir el mismo nivel en varios días de la semana, que es la forma más rápida de coger base.",
    },
    {
      q: "¿Necesito pareja?",
      a: "No. En clase se rota de pareja, así que se viene solo o acompañado indistintamente. Es, de hecho, la forma más rápida de conocer a todo el grupo.",
    },
    {
      q: "¿Cómo se paga?",
      a: "Cuota mensual. Te explicamos la forma de pago por WhatsApp cuando confirmemos tu plaza — sin matrícula ni cuota de inscripción.",
    },
  ],

  form: {
    title: "Reserva tu plaza fundadora",
    subtitle:
      "No hace falta que elijas clases: la plaza las incluye todas. Solo dinos quién eres y por dónde andas, y te escribimos por WhatsApp el mismo día para montar tu semana.",
    submitLabel: "Quiero mi plaza fundadora",
    /** Interés implícito que se guarda en el CRM aunque no se pregunte nada. */
    interesFijo: `Plaza fundadora · las ${numeros.disciplinas} disciplinas`,
    nivel: {
      legend: "¿Por dónde andas?",
      help: "Solo para saber en qué grupo ubicarte. Si te equivocas no pasa nada, lo ajustamos en la primera clase.",
      options: [
        {
          value: "Nivel: nunca he bailado",
          label: "Nunca he bailado",
          hint: "Empiezas en los grupos 0",
        },
        {
          value: "Nivel: algo he bailado",
          label: "Algo he bailado",
          hint: "Sueltas en fiestas, sin clases",
        },
        {
          value: "Nivel: ya bailo",
          label: "Ya bailo",
          hint: "Vengo de otra escuela o llevo tiempo",
        },
      ],
    },
    fallback: "¿Prefieres preguntar antes de dejar tus datos?",
  },
} as const;
