import { pares } from "@/i18n/textos";

/* Textos de las páginas del piloto en catalán: /clases, la ficha de
   disciplina, /horarios y /contacto (con sus metadatos). */

export const tClases = pares(
  {
    title: "Curso regular de baile en Vilanova i la Geltrú",
    description:
      "Curso regular de baile en Vilanova i la Geltrú, temporada 26·27: salsa cubana, bachata, reggaetón y más, de lunes a viernes. Desde cero y desde 35 €/mes.",
    listaSchema: (localidad: string) => `Clases de baile en ${localidad}`,
    razones: [
      {
        title: "Constancia que se nota",
        text: "Una clase suelta motiva; el curso regular transforma. Cada semana avanzas sobre lo anterior y en pocos meses bailas de verdad, no de milagro.",
      },
      {
        title: "Tu grupo, tu gente",
        text: "Vienes cada semana con las mismas caras. Llegas solo y a las pocas clases el finde ya empieza en la pista. La comunidad es el mejor motivo para no faltar.",
      },
      {
        title: "Desde cero absoluto",
        text: "Grupos por nivel real, sin presión y sin ridículos. Empieces donde empieces, hay un hueco pensado para ti — y profes que te acompañan.",
      },
    ],
    eyebrow: "Curso regular · Temporada 26·27 · Vilanova i la Geltrú",
    h1: "Curso regular de baile",
    h1Destacado: "en Vilanova",
    introFuerte: "Aprende a bailar y encuentra tu gente.",
    intro:
      "Salsa cubana, bachata, urbano y estilo, de lunes a viernes, con grupos desde cero absoluto. La mejor decisión de este año no es un propósito más: son dos horas a la semana para ti.",
    apuntarme: "Quiero apuntarme",
    desde: "Desde 35 €/mes · sin presión, sin permanencia.",
    porQue: "Por qué apuntarte es lo mejor que puedes hacer",
    estilos: "Estilos que puedes bailar",
    estilosIntro:
      "Elige uno, combínalos o llévatelos todos con la tarifa plana. Entra en cualquiera para ver de qué va y a quién le encaja.",
    enlaceClase: (nombre: string) => `Clases de ${nombre.toLowerCase()}`,
    horario: "Horario de la temporada",
    horarioIntro:
      "De lunes a viernes, de 18:30 a 21:30. Elige tu estilo y tu franja; nosotros te ubicamos en el grupo de tu nivel.",
    apuntate: "Apúntate al curso",
    apuntateIntro:
      "El formulario está ordenado por días, igual que el horario de arriba: busca el día que te va bien y marca la clase. Te escribimos para confirmar tu grupo y resolver cualquier duda antes de empezar.",
    preguntarAntes: "¿Prefieres preguntar antes?",
    escribenos: "Escríbenos por WhatsApp",
    submit: "Apuntarme al curso",
    interesesLabel: "¿Qué día y qué clase?",
    interesesHelp:
      "Marca todas las que quieras. Los números son el nivel: 0 = desde cero, 1 = iniciación, 2 = intermedio. Si no lo tienes claro, marca «Ayudadme a elegir» al final y lo vemos juntos.",
    /** Último grupo del formulario (valores guardados en castellano). */
    grupoDudas: "¿Todavía no lo tienes claro?",
    opcionDudas: {
      label: "Ayudadme a elegir",
      meta: "No sé mi nivel o no sé qué día me va mejor",
      hint: "Te escribimos y lo decidimos contigo",
    },
  },
  {
    title: "Curs regular de ball a Vilanova i la Geltrú",
    description:
      "Curs regular de ball a Vilanova i la Geltrú, temporada 26·27: salsa cubana, bachata, reggaeton i més, de dilluns a divendres. Des de zero i des de 35 €/mes.",
    listaSchema: (localidad: string) => `Classes de ball a ${localidad}`,
    razones: [
      {
        title: "Constància que es nota",
        text: "Una classe solta motiva; el curs regular transforma. Cada setmana avances sobre el que ja saps i en pocs mesos balles de debò, no per miracle.",
      },
      {
        title: "El teu grup, la teva gent",
        text: "Véns cada setmana amb les mateixes cares. Arribes sol i en poques classes el cap de setmana ja comença a la pista. La comunitat és el millor motiu per no faltar.",
      },
      {
        title: "Des de zero absolut",
        text: "Grups per nivell real, sense pressió i sense fer el ridícul. Comencis on comencis, hi ha un lloc pensat per a tu, i professors que t'acompanyen.",
      },
    ],
    eyebrow: "Curs regular · Temporada 26·27 · Vilanova i la Geltrú",
    h1: "Curs regular de ball",
    h1Destacado: "a Vilanova",
    introFuerte: "Aprèn a ballar i troba la teva gent.",
    intro:
      "Salsa cubana, bachata, urbà i estil, de dilluns a divendres, amb grups des de zero absolut. La millor decisió d'aquest any no és un propòsit més: són dues hores a la setmana per a tu.",
    apuntarme: "Em vull apuntar",
    desde: "Des de 35 €/mes · sense pressió, sense permanència.",
    porQue: "Per què apuntar-te és el millor que pots fer",
    estilos: "Estils que pots ballar",
    estilosIntro:
      "Tria'n un, combina'ls o queda-te'ls tots amb la tarifa plana. Entra a qualsevol per veure de què va i a qui li encaixa.",
    enlaceClase: (nombre: string) => `Classes de ${nombre.toLowerCase()}`,
    horario: "Horari de la temporada",
    horarioIntro:
      "De dilluns a divendres, de 18:30 a 21:30. Tria el teu estil i la teva franja; nosaltres t'ubiquem al grup del teu nivell.",
    apuntate: "Apunta't al curs",
    apuntateIntro:
      "El formulari està ordenat per dies, igual que l'horari de dalt: busca el dia que et va bé i marca la classe. T'escrivim per confirmar el teu grup i resoldre qualsevol dubte abans de començar.",
    preguntarAntes: "Prefereixes preguntar abans?",
    escribenos: "Escriu-nos per WhatsApp",
    submit: "Apunta'm al curs",
    interesesLabel: "Quin dia i quina classe?",
    interesesHelp:
      "Marca'n totes les que vulguis. Els números són el nivell: 0 = des de zero, 1 = iniciació, 2 = intermedi. Si no ho tens clar, marca «Ajudeu-me a triar» al final i ho mirem junts.",
    grupoDudas: "Encara no ho tens clar?",
    opcionDudas: {
      label: "Ajudeu-me a triar",
      meta: "No sé el meu nivell o no sé quin dia em va millor",
      hint: "T'escrivim i ho decidim amb tu",
    },
  },
);

