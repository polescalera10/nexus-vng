import { pares } from "@/i18n/textos";

/*
  Textos de las piezas compartidas de la web pública: cabecera, pie, banner de
  cookies, formularios, horario, precios, reseñas y mapa.

  Las marcas `**así**` se pintan en negrita (components/ui/Negritas.tsx).
  Catalán central, registro cercano (tu). Los nombres de disciplina no se
  traducen: son como se buscan.
*/

export const tMenu = pares(
  {
    abrir: "Abrir menú",
    cerrar: "Cerrar menú",
    principal: "Menú principal",
    cta: "Reserva tu clase de prueba",
  },
  {
    abrir: "Obre el menú",
    cerrar: "Tanca el menú",
    principal: "Menú principal",
    cta: "Reserva la teva classe de prova",
  },
);

export const tIdioma = pares(
  {
    etiqueta: "Idioma",
    es: "Castellano",
    ca: "Català",
    /** Marca de los enlaces que llevan a una página que solo existe en castellano. */
    soloEs: "",
  },
  {
    etiqueta: "Idioma",
    es: "Castellano",
    ca: "Català",
    soloEs: "(en castellà)",
  },
);

export const tPie = pares(
  {
    lema: (localidad: string) =>
      `Escuela de salsa cubana y bachata. Dentro del gimnasio Aranha · ${localidad}.`,
    donde: "Dónde",
    explora: "Explora",
    siguenos: "Síguenos",
    hecho: "Hecho con ritmo",
    clases: "Clases",
    precios: "Precios",
    empezar: "Empezar desde cero",
    eventos: "Eventos",
    blog: "Blog",
    sobreNosotros: "Sobre nosotros",
    contacto: "Contacto",
    horarios: "Horarios",
    socioFundador: "Socio fundador",
    profesores: "Profesores",
    faq: "Preguntas frecuentes",
    avisoLegal: "Aviso legal",
    privacidad: "Privacidad",
    cookies: "Cookies",
    legalesEnEs: "",
  },
  {
    lema: (localidad: string) =>
      `Escola de salsa cubana i bachata. Dins del gimnàs Aranha · ${localidad}.`,
    donde: "On som",
    explora: "Explora",
    siguenos: "Segueix-nos",
    hecho: "Fet amb ritme",
    clases: "Classes",
    precios: "Preus",
    empezar: "Començar de zero",
    eventos: "Esdeveniments",
    blog: "Blog",
    sobreNosotros: "Qui som",
    contacto: "Contacte",
    horarios: "Horaris",
    socioFundador: "Soci fundador",
    profesores: "Professors",
    faq: "Preguntes freqüents",
    avisoLegal: "Avís legal",
    privacidad: "Privacitat",
    cookies: "Galetes",
    legalesEnEs: "Textos legals en castellà",
  },
);

export const tCookies = pares(
  {
    dialogo: "Consentimiento de cookies",
    texto:
      "Usamos cookies de análisis (Google Analytics) para entender qué partes de la web funcionan y mejorarlas. Solo se activan si las aceptas.",
    masInfo: "Más información",
    masInfoAria: "Más información sobre la política de cookies",
    rechazar: "Rechazar",
    aceptar: "Aceptar",
  },
  {
    dialogo: "Consentiment de galetes",
    texto:
      "Fem servir galetes d'anàlisi (Google Analytics) per entendre quines parts del web funcionen i millorar-les. Només s'activen si les acceptes.",
    masInfo: "Més informació",
    masInfoAria: "Més informació sobre la política de galetes (en castellà)",
    rechazar: "Rebutja",
    aceptar: "Accepta",
  },
);

export const tMigas = pares(
  { aria: "Migas de pan", inicio: "Inicio", clases: "Clases", horarios: "Horarios", contacto: "Contacto" },
  { aria: "Camí de navegació", inicio: "Inici", clases: "Classes", horarios: "Horaris", contacto: "Contacte" },
);

