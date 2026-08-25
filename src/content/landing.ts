/**
 * Copy final de la landing — julio 2026.
 *
 * Fuente única del texto de la home. Las modalidades reales salen de Supabase;
 * aquí queda un fallback para desarrollo sin BD y para los slugs/orden.
 *
 * DATOS PENDIENTES DE POL (buscar "TODO" en este archivo):
 *   · Condiciones de la clase de prueba (¿gratis o no? Pol retiró "gratis" el 19-06).
 *   · (Resuelto 26-07) Founding: 85 €/mes, 10 plazas. Tarifa plana sin promo: 100 €/mes. Estilos sueltos desde 35 €/mes.
 *   · Horarios reales (FAQ de horarios).
 *   · Dirección exacta (FAQ "¿Dónde estáis?").
 *   · Reseñas reales de Google (array `reviews` — NUNCA inventarlas, Directiva Omnibus).
 */

/** Hero — primer impacto + CTA principal a WhatsApp. */
export const hero = {
  // El kicker va DENTRO del <h1> (ver components/landing/Hero.tsx): es la única
  // forma de que el encabezado principal de la home diga qué es esto y dónde
  // está sin renunciar al claim de marca, que por sí solo no contiene ninguna
  // palabra por la que nadie busque.
  kicker: "Escuela de baile en Vilanova i la Geltrú",
  title: "No vienes a una clase. Entras a una comunidad.",
  subtitle:
    "Empieces donde empieces —de cero absoluto o ya con tablas— aquí encuentras tu grupo, tu ritmo y tu gente.",
  cta: "Escríbenos por WhatsApp",
  // Pol retiró "gratis" en su edición del 19-06 (commit 76c491b). TODO: confirmar condiciones de la prueba.
  ctaNote: "Reserva tu primera clase de prueba y conoce el ambiente.",
};

export const levels = [
  { n: "00", label: "Nunca he bailado" },
  { n: "01", label: "Estoy empezando" },
  { n: "02", label: "Intermedio" },
  { n: "03", label: "Avanzado" },
];

export const experience = [
  {
    title: "Progresas sin agobio",
    text: "Grupos por nivel real. Avanzas cuando estás listo, no cuando toca.",
    accent: "bg-neon",
  },
  {
    title: "Una comunidad de verdad",
    text: "Llegas solo y sales con planes. El finde empieza aquí, en la pista.",
    accent: "bg-neon-mint",
  },
  {
    title: "Sales sintiéndote capaz",
    text: "Cada clase te devuelve un poco de confianza. Y eso se nota también fuera de la pista.",
    accent: "bg-neon-lime",
  },
];

/**
 * Espejo estático del catálogo de `modalidades` (migración 0025). Se usa
 * cuando no hay Supabase configurado o la consulta falla, para que la web
 * compile y se vea igual. Si se añade una modalidad en la BD, esta lista
 * puede quedarse corta — es un plan B, no la fuente de verdad.
 */
export const modalidadesFallback = [
  {
    slug: "salsa-cubana",
    nombre: "Salsa cubana",
    descripcion: "El sabor del son y la rueda de casino. Energía, giros y mucha risa en grupo.",
  },
  {
    slug: "bachata",
    nombre: "Bachata",
    descripcion: "Musicalidad, conexión y sensibilidad. La que engancha desde el primer día.",
  },
  {
    slug: "reparto",
    nombre: "Reparto",
    descripcion: "El género urbano que arrasa en La Habana. Movimiento, actitud y mucha calle.",
  },
  {
    slug: "reggaeton",
    nombre: "Reggaeton",
    descripcion: "Perreo con técnica y estilo. Suena fuerte, se siente más fuerte.",
  },
  {
    slug: "lady-style-salsa",
    nombre: "Lady Style Salsa",
    descripcion:
      "Estilo femenino aplicado a la salsa cubana: brazos, cadera y presencia propia.",
  },
  {
    slug: "lady-style-bachata",
    nombre: "Lady Style Bachata",
    descripcion:
      "El lenguaje corporal de la bachata en solitario: ondas, giros y musicalidad.",
  },
  {
    slug: "sexy-style",
    nombre: "Sexy Style",
    descripcion: "Sensualidad trabajada con técnica: control, respiración y actitud.",
  },
  {
    slug: "heels",
    nombre: "Heels",
    descripcion: "Potencia, actitud y glamour. Con o sin tacones, la energía es la misma.",
  },
  {
    slug: "cia-salsa",
    nombre: "Cía Salsa",
    descripcion: "Grupo de compañía de salsa: coreografía, ensayo continuo y actuaciones.",
  },
  {
    slug: "cia-bachata-lady",
    nombre: "Cía Bachata Lady",
    descripcion: "Grupo de compañía de bachata lady: montaje coreográfico y shows.",
  },
];