export const tModalidad = pares(
  {
    title: (nombre: string) => `Clases de ${nombre} en `,
    ogTitle: (nombre: string) => `Clases de ${nombre}`,
    h1: (nombre: string, localidad: string) => `Clases de ${nombre.toLowerCase()} en ${localidad}`,
    schemaNombre: (nombre: string, localidad: string) => `Clases de ${nombre.toLowerCase()} en ${localidad}`,
    aprenderas: "En clase aprenderás",
    comoEs: "Cómo es una clase",
    horarioYPrecio: (nombre: string) => `Horario y precio de ${nombre}`,
    precio: (nombre: string) => `Precio de ${nombre}`,
    sesionesIntro: (nombre: string) =>
      `Estas son las clases de ${nombre.toLowerCase()} de la temporada 26·27 en Vilanova i la Geltrú. El número indica el nivel: 0 desde cero absoluto, 1 iniciación, 2 intermedio.`,
    precioTexto: (p: { base: number; extra: number; flat: number; periodo: string }) =>
      `**${p.base} €/${p.periodo}** por una disciplina. Cada estilo adicional suma ${p.extra} €/${p.periodo}, y con ${p.flat} €/${p.periodo} tienes la tarifa plana con todos los estilos. Sin matrícula y sin permanencia.`,
    variosDias: "¿Vas a venir varios días? La",
    plazaFundador: "plaza de socio fundador",
    dejaTodas: (precio: string) =>
      `deja todas las disciplinas de tu nivel en ${precio}/mes. También puedes ver el`,
    horarioCompleto: "horario completo de la semana",
    teLlevas: "Qué te llevas",
    esParaTi: "¿Es para ti?",
    probarClase: (nombre: string) => `Probar una clase de ${nombre}`,
    quienImparte: (nombre: string) => `Quién imparte ${nombre}`,
    tambien: (nombre: string) => `Si te gusta ${nombre}, prueba también`,
    ver: (nombre: string) => `Ver ${nombre}`,
    delBlog: (nombre: string) => `Del blog, sobre ${nombre.toLowerCase()}`,
    leerGuia: "Leer la guía",
    porDentro: (nombre: string) => `Una clase de ${nombre.toLowerCase()}, por dentro`,
    porDentroTexto: (localidad: string) =>
      `Vídeo y fotos de clases reales en la sala de ${localidad}. Ni banco de imágenes ni montajes: es lo que te vas a encontrar.`,
    teAnimas: "¿Te animas?",
    teAnimasTexto:
      "Reserva tu primera clase de prueba. Escríbenos y te asignamos el grupo ideal para tu nivel.",
    probar: (nombre: string) => `Probar ${nombre}`,
    desdeAside: (p: { base: number; fundador: string; nombre: string }) =>
      `Desde **${p.base} €/mes** por una disciplina. Tarifa fundadora: **${p.fundador}/mes** con acceso a todas las disciplinas de tu nivel — ${p.nombre} incluida.`,
    otras: "Otras disciplinas",
  },
  {
    title: (nombre: string) => `Classes de ${nombre} a `,
    ogTitle: (nombre: string) => `Classes de ${nombre}`,
    h1: (nombre: string, localidad: string) => `Classes de ${nombre.toLowerCase()} a ${localidad}`,
    schemaNombre: (nombre: string, localidad: string) => `Classes de ${nombre.toLowerCase()} a ${localidad}`,
    aprenderas: "A classe aprendràs",
    comoEs: "Com és una classe",
    horarioYPrecio: (nombre: string) => `Horari i preu de ${nombre}`,
    precio: (nombre: string) => `Preu de ${nombre}`,
    sesionesIntro: (nombre: string) =>
      `Aquestes són les classes de ${nombre.toLowerCase()} de la temporada 26·27 a Vilanova i la Geltrú. El número indica el nivell: 0 des de zero absolut, 1 iniciació, 2 intermedi.`,
    precioTexto: (p: { base: number; extra: number; flat: number; periodo: string }) =>
      `**${p.base} €/${p.periodo}** per una disciplina. Cada estil addicional hi suma ${p.extra} €/${p.periodo}, i amb ${p.flat} €/${p.periodo} tens la tarifa plana amb tots els estils. Sense matrícula i sense permanència.`,
    variosDias: "Vindràs diversos dies? La",
    plazaFundador: "plaça de soci fundador (en castellà)",
    dejaTodas: (precio: string) =>
      `et deixa totes les disciplines del teu nivell per ${precio}/mes. També pots mirar`,
    horarioCompleto: "tot l'horari de la setmana",
    teLlevas: "Què t'emportes",
    esParaTi: "És per a tu?",
    probarClase: (nombre: string) => `Prova una classe de ${nombre}`,
    quienImparte: (nombre: string) => `Qui fa les classes de ${nombre}`,
    tambien: (nombre: string) => `Si t'agrada la ${nombre.toLowerCase()}, prova també`,
    ver: (nombre: string) => `Mira ${nombre}`,
    delBlog: (nombre: string) => `Del blog, sobre ${nombre.toLowerCase()}`,
    leerGuia: "Llegeix la guia (en castellà)",
    porDentro: (nombre: string) => `Una classe de ${nombre.toLowerCase()}, per dins`,
    porDentroTexto: (localidad: string) =>
      `Vídeo i fotos de classes reals a la sala de ${localidad}. Ni bancs d'imatges ni muntatges: és el que et trobaràs.`,
    teAnimas: "T'hi animes?",
    teAnimasTexto:
      "Reserva la teva primera classe de prova. Escriu-nos i t'assignem el grup ideal per al teu nivell.",
    probar: (nombre: string) => `Prova ${nombre}`,
    desdeAside: (p: { base: number; fundador: string; nombre: string }) =>
      `Des de **${p.base} €/mes** per una disciplina. Tarifa fundadora: **${p.fundador}/mes** amb accés a totes les disciplines del teu nivell, ${p.nombre} inclosa.`,
    otras: "Altres disciplines",
  },
);

