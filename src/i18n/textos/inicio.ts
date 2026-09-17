import { pares } from "@/i18n/textos";

/*
  Textos de las secciones de la home que no están en content/landing.ts
  (titulares y etiquetas escritos en cada componente).
*/

export const tIntro = pares(
  {
    titulo: (localidad: string) => `Clases de salsa cubana y bachata en ${localidad}`,
    p1: (o: { nombre: string; local: string; localidad: string; region: string; disciplinas: string }) =>
      `${o.nombre} es la escuela de baile del ${o.local}, en ${o.localidad} (${o.region}). Clases de ${o.disciplinas} en grupos por nivel real, de lunes a viernes, desde cero absoluto hasta avanzado.`,
    p2Antes: "Se puede empezar sin pareja, sin experiencia y sin saber qué estilo te pega:",
    verDisciplinas: "mira las disciplinas",
    verHorarios: "consulta los horarios",
    p2Despues: "o escríbenos y te decimos qué grupo te encaja.",
    /** Conjunción de la última disciplina de la lista. */
    y: "y",
  },
  {
    titulo: (localidad: string) => `Classes de salsa cubana i bachata a ${localidad}`,
    p1: (o: { nombre: string; local: string; localidad: string; region: string; disciplinas: string }) =>
      `${o.nombre} és l'escola de ball del ${o.local.replace(/^Gimnasio/, "Gimnàs")}, tocant a ${o.localidad} (${o.region}). Classes de ${o.disciplinas} en grups per nivell real, de dilluns a divendres, des de zero absolut fins a avançat.`,
    p2Antes: "Pots començar sense parella, sense experiència i sense saber quin estil t'escau:",
    verDisciplinas: "mira les disciplines",
    verHorarios: "consulta els horaris",
    p2Despues: "o escriu-nos i et diem quin grup t'encaixa.",
    y: "i",
  },
);

export const tParaTi = pares(
  {
    kicker: "Esto es para ti",
    titulo: "Para quien nunca ha bailado. Y para quien ya no puede parar.",
    texto:
      "Tenemos grupos por nivel real, desde cero absoluto hasta avanzado. Llegues con la edad, la timidez o las dos manos izquierdas que sea: hay un sitio hecho para ti.",
  },
  {
    kicker: "Això és per a tu",
    titulo: "Per a qui no ha ballat mai. I per a qui ja no pot parar.",
    texto:
      "Tenim grups per nivell real, des de zero absolut fins a avançat. Vinguis amb l'edat, la timidesa o els dos peus esquerres que sigui: hi ha un lloc fet per a tu.",
  },
);

export const tExperiencia = pares(
  { kicker: "Lo que vas a vivir", titulo: "Más que pasos: una forma de sentirte" },
  { kicker: "El que viuràs", titulo: "Més que passos: una manera de sentir-te" },
);

export const tModalidades = pares(
  {
    kicker: "Qué se baila",
    etiqueta: "Modalidad",
    verN: (n: number) => `Ver las ${n} disciplinas`,
    verTodas: "Ver todas las disciplinas",
  },
  {
    kicker: "Què s'hi balla",
    etiqueta: "Modalitat",
    verN: (n: number) => `Mira les ${n} disciplines`,
    verTodas: "Mira totes les disciplines",
  },
);

export const tComunidad = pares(
  {
    kicker: "El corazón",
    titulo: "El corazón son las personas",
    texto:
      "Fotos de clases reales de la escuela, en la sala de Vilanova. Ni banco de imágenes ni modelos: es la gente que viene cada semana.",
  },
  {
    kicker: "El cor",
    titulo: "El cor són les persones",
    texto:
      "Fotos de classes reals de l'escola, a la sala de Vilanova. Ni bancs d'imatges ni models: és la gent que ve cada setmana.",
  },
);

export const tProfesores = pares(
  {
    alt: "El equipo de profesores de NEXUS VNG",
    kicker: "Quién te acompaña",
    titulo: "Detrás de cada paso, los mejores",
    texto:
      "No te suelta nadie. Un equipo de profesores en formación constante que cuida el detalle de cada movimiento, corrige con cariño y adapta la clase a tu nivel. Aquí te conocen por tu nombre desde el primer día.",
    tags: ["Te corrigen el detalle", "Te conocen por tu nombre", "Formación constante"],
  },
  {
    alt: "L'equip de professors de NEXUS VNG",
    kicker: "Qui t'acompanya",
    titulo: "Darrere de cada pas, els millors",
    texto:
      "Ningú no et deixa sol. Un equip de professors en formació constant que cuida el detall de cada moviment, corregeix amb afecte i adapta la classe al teu nivell. Aquí et coneixen pel nom des del primer dia.",
    tags: ["Et corregeixen el detall", "Et coneixen pel nom", "Formació constant"],
  },
);

export const tFounding = pares(
  {
    mes: "/mes",
    plazas: "Plazas fundadoras",
    quedan: (l: number, t: number) => `Quedan ${l} / ${t}`,
    quedanAria: (l: number, t: number) => `Quedan ${l} de ${t} plazas fundadoras`,
    preguntar: "O pregúntanos por WhatsApp",
  },
  {
    mes: "/mes",
    plazas: "Places fundadores",
    quedan: (l: number, t: number) => `Queden ${l} / ${t}`,
    quedanAria: (l: number, t: number) => `Queden ${l} de ${t} places fundadores`,
    preguntar: "O pregunta'ns per WhatsApp",
  },
);

export const tComoEmpezar = pares(
  { kicker: "Cómo empezar", titulo: "Tres pasos y estás dentro" },
  { kicker: "Com començar", titulo: "Tres passos i ja hi ets" },
);

export const tDondeEstamos = pares(
  {
    kicker: "La sala",
    titulo: "Dónde",
    tituloDestacado: "estamos",
    junto: (localidad: string) => `, junto a ${localidad}`,
    texto:
      "Estamos en la primera planta del gimnasio. Si te cuesta encontrarnos, escríbenos y te guiamos. Los horarios de cada clase están en",
    parrilla: "la parrilla de la temporada",
  },
  {
    kicker: "La sala",
    titulo: "On",
    tituloDestacado: "som",
    junto: (localidad: string) => `, tocant a ${localidad}`,
    texto:
      "Som a la primera planta del gimnàs. Si et costa trobar-nos, escriu-nos i t'hi guiem. Els horaris de cada classe són a",
    parrilla: "la graella de la temporada",
  },
);

export const tFaq = pares(
  { kicker: "Antes de escribir", titulo: "Dudas rápidas" },
  { kicker: "Abans d'escriure", titulo: "Dubtes ràpids" },
);

export const tInicioMeta = pares(
  {
    title: "Clases de baile en Vilanova i la Geltrú",
    description:
      "Escuela de baile en Vilanova i la Geltrú: salsa cubana, bachata, reparto, heels y más, con grupos desde cero. Reserva tu clase de prueba por WhatsApp.",
    /** `description` del DanceSchool en el JSON-LD. */
    escuela:
      "Escuela de salsa cubana, bachata y más en Vilanova i la Geltrú. Comunidad, niveles desde cero a avanzado y clases de prueba para empezar.",
  },
  {
    title: "Classes de ball a Vilanova i la Geltrú",
    description:
      "Escola de ball a Vilanova i la Geltrú: salsa cubana, bachata, reparto, heels i més, amb grups des de zero. Reserva la teva classe de prova per WhatsApp.",
    escuela:
      "Escola de salsa cubana, bachata i més a Vilanova i la Geltrú. Comunitat, nivells des de zero fins a avançat i classes de prova per començar.",
  },
);