/** Días del cartel. Las claves son los nombres en castellano de `diasSemana`. */
export const tDias = pares<Record<string, string>>(
  { Lunes: "Lunes", Martes: "Martes", Miércoles: "Miércoles", Jueves: "Jueves", Viernes: "Viernes" },
  { Lunes: "Dilluns", Martes: "Dimarts", Miércoles: "Dimecres", Jueves: "Dijous", Viernes: "Divendres" },
);

/** Niveles del cartel (`nivelDe` en horario-regular.ts). */
export const tNiveles = pares<Record<string, string>>(
  { "Desde cero": "Desde cero", Iniciación: "Iniciación", Intermedio: "Intermedio" },
  { "Desde cero": "Des de zero", Iniciación: "Iniciació", Intermedio: "Intermedi" },
);

/** Nombre visible de un estilo del cartel: en catalán, «Cía» se escribe «Cia». */
export const tEstilo = pares(
  { estilo: (e: string) => e },
  { estilo: (e: string) => e.replace(/^Cía\b/, "Cia") },
);

export const tHorario = pares(
  {
    desliza: "Desliza la tabla para ver toda la semana →",
    region: "Horario semanal de clases",
    caption:
      "Horario del curso regular de NEXUS VNG en Vilanova i la Geltrú, temporada 26·27, de lunes a viernes.",
    hora: "Hora",
    leyenda:
      "El número indica el nivel: **0** desde cero absoluto, **1** iniciación, **2** intermedio. Los grupos **Cía** son de compañía: montaje coreográfico y actuaciones, con la misma tarifa que el resto. ¿No ves tu hueco? Escríbenos y lo encontramos.",
  },
  {
    desliza: "Fes lliscar la taula per veure tota la setmana →",
    region: "Horari setmanal de classes",
    caption:
      "Horari del curs regular de NEXUS VNG a Vilanova i la Geltrú, temporada 26·27, de dilluns a divendres.",
    hora: "Hora",
    leyenda:
      "El número indica el nivell: **0** des de zero absolut, **1** iniciació, **2** intermedi. Els grups **Cia** són de companyia: muntatge coreogràfic i actuacions, amb la mateixa tarifa que la resta. No hi veus el teu forat? Escriu-nos i el trobem.",
  },
);

export const tPrecios = pares(
  {
    titulo: "Precios claros, sin letra pequeña",
    intro:
      "Eliges cuántos estilos quieres bailar cada semana. Cuantos más combines, mejor te sale — y con la tarifa plana no hay límite.",
    masPopular: "Más popular",
    periodo: "mes",
    modelo: (base: number, extra: number, flat: number) =>
      `Modelo: ${base} € por el primer estilo, +${extra} € por cada estilo adicional, y ${flat} € de tarifa plana con todos los estilos incluidos.`,
    /** Mismo orden que `preciosTiers`. */
    tiers: [
      { estilos: "1 estilo", nota: "Elige tu disciplina y ven cada semana a tu grupo por nivel." },
      {
        estilos: "Cada estilo extra",
        nota: "Suma los estilos que quieras. Combina, por ejemplo, salsa y bachata.",
      },
      {
        estilos: "Tarifa plana",
        nota: "Todos los estilos, sin límite. La mejor opción a partir de 4 estilos.",
      },
    ],
  },
  {
    titulo: "Preus clars, sense lletra petita",
    intro:
      "Tries quants estils vols ballar cada setmana. Com més en combinis, més bé et surt, i amb la tarifa plana no hi ha límit.",
    masPopular: "La més triada",
    periodo: "mes",
    modelo: (base: number, extra: number, flat: number) =>
      `Model: ${base} € pel primer estil, +${extra} € per cada estil addicional, i ${flat} € de tarifa plana amb tots els estils inclosos.`,
    tiers: [
      { estilos: "1 estil", nota: "Tria la teva disciplina i vine cada setmana al teu grup per nivell." },
      {
        estilos: "Cada estil extra",
        nota: "Suma-hi els estils que vulguis. Combina, per exemple, salsa i bachata.",
      },
      {
        estilos: "Tarifa plana",
        nota: "Tots els estils, sense límit. La millor opció a partir de 4 estils.",
      },
    ],
  },
);