export const tHorarios = pares(
  {
    title: "Horarios de clases de baile en Vilanova",
    description: (desde: string, hasta: string) =>
      `Horario del curso regular 26·27 en Vilanova i la Geltrú: salsa cubana, bachata, reparto, reggaetón y heels, de lunes a viernes de ${desde} a ${hasta}.`,
    eyebrow: (primerDia: string, ultimoDia: string) => `Temporada 26·27 · ${primerDia} a ${ultimoDia}`,
    h1: "Horarios de clases de baile en Vilanova",
    intro: (total: number, primerDia: string, ultimoDia: string) =>
      `${total} clases a la semana, de ${primerDia} a ${ultimoDia} en franjas de tarde-noche. Busca tu día, mira qué se baila y escríbenos: te ubicamos en el grupo de tu nivel.`,
    parrilla: "Parrilla de la temporada 26·27",
    parrillaIntro: (primerDia: string, ultimoDia: string, desde: string, hasta: string) =>
      `De ${primerDia} a ${ultimoDia}, de ${desde} a ${hasta}, en la sala del Gimnasio Aranha de Vilanova i la Geltrú. Cada casilla es una clase fija cada semana, con el mismo grupo y los mismos profes.`,
    saberAntes: "¿Quieres saber de qué va cada estilo antes de elegir?",
    entraCurso: "Entra en el curso regular",
    abreDisciplina: "y abre la disciplina que te llame. Allí mismo tienes",
    tarifasFormulario: "las tarifas y el formulario de inscripción",
    ordenado: "ordenado por días, igual que esta tabla.",
    queSeBaila: "Qué se baila cada día",
    queSeBailaIntro:
      "Estas son las disciplinas del curso regular y los días que tiene cada una. Entra en cualquiera para ver de qué va, qué se aprende y quién la imparte.",
    clasesDe: (nombre: string) => `Clases de ${nombre.toLowerCase()}`,
    con: (profes: string) => `Con ${profes}.`,
    niveles: "Grupos por nivel real",
    nivelesTexto:
      "Cada disciplina se organiza en grupos por nivel, para que avances a tu ritmo y nunca te sientas ni perdido ni frenado. En la parrilla, el número que acompaña al estilo es justo eso: **0** es desde cero absoluto, **1** iniciación y **2** intermedio. Los estilos sin número tienen un solo grupo abierto.",
    noSabes:
      "Si no sabes dónde encajas, no pasa nada: nos cuentas qué llevas bailado y te proponemos el grupo. Si al probar vemos que te queda corto o largo, se ajusta.",
    hueco: "Encuentra tu hueco",
    huecoTexto:
      "Dinos qué días puedes y qué te apetece bailar, y te decimos qué grupos de la parrilla encajan con tu agenda.",
    consultar: "Consultar horarios",
    nota: "La parrilla es la de la temporada 26·27. Si un grupo se llena o cambia de franja, te lo decimos al escribirnos.",
  },
  {
    title: "Horaris de classes de ball a Vilanova",
    description: (desde: string, hasta: string) =>
      `Horari del curs regular 26·27 a Vilanova i la Geltrú: salsa cubana, bachata, reparto, reggaeton i heels, de dilluns a divendres de ${desde} a ${hasta}.`,
    eyebrow: (primerDia: string, ultimoDia: string) => `Temporada 26·27 · De ${primerDia} a ${ultimoDia}`,
    h1: "Horaris de classes de ball a Vilanova",
    intro: (total: number, primerDia: string, ultimoDia: string) =>
      `${total} classes a la setmana, de ${primerDia} a ${ultimoDia} en franges de tarda-vespre. Busca el teu dia, mira què s'hi balla i escriu-nos: t'ubiquem al grup del teu nivell.`,
    parrilla: "Graella de la temporada 26·27",
    parrillaIntro: (primerDia: string, ultimoDia: string, desde: string, hasta: string) =>
      `De ${primerDia} a ${ultimoDia}, de ${desde} a ${hasta}, a la sala del Gimnàs Aranha, tocant a Vilanova i la Geltrú. Cada casella és una classe fixa cada setmana, amb el mateix grup i els mateixos professors.`,
    saberAntes: "Vols saber de què va cada estil abans de triar?",
    entraCurso: "Entra al curs regular",
    abreDisciplina: "i obre la disciplina que et cridi l'atenció. Allà mateix tens",
    tarifasFormulario: "les tarifes i el formulari d'inscripció",
    ordenado: "ordenat per dies, igual que aquesta taula.",
    queSeBaila: "Què es balla cada dia",
    queSeBailaIntro:
      "Aquestes són les disciplines del curs regular i els dies que té cadascuna. Entra a qualsevol per veure de què va, què s'hi aprèn i qui la fa.",
    clasesDe: (nombre: string) => `Classes de ${nombre.toLowerCase()}`,
    con: (profes: string) => `Amb ${profes}.`,
    niveles: "Grups per nivell real",
    nivelesTexto:
      "Cada disciplina s'organitza en grups per nivell, perquè avancis al teu ritme i no et sentis mai ni perdut ni frenat. A la graella, el número que acompanya l'estil és justament això: **0** és des de zero absolut, **1** iniciació i **2** intermedi. Els estils sense número tenen un sol grup obert.",
    noSabes:
      "Si no saps on encaixes, cap problema: ens expliques què has ballat i el professor t'assigna el grup. Si en provar veiem que se't queda curt o llarg, s'ajusta.",
    hueco: "Troba el teu forat",
    huecoTexto:
      "Digues-nos quins dies pots i què et ve de gust ballar, i et direm quins grups de la graella encaixen amb la teva agenda.",
    consultar: "Consulta els horaris",
    nota: "La graella és la de la temporada 26·27. Si un grup s'omple o canvia de franja, t'ho diem quan ens escriguis.",
  },
);