export type Review = {
  name: string;
  date: string;
  initial: string;
  hue: string;
  text: string;
};

/**
 * Reseñas de alumnos.
 * TODO: añadir SOLO reseñas reales de Google (texto literal, con permiso del autor).
 * PROHIBIDO inventarlas o retocarlas: infringe la Directiva Omnibus (reseñas falsas).
 * Formato de cada entrada:
 *   { name: "Nombre A.", date: "hace X semanas", initial: "N", hue: "bg-neon|bg-neon-mint|bg-neon-lime", text: "…" }
 */
export const reviews: Review[] = [];

/**
 * Nota media real del perfil de Google Business.
 * TODO: poner la nota real (p. ej. "4,8") cuando exista el perfil con reseñas.
 * Mientras sea null, el badge de valoración no se muestra.
 */
export const googleRating: string | null = null;

export const steps = [
  {
    n: "01",
    title: "Escríbenos",
    text: "Un WhatsApp y listo. Sin formularios eternos, sin compromiso.",
  },
  {
    n: "02",
    title: "Te ubicamos",
    text: "Te proponemos el grupo, el día y el nivel que mejor te encajan para probar.",
  },
  {
    n: "03",
    title: "Vienes a probar",
    text: "Bailas, conoces al grupo y decides. Sin presión y sin letra pequeña.",
  },
];

export const faqs = [
  {
    q: "¿Dónde estáis?",
    // TODO: añadir calle y número exactos cuando Pol los confirme.
    a: "Dentro del gimnasio Aranha, en Vilanova i la Geltrú. Escríbenos por WhatsApp y te mandamos la ubicación exacta.",
  },
  {
    q: "¿Cuánto cuesta?",
    // TODO: condiciones de la clase de prueba (Pol retiró "gratis" el 19-06) y cuota estándar de referencia.
    a: "La tarifa fundadora de lanzamiento es de 85 €/mes (solo 10 plazas) e incluye acceso a todas las disciplinas, con la cuota bloqueada mientras sigas de alta. Después, la tarifa plana con todos los estilos es de 100 €/mes; también puedes venir por estilos sueltos desde 35 €/mes. Y antes de decidir, tienes una clase de prueba para conocer el ambiente.",
  },
  {
    q: "¿Qué horarios hay?",
    // TODO: publicar el cuadro real de horarios por grupo/nivel cuando esté cerrado.
    a: "Estamos cerrando el cuadro definitivo de la temporada. Escríbenos con tu disponibilidad y te decimos qué grupos encajan con tu agenda.",
  },
  {
    q: "¿Necesito venir con pareja?",
    a: "No hace falta. Rotamos en clase y conocerás a todo el grupo. La mayoría viene sola.",
  },
  {
    q: "¿Qué nivel necesito?",
    a: "El que tengas. Hay grupos desde cero absoluto hasta avanzado, y te ubicamos en el que mejor encaja contigo.",
  },
  {
    q: "¿Hay edad mínima o máxima?",
    a: "Somos una escuela para adultos: hay gente de los 18 a los 60 y pico. El único requisito es tener ganas.",
  },
  {
    q: "¿Qué llevo a la clase de prueba?",
    a: "Ropa cómoda y unas zapatillas limpias. El resto —música, grupo y buen rollo— lo ponemos nosotros.",
  },
];