export const tResenas = pares(
  {
    titulo: "Lo que dicen en Google",
    enGoogle: "en Google",
    total: (n: number) => `${n} reseñas`,
    estrellas: (n: number) => `${n} de 5 estrellas`,
    notaMedia: (nota: string) => `Nota media ${nota} de 5`,
    pausar: "Pausar el paso automático de reseñas",
    reanudar: "Reanudar el paso automático de reseñas",
    anterior: "Reseña anterior",
    siguiente: "Reseña siguiente",
    lista: "Reseñas",
    carrusel: "carrusel",
    diapositiva: "diapositiva",
    posicion: (i: number, n: number) => `${i} de ${n}`,
    leerMas: "Leer más",
    leerMenos: "Leer menos",
    aviso: (max: number) =>
      `Reseñas publicadas por alumnos en nuestra ficha de Google, con el texto tal como lo escribieron. Mostramos hasta ${max} de las más recientes que llevan comentario, sin filtrar por puntuación.`,
  },
  {
    titulo: "El que diuen a Google",
    enGoogle: "a Google",
    total: (n: number) => `${n} ressenyes`,
    estrellas: (n: number) => `${n} de 5 estrelles`,
    notaMedia: (nota: string) => `Nota mitjana ${nota} de 5`,
    pausar: "Atura el pas automàtic de ressenyes",
    reanudar: "Reprèn el pas automàtic de ressenyes",
    anterior: "Ressenya anterior",
    siguiente: "Ressenya següent",
    lista: "Ressenyes",
    carrusel: "carrusel",
    diapositiva: "diapositiva",
    posicion: (i: number, n: number) => `${i} de ${n}`,
    leerMas: "Llegeix-ne més",
    leerMenos: "Llegeix-ne menys",
    aviso: (max: number) =>
      `Ressenyes publicades per alumnes a la nostra fitxa de Google, amb el text tal com el van escriure, en l'idioma original. En mostrem fins a ${max} de les més recents que porten comentari, sense filtrar per puntuació.`,
  },
);

export const tMapa = pares(
  {
    aria: (nombre: string, direccion: string) =>
      `Mapa con la ubicación de ${nombre}: ${direccion}. Flechas para moverlo, más y menos para el zoom.`,
    acercar: "Acercar",
    alejar: "Alejar",
    volver: "Volver a la sala",
    comoLlegar: "Cómo llegar en Google Maps",
    ver: "Ver el mapa",
    cargaDesde: "Se carga desde Google Maps al pulsar",
    iframe: (nombre: string, local: string) => `Mapa de ${nombre} en ${local}`,
  },
  {
    aria: (nombre: string, direccion: string) =>
      `Mapa amb la ubicació de ${nombre}: ${direccion}. Fletxes per moure'l, més i menys per al zoom.`,
    acercar: "Apropa",
    alejar: "Allunya",
    volver: "Torna a la sala",
    comoLlegar: "Com arribar-hi amb Google Maps",
    ver: "Mostra el mapa",
    cargaDesde: "Es carrega des de Google Maps en prémer",
    iframe: (nombre: string, local: string) => `Mapa de ${nombre} al ${local}`,
  },
);