export const tContacto = pares(
  {
    title: "Contacto y clase de prueba en Vilanova",
    description:
      "Contacta con NEXUS VNG, escuela de baile en Vilanova i la Geltrú: WhatsApp, teléfono y formulario para reservar tu clase de prueba y elegir grupo.",
    schemaNombre: (nombre: string) => `Contacto · ${nombre}`,
    eyebrow: "Hablemos",
    h1: "Contacto y clase de prueba",
    intro:
      "La vía más rápida es WhatsApp: nos cuentas qué quieres bailar y qué días puedes, y te decimos qué grupo encaja. Si lo prefieres, déjanos tus datos y te escribimos nosotros.",
    escribenos: "Escríbenos",
    escribenosTexto:
      "Reserva tu primera clase de prueba y da tus primeros pasos con nosotros. No hace falta que sepas qué estilo quieres ni en qué nivel estás: para eso escribimos.",
    abrirWhatsapp: "Abrir WhatsApp",
    cuando: "Cuándo nos encuentras",
    cuandoAntes: (p: { primerDia: string; ultimoDia: string; apertura: string; cierre: string }) =>
      `Estamos en la sala de ${p.primerDia} a ${p.ultimoDia}, de ${p.apertura} a ${p.cierre}: es el horario de clases de la temporada 26·27. Puedes verlo entero en`,
    parrilla: "la parrilla de horarios",
    respuesta: "Cuándo te respondemos",
    respuestaTexto:
      "Somos un equipo pequeño y damos clase por las tardes, así que no prometemos un plazo exacto. Lo habitual: si escribes durante la franja de clases, te contestamos al terminar la sesión; el resto del día lo miramos en cuanto tenemos un hueco. Ningún mensaje se queda sin respuesta.",
    donde: "Dónde estamos",
    planta: "Estamos en la primera planta del gimnasio. Si tienes dudas para llegar, escríbenos por WhatsApp.",
    datos: "Déjanos tus datos",
    dudaRapida: "¿Solo quieres resolver una duda rápida? Muchas están ya contestadas en",
    preguntas: "las preguntas frecuentes",
  },
  {
    title: "Contacte i classe de prova a Vilanova",
    description:
      "Contacta amb NEXUS VNG, escola de ball a Vilanova i la Geltrú: WhatsApp, telèfon i formulari per reservar la teva classe de prova i triar grup.",
    schemaNombre: (nombre: string) => `Contacte · ${nombre}`,
    eyebrow: "Parlem-ne",
    h1: "Contacte i classe de prova",
    intro:
      "La via més ràpida és WhatsApp: ens expliques què vols ballar i quins dies pots, i et diem quin grup t'encaixa. Si ho prefereixes, deixa'ns les teves dades i t'escrivim nosaltres.",
    escribenos: "Escriu-nos",
    escribenosTexto:
      "Reserva la teva primera classe de prova i fes els primers passos amb nosaltres. No cal que sàpigues quin estil vols ni en quin nivell estàs: per això escrivim.",
    abrirWhatsapp: "Obre WhatsApp",
    cuando: "Quan ens trobes",
    cuandoAntes: (p: { primerDia: string; ultimoDia: string; apertura: string; cierre: string }) =>
      `Som a la sala de ${p.primerDia} a ${p.ultimoDia}, de ${p.apertura} a ${p.cierre}: és l'horari de classes de la temporada 26·27. El pots veure sencer a`,
    parrilla: "la graella d'horaris",
    respuesta: "Quan et responem",
    respuestaTexto:
      "Som un equip petit i fem classe a les tardes, així que no prometem un termini exacte. El més habitual: si escrius durant la franja de classes, et contestem en acabar la sessió; la resta del dia ho mirem tan aviat com tenim un moment. Cap missatge es queda sense resposta.",
    donde: "On som",
    planta: "Som a la primera planta del gimnàs. Si tens dubtes per arribar-hi, escriu-nos per WhatsApp.",
    datos: "Deixa'ns les teves dades",
    dudaRapida: "Només vols resoldre un dubte ràpid? Molts ja estan contestats a",
    preguntas: "les preguntes freqüents (en castellà)",
  },
);