/** CTA final — cierre de la landing. */
export const ctaFinal = {
  kicker: "Último paso",
  title: "¿Empezamos?",
  subtitle: "Tu primera clase de prueba está a un mensaje de distancia.",
  cta: "Escríbenos por WhatsApp",
  note: "Respondemos rápido. De verdad.",
};

/**
 * Founding Member — oferta de fundadores.
 *
 * REGLA DE HONESTIDAD (Directiva Omnibus / competencia desleal):
 * la cuenta atrás y las plazas SOLO se muestran si son reales. Mientras los
 * campos numéricos sean null, la UI no pinta contador ni barra de plazas, y la
 * urgencia se sostiene solo con hechos ciertos (aforo físico limitado, tarifa
 * ligada a la apertura).
 */
export const founding = {
  kicker: "Plazas fundadoras",
  title: "Baila todos los días",
  subtitle:
    "La plaza fundadora abre las 8 disciplinas regulares de la escuela —de tu nivel o inferior— de lunes a viernes, con la cuota bloqueada mientras sigas de alta. Es la tarifa de quien viene a bailar mucho.",
  badge: "Cuota bloqueada mientras sigas de alta",
  /** Cuota fundadora confirmada por Pol (26-07-2026): 85 €/mes, tarifa plana con todo incluido. */
  price: "85 €",
  /**
   * Cuota estándar de referencia (tachada junto al precio fundador): la tarifa
   * plana sin promoción de fundador (100 €/mes, todos los estilos).
   */
  priceOld: "100 €" as string | null,
  /**
   * Plazas fundadoras REALES: la promoción está limitada a 10 plazas (Pol, 26-07-2026).
   * `spotsLeft` debe reflejar las que quedan de verdad — actualízalo a mano (o desde BD)
   * conforme se ocupen; arranca en 10 (ninguna vendida todavía).
   */
  spotsLeft: 10 as number | null,
  spotsTotal: 10 as number | null,
  /**
   * Fecha límite REAL de la tarifa fundadora (fin del periodo de apertura).
   * TODO: fecha real de cierre. Mientras sea null no se muestra la cuenta atrás.
   */
  deadline: null as string | null,
  deadlineLabel: "La tarifa fundadora cierra en",
  /** Urgencia basada en hechos: la oferta va ligada a la apertura, sin cifras inventadas. */
  urgencyNote:
    "La tarifa fundadora solo existe mientras abrimos la escuela. Los grupos tienen aforo limitado: cuando se llenan, se cierran.",
  cta: "Quiero mi plaza fundadora",
  // TODO: confirmar condiciones reales (sin permanencia, mantenimiento de tarifa).
  finePrint: "Sin permanencia. Si te das de baja, la tarifa fundadora no se recupera.",
  /**
   * Columna "qué incluye" — condiciones confirmadas por Pol (01-08-2026):
   * 85 €/mes con acceso a TODAS las disciplinas regulares de tu nivel o
   * inferior (las compañías quedan fuera), cuota bloqueada y prioridad en
   * eventos. El detalle largo vive en `/socio-fundador`.
   */
  benefitsTitle: "¿Qué incluye la plaza fundadora?",
  benefitsIntro:
    "No compras un estilo: compras la semana entera. Es la tarifa de quien quiere venir tres, cuatro o cinco días. Si solo vas a venir una o dos veces, te sale mejor la mensualidad normal y te lo diremos nosotros.",
  benefits: [
    {
      title: "Las 8 disciplinas, de tu nivel o inferior",
      text: "Salsa, bachata, lady salsa, bachata lady, reparto, reggaetón, sexy style y heels: todas las clases regulares abiertas a tu nivel o por debajo, de lunes a viernes. Los grupos de compañía quedan fuera.",
    },
    {
      title: "Cuota bloqueada (con condiciones)",
      text: "Tu cuota mensual se mantiene congelada mientras sigas de alta.",
    },
    {
      title: "Acceso preferente a eventos",
      text: "Prioridad de reserva en fiestas sociales y masterclasses.",
    },
  ],
  conditionNote:
    "* La cuota fundadora se mantiene siempre que la suscripción no sufra periodos de baja.",
};