export const tFormulario = pares(
  {
    nombre: "Nombre",
    tuNombre: "Tu nombre",
    nombreCompleto: "Nombre completo",
    nombreApellidos: "Nombre y apellidos",
    telefono: "Teléfono",
    email: "Email",
    opcional: "(opcional)",
    modalidad: "Modalidad de interés",
    modalidadPlaceholder: "Salsa, bachata…",
    mensaje: "Mensaje",
    mensajePlaceholder: "Cuéntanos qué buscas",
    enviando: "Enviando…",
    unMomento: "Un momento…",
    enviar: "Enviar",
    enviado: "¡Mensaje enviado!",
    recibida: "¡Solicitud recibida!",
    reservarPlaza: "Reservar mi plaza",
    interesesLabel: "¿Qué te interesa? Marca todo lo que quieras",
    consentimiento: {
      antes: "He leído y acepto la",
      enlace: "política de privacidad",
      despues: "y el tratamiento de mis datos para gestionar mi solicitud y recibir información de NEXUS VNG.",
    },
    captchaError:
      "No hemos podido cargar la verificación anti-spam (a veces la bloquea un bloqueador de anuncios). Desactívalo para esta web o escríbenos por WhatsApp.",
  },
  {
    nombre: "Nom",
    tuNombre: "El teu nom",
    nombreCompleto: "Nom complet",
    nombreApellidos: "Nom i cognoms",
    telefono: "Telèfon",
    email: "Correu electrònic",
    opcional: "(opcional)",
    modalidad: "Modalitat que t'interessa",
    modalidadPlaceholder: "Salsa, bachata…",
    mensaje: "Missatge",
    mensajePlaceholder: "Explica'ns què busques",
    enviando: "Enviant…",
    unMomento: "Un moment…",
    enviar: "Envia",
    enviado: "Missatge enviat!",
    recibida: "Sol·licitud rebuda!",
    reservarPlaza: "Reserva la meva plaça",
    interesesLabel: "Què t'interessa? Marca tot el que vulguis",
    consentimiento: {
      antes: "He llegit i accepto la",
      enlace: "política de privacitat (en castellà)",
      despues: "i el tractament de les meves dades per gestionar la meva sol·licitud i rebre informació de NEXUS VNG.",
    },
    captchaError:
      "No hem pogut carregar la verificació antispam (de vegades la bloqueja un bloquejador d'anuncis). Desactiva'l per a aquest web o escriu-nos per WhatsApp.",
  },
);

/** Respuestas de las Server Actions de los formularios públicos. */
export const tServidor = pares(
  {
    revisa: "Revisa los campos marcados.",
    gracias: "¡Gracias! Te escribimos enseguida.",
    graciasWhatsapp: "¡Gracias! Te escribimos por WhatsApp enseguida.",
    graciasSolicitud: "¡Gracias! Hemos recibido tu solicitud y te escribimos enseguida.",
    errorMensaje: "No hemos podido guardar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.",
    errorSolicitud:
      "No hemos podido guardar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.",
    captcha:
      "No hemos podido comprobar que no eres un robot. Vuelve a pulsar el botón en unos segundos o escríbenos por WhatsApp.",
  },
  {
    revisa: "Revisa els camps marcats.",
    gracias: "Gràcies! T'escrivim de seguida.",
    graciasWhatsapp: "Gràcies! T'escrivim per WhatsApp de seguida.",
    graciasSolicitud: "Gràcies! Hem rebut la teva sol·licitud i t'escrivim de seguida.",
    errorMensaje: "No hem pogut desar el teu missatge. Torna-ho a provar o escriu-nos per WhatsApp.",
    errorSolicitud: "No hem pogut desar la teva sol·licitud. Torna-ho a provar o escriu-nos per WhatsApp.",
    captcha:
      "No hem pogut comprovar que no ets un robot. Torna a prémer el botó d'aquí a uns segons o escriu-nos per WhatsApp.",
  },
);

/**
 * Errores de validación en catalán, por el texto castellano que devuelve Zod
 * (`lib/validation/lead.ts`). El esquema no se duplica: se traduce el mensaje.
 * Un mensaje que no esté aquí se enseña en castellano (y el test lo detecta).
 */
export const ERRORES_CA: Record<string, string> = {
  "Dinos tu nombre": "Digues-nos el teu nom",
  "Dinos tu nombre completo": "Digues-nos el teu nom complet",
  "Nombre demasiado largo": "El nom és massa llarg",
  "Teléfono no válido": "El telèfon no és vàlid",
  "El teléfono solo puede tener números y símbolos": "El telèfon només pot tenir números i símbols",
  "Email no válido": "El correu electrònic no és vàlid",
  "Necesitamos tu email": "Necessitem el teu correu electrònic",
  "Evento no válido": "L'esdeveniment no és vàlid",
  "Mensaje demasiado largo": "El missatge és massa llarg",
  "Marca al menos una opción que te interese": "Marca com a mínim una opció que t'interessi",
  "Demasiadas opciones marcadas": "Hi ha massa opcions marcades",
  "Debes aceptar el tratamiento de datos para continuar":
    "Has d'acceptar el tractament de dades per continuar",
};
