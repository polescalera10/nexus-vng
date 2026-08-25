import type { CampanaDolorContent } from "./types";

/**
 * ICP 2 — La que busca expresión, cuerpo y empoderamiento.
 * Fuente: analisis-icp-pain-points.md § ICP 2. Mejor gancho visual para ads (heels/lady style/reggaeton).
 * Psicología: identidad + future pacing emocional + reencuadre del ejercicio.
 * Los argumentos de clase salen del contenido real de content/modalidades.ts.
 */
export const expresion: Record<string, CampanaDolorContent> = {
  "odio-el-gym": {
    icp: "expresion",
    dolor: "odio-el-gym",
    headline: "Odias el gym. No odias moverte.",
    subhead:
      "La prueba: cuando suena una canción que te gusta, el cuerpo va solo. Aquí entrenas así — con música, con grupo y sin contar una sola repetición.",
    ctaHero: "Quiero moverme sin aburrirme",
    mensajeWhatsapp: "¡Hola! He probado el gimnasio mil veces y siempre lo dejo, ¿cómo son vuestras clases de baile? 💃",
    agitacion: {
      kicker: "El ciclo que ya conoces",
      parrafos: [
        "Enero: te apuntas con toda la intención. Febrero: vas arrastrándote. Marzo: la cuota se cobra sola y tú ya no apareces. No es la primera vez — y si no cambias de fórmula, no será la última.",
        "El problema nunca fue tu disciplina. Es que el gimnasio te pide sostener con pura fuerza de voluntad algo que te aburre. Y contra el aburrimiento, la voluntad pierde siempre. A todo el mundo.",
        "La única actividad física que se sostiene años es la que disfrutas mientras la haces. No después, cuando ves resultados: durante. Eso existe — solo que no está entre las máquinas.",
      ],
    },
    antesDespues: {
      titulo: "El mismo objetivo, otro camino",
      antesLabel: "El ciclo del gimnasio",
      antes: [
        "Empiezas motivada y lo dejas antes del segundo mes.",
        "Cada sesión es mirar el reloj esperando que acabe.",
        "Pagas cuotas de meses que no pisas.",
        "Te cuentas que eres \"inconstante\" — cuando es el formato el que falla.",
      ],
      despuesLabel: "El ciclo de la pista",
      despues: [
        "Vienes porque te apetece: la clase es lo mejor de tu martes.",
        "Una hora que pasa volando — te enteras de que sudaste al acabar.",
        "El grupo y la coreo nueva te hacen volver sin forzarte.",
        "Descubres que sí eres constante — cuando algo merece constancia.",
      ],
    },
    clase: {
      slug: "reggaeton",
      nombre: "Reggaeton",
      titulo: "Reggaeton: entrenar sin enterarte de que entrenas",
      descripcion:
        "Una clase entera de reggaeton es un entrenamiento completo — piernas, core y resistencia — con la mejor banda sonora posible. Es la música que ya te sabes, bailada con técnica y actitud: por eso engancha donde el gimnasio aburre. Y es la clase donde más se ríe de toda la escuela.",
      porQue: [
        {
          title: "El mejor cardio de la semana",
          text: "Piernas, core y resistencia en una hora completa — sin máquinas, sin series, sin reloj.",
        },
        {
          title: "Música que ya es tuya",
          text: "Coreografías sobre los temas del momento: la motivación viene puesta en la playlist.",
        },
        {
          title: "Recompensa inmediata",
          text: "Con dos o tres pasos dominados, la próxima fiesta ya es otra historia. El gym no te da eso.",
        },
      ],
      cta: "Probar reggaeton",
    },
    dolorSolucion: [
      {
        dolor: "Te apuntas al gimnasio con ganas y a las dos semanas ya no vas.",
        solucion: "Aquí no te sostiene la fuerza de voluntad: te sostienen las ganas de volver.",
      },
      {
        dolor: "Las máquinas y las series repetidas se te hacen eternas.",
        solucion: "Una hora de baile pasa volando porque estás aprendiendo una coreo, no contando repeticiones.",
      },
      {
        dolor: "No ves resultados y eso te desmotiva para seguir yendo.",
        solucion: "Aquí el avance se ve clase a clase: los pasos que la semana pasada no salían, hoy salen.",
      },
    ],
    objecion: {
      pregunta: "\"¿Esto realmente cansa o es solo bailar?\"",
      respuesta: "Sales sudando igual que del gimnasio. La diferencia es que no has mirado el reloj ni una vez.",
    },
    pruebaSocial: "Muchas de las que se apuntan han probado el gimnasio antes y no lo sostuvieron ni un mes.",
    faqExtra: [
      {
        q: "¿Esto sustituye al gimnasio o lo complementa?",
        a: "Lo que quieras: hay quien lo usa como su único entrenamiento semanal y quien lo combina con otra actividad.",
      },
      {
        q: "¿Necesito estar en forma para empezar?",
        a: "No. Se entra por nivel y el cuerpo coge forma con las clases, no al revés.",
      },
    ],
    cierreEmocional: "Deja de apuntarte a cosas que odias. Prueba una que te dé pena que acabe.",
    metaTitle: "¿Odias el gimnasio? Reggaeton en Vilanova",
    metaDescription:
      "Cuando suena tu canción el cuerpo va solo: entrena así, con música, técnica y grupo. Clase de prueba de reggaeton en Vilanova i la Geltrú.",
  },

  "soltarse": {
    icp: "expresion",
    dolor: "soltarse",
    headline: "Suéltate con tu cuerpo. Sin sentirte ridícula.",
    subhead:
      "La soltura no se trae de casa: se entrena. Paso a paso, en un grupo donde nadie te juzga el movimiento.",
    ctaHero: "Quiero soltarme",
    mensajeWhatsapp: "¡Hola! Me siento muy cortada moviéndome y me gustaría soltarme un poco, ¿cómo funcionan vuestras clases? 💃",
    agitacion: {
      kicker: "Esa rigidez tiene historia",
      parrafos: [
        "En algún momento aprendiste a contenerte. Quizá un comentario, una mirada, una edad en la que moverse \"demasiado\" daba vergüenza. El cuerpo tomó nota y desde entonces baila con el freno de mano puesto — si es que baila.",
        "La rigidez no es tu personalidad: es un hábito defensivo. Y como todo hábito, se desentrena. No con discursos de quererse más, sino con lo único que funciona: repetición física, en un espacio donde nadie evalúa.",
        "Frente al espejo, con técnica concreta — postura, cadera, brazos — el cuerpo va soltando el freno. No de golpe: clase a clase. Hasta que un día te ves en el espejo y no reconoces a la persona rígida que llegó.",
      ],
    },
    antesDespues: {
      titulo: "Del freno de mano a la soltura",
      antesLabel: "Tu cuerpo ahora",
      antes: [
        "Bailas \"pequeño\", ocupando el mínimo espacio posible.",
        "Cada movimiento pasa antes por el filtro de \"¿cómo se verá?\".",
        "Evitas pistas, espejos y cualquier sitio donde te puedan mirar.",
        "Sientes que la soltura es algo que otras tienen de serie.",
      ],
      despuesLabel: "Tu cuerpo entrenado",
      despues: [
        "La técnica sustituye a la duda: sabes qué hacer con brazos y cadera.",
        "El espejo pasa de enemigo a herramienta de trabajo.",
        "Ocupas tu espacio al bailar — y eso se contagia al resto de tu vida.",
        "Descubres que la soltura no era un don: era entrenamiento que te faltaba.",
      ],
    },
    clase: {
      slug: "lady-style-salsa",
      nombre: "Lady Style Salsa",
      titulo: "Lady Style: la clase donde se entrena la soltura",
      descripcion:
        "Lady Style es exactamente esto: técnica y estilo individual, sin pareja, frente al espejo — postura, líneas de brazos, movimiento de cadera, giros y actitud. La clase que trabaja pieza a pieza todo lo que hace que un cuerpo se mueva con seguridad. La elegancia no se trae de casa: se entrena.",
      porQue: [
        {
          title: "Técnica contra la vergüenza",
          text: "Cuando sabes qué hacer con cada parte del cuerpo, la inseguridad se queda sin sitio. Eso es lo que se entrena aquí.",
        },
        {
          title: "Sin pareja, a tu ritmo",
          text: "Trabajas tu propio movimiento frente al espejo, sin depender de nadie ni exponerte antes de tiempo.",
        },
        {
          title: "Se nota fuera de clase",
          text: "Postura, presencia y control corporal: caminas distinta al salir de clase — literalmente.",
        },
      ],
      cta: "Probar Lady Style",
    },
    dolorSolucion: [
      {
        dolor: "Sientes tu cuerpo rígido y te cuesta moverte con naturalidad.",
        solucion: "La soltura se entrena con ejercicios concretos, clase a clase; no es algo que ya deberías tener.",
      },
      {
        dolor: "Te da corte mover las caderas o el cuerpo delante de otras personas.",
        solucion: "Todo el grupo está aprendiendo lo mismo a la vez: nadie está pendiente de si te sale perfecto.",
      },
      {
        dolor: "Crees que el estilo es solo para quien ya tiene esa energía.",
        solucion: "Esa energía se construye en clase, no se trae de casa: empiezas marcando el paso y va saliendo sola.",
      },
    ],
    objecion: {
      pregunta: "\"Soy muy patosa, me da vergüenza hasta empezar\"",
      respuesta: "Es la sensación más habitual el primer día, y se va sola en cuanto el cuerpo coge la mecánica del movimiento.",
    },
    faqExtra: [
      {
        q: "¿Hace falta experiencia previa en baile?",
        a: "No, ninguna. Los grupos de nivel inicial parten de cero absoluto.",
      },
    ],
    cierreEmocional: "El primer paso para soltarte es venir. El resto lo hace la música.",
    metaTitle: "Suéltate con tu cuerpo — Lady Style en Vilanova",
    metaDescription:
      "La soltura no se trae de casa, se entrena: postura, cadera, brazos y actitud frente al espejo. Prueba una clase de Lady Style en Vilanova.",
  },

  "confianza": {
    icp: "expresion",
    dolor: "confianza",
    headline: "Tu seguridad se reconstruye. Clase a clase.",
    subhead:
      "No hace falta llegar con confianza de sobra. Aquí se va construyendo, movimiento a movimiento, hasta que un día te das cuenta de que ya no la buscas: la tienes.",
    ctaHero: "Quiero recuperar mi seguridad",
    mensajeWhatsapp: "¡Hola! Llevo tiempo con poca seguridad en mí misma y creo que esto me puede ayudar, ¿me contáis cómo son las clases? 💃",
    agitacion: {
      kicker: "Lo que no funciona",
      parrafos: [
        "Ya lo has intentado por la vía mental: frases de motivación, propósitos, prometerte que a partir de mañana te vas a querer más. Dura tres días, porque la confianza no se piensa — se demuestra. Tu cuerpo necesita pruebas, no discursos.",
        "Cada complejo que arrastras se alimenta de lo mismo: evitar. Evitas mirarte, evitas exponerte, evitas moverte. Y cada evitación confirma la historia de que no puedes.",
        "La reconstrucción funciona al revés: haces algo que creías que no podías — un paso, un giro, una coreografía entera — y el cuerpo archiva la prueba. Suficientes pruebas, y la historia cambia. No porque te lo hayas repetido: porque lo has hecho.",
      ],
    },
    antesDespues: {
      titulo: "La confianza que se piensa vs. la que se entrena",
      antesLabel: "El bucle actual",
      antes: [
        "Frases motivacionales que duran hasta el primer mal día.",
        "Evitar espejos, fotos y situaciones donde exponerte.",
        "La sensación de que la seguridad es cosa de otras.",
        "Cada \"no puedo\" sin comprobar refuerza el complejo.",
      ],
      despuesLabel: "El bucle nuevo",
      despues: [
        "Pruebas físicas reales: cada semana haces algo que antes no podías.",
        "El espejo se convierte en el sitio donde ves tu progreso.",
        "Sostienes una mirada, un movimiento, un escenario — y se nota fuera.",
        "La actitud que entrenas en clase se viene contigo a la calle.",
      ],
    },
    clase: {
      slug: "heels",
      nombre: "Heels",
      titulo: "Heels: empoderamiento sin postureo",
      descripcion:
        "Heels es la clase donde la elegancia y la fuerza dejan de ser opuestos: técnica de danza, líneas, coreografía y una actitud escénica potente — sobre tacones o sin ellos, cuando tú estés lista. Un espacio para ocupar el escenario sin pedir perdón. La actitud que se entrena aquí se viene contigo a la calle.",
      porQue: [
        {
          title: "Confianza con método",
          text: "Presencia escénica, líneas, actitud: aquí la seguridad no se predica — se entrena con técnica concreta.",
        },
        {
          title: "A tu ritmo, sin molde",
          text: "Empiezas sin tacones si quieres; llegan cuando tú estés lista. No hay un molde — hay un espejo.",
        },
        {
          title: "Fuerza real debajo",
          text: "Piernas, core y equilibrio como pocas disciplinas: la elegancia, por debajo, es pura fuerza.",
        },
      ],
      cta: "Probar Heels",
    },
    dolorSolucion: [
      {
        dolor: "Arrastras complejos con tu cuerpo que te frenan a la hora de moverte.",
        solucion: "En clase el foco está en lo que consigues, no en cómo te ves: la confianza llega por lo que tu cuerpo aprende a hacer.",
      },
      {
        dolor: "La falta de seguridad te frena en más sitios de los que crees, no solo al bailar.",
        solucion: "Cada logro en clase —un paso, una coreo, una postura— se nota también fuera de la pista.",
      },
      {
        dolor: "Necesitas un espacio propio para reconectar contigo, sin la mirada de nadie.",
        solucion: "La clase es tu rato: nadie evalúa, nadie compara, solo avanzas a tu ritmo.",
      },
    ],
    objecion: {
      pregunta: "\"¿Y si no soy capaz y me frustro más?\"",
      respuesta: "Los grupos empiezan de cero real: cada avance está pensado para sumar seguridad, no para restarla.",
    },
    pruebaSocial: "Es habitual ver a alguien llegar muy insegura y, unas semanas después, moverse con otra soltura.",
    faqExtra: [
      {
        q: "¿Hace falta saber caminar con tacones?",
        a: "No: la técnica se construye primero descalza o con zapatillas, y los tacones llegan cuando tú estés lista.",
      },
    ],
    cierreEmocional: "La seguridad no aparece de golpe: se entrena. Empieza por una clase y compruébalo tú misma.",
    metaTitle: "Reconstruye tu seguridad — Heels en Vilanova",
    metaDescription:
      "La confianza se construye clase a clase: técnica, actitud y presencia que se vienen contigo a la calle. Prueba una clase de Heels en Vilanova.",
  },

  "tu-rato": {
    icp: "expresion",
    dolor: "tu-rato",
    headline: "Un rato de la semana que es solo tuyo.",
    subhead:
      "Ni trabajo, ni casa, ni estar disponible para nadie. Una hora en la que la única persona de la que te ocupas eres tú.",
    ctaHero: "Quiero mi rato semanal",
    mensajeWhatsapp: "¡Hola! Busco un plan fijo a la semana que sea solo para mí, ¿cómo son vuestras clases? 🙂",
    agitacion: {
      kicker: "Repasa tu semana",
      parrafos: [
        "Lunes a viernes: trabajo. Tardes: casa, recados, estar pendiente de todos. Finde: lo que quede, repartido entre lo que toca. Ahora la pregunta incómoda: ¿en qué casilla de tu semana estás tú? Tú sola, sin función, sin servir a nadie.",
        "Si la respuesta es \"en ninguna\", no es un descuido puntual: es un patrón. Y los patrones no se rompen con intenciones — se rompen con una cita fija que no se pueda negociar.",
        "Una hora semanal, en el calendario, con nombre y apellido: tuya. No para ser más productiva ni mejor en nada para nadie. Para moverte, sudar, mirarte al espejo y acordarte de que existes fuera de tus funciones.",
      ],
    },
    antesDespues: {
      titulo: "Tu semana, con y sin tu hora",
      antesLabel: "La semana de ahora",
      antes: [
        "Todas tus horas tienen dueño — y ninguno eres tú.",
        "El \"tiempo para mí\" siempre es lo primero que se sacrifica.",
        "Acabas la semana agotada y con la sensación de no haber hecho nada tuyo.",
        "Tu identidad se reduce a tus funciones: trabajo, casa, los demás.",
      ],
      despuesLabel: "La semana con tu hora",
      despues: [
        "Una cita fija e innegociable que es solo tuya.",
        "Sales de clase con la cabeza despejada y el cuerpo activado.",
        "Frente al espejo trabajas algo que es tuyo y de nadie más: tu estilo.",
        "El resto de la semana se lleva mejor cuando una hora es para ti.",
      ],
    },
    clase: {
      slug: "lady-style-salsa",
      nombre: "Lady Style Salsa",
      titulo: "Lady Style: una hora para ti, frente al espejo",
      descripcion:
        "Si buscas un rato que sea íntegramente tuyo, Lady Style es la clase: se trabaja sin pareja, frente al espejo, puliendo tu postura, tus líneas, tu movimiento — tu estilo. Un espacio para ganar soltura, presencia y confianza con tu propio cuerpo. Nada que dar a nadie: todo para ti.",
      porQue: [
        {
          title: "Sin depender de nadie",
          text: "Clase individual, sin pareja: tu progreso, tu espejo, tu ritmo. La hora es tuya de principio a fin.",
        },
        {
          title: "Un trabajo que se queda contigo",
          text: "Postura, control corporal y presencia: lo que entrenas aquí te acompaña el resto de la semana.",
        },
        {
          title: "Tu estilo, tu proyecto",
          text: "Cada clase pules algo tuyo — brazos, giros, actitud. Un proyecto personal que no es para nadie más.",
        },
      ],
      cta: "Probar Lady Style",
    },
    dolorSolucion: [
      {
        dolor: "Tu semana es trabajo, casa y estar disponible para todo el mundo menos para ti.",
        solucion: "Tienes una hora fija a la semana reservada solo para ti, y nadie más puede ocuparla.",
      },
      {
        dolor: "Cuando por fin tienes un rato libre, se va en tareas o pantallas.",
        solucion: "La clase te saca físicamente de casa: durante esa hora es imposible seguir haciendo otra cosa.",
      },
      {
        dolor: "Necesitas un plan que sea tuyo, no compartido con pareja, hijos o trabajo.",
        solucion: "Es tu cita, sin nadie más en la ecuación: entras a la pista solo con tu grupo de clase.",
      },
    ],
    objecion: {
      pregunta: "\"No sé si voy a poder sostener un plan fijo cada semana\"",
      respuesta: "Es una sola hora fija: entra en cualquier agenda y, además, es de las pocas citas que apetece mantener.",
    },
    faqExtra: [
      {
        q: "¿Qué días y horarios hay disponibles?",
        a: "Escríbenos con tu disponibilidad y te decimos qué grupos encajan mejor con tu semana.",
      },
    ],
    cierreEmocional: "Llevas semanas dándoselo todo a todos. Guárdate una hora.",
    metaTitle: "Tu rato de la semana — Lady Style en Vilanova",
    metaDescription:
      "Una hora a la semana que es solo tuya: postura, estilo y presencia frente al espejo, sin ocuparte de nadie más. Lady Style en Vilanova.",
  },

  "espacio-sin-juicios": {
    icp: "expresion",
    dolor: "espacio-sin-juicios",
    headline: "Un espacio femenino, sin miradas ni competición.",
    subhead:
      "Aquí no vienes a que te evalúen ni a competir con nadie. Vienes a moverte a gusto, en un grupo mayoritariamente femenino, centrado en pasarlo bien.",
    ctaHero: "Quiero un espacio sin presión",
    mensajeWhatsapp: "¡Hola! Busco un espacio femenino y sin presión para moverme, ¿cómo es el ambiente en vuestras clases? 💃",
    agitacion: {
      kicker: "Sabes de qué hablamos",
      parrafos: [
        "La sala de pesas donde notas los ojos en la nuca. La clase dirigida donde parece que compites sin haberte apuntado a competir. Los espacios de deporte tienen algo que nadie nombra: la sensación constante de estar siendo evaluada.",
        "Y contra eso no hay rutina que aguante. Nadie vuelve con ganas a un sitio donde se siente observada. No es falta de disciplina: es puro instinto de protección.",
        "Existe otra cosa: una sala mayoritariamente femenina, con música alta, donde cada una está a lo suyo y el único juicio que existe es el de la coreografía que sale o no sale — y cuando no sale, la risa es colectiva.",
      ],
    },
    antesDespues: {
      titulo: "Moverse vigilada vs. moverse en tu espacio",
      antesLabel: "En otros espacios",
      antes: [
        "Notas miradas y ajustas cómo te mueves para no llamar la atención.",
        "El ambiente competitivo convierte el ejercicio en examen.",
        "Vas con la armadura puesta — y así no hay quien disfrute.",
        "Acabas evitando el sitio, y con él, el movimiento.",
      ],
      despuesLabel: "En tu espacio",
      despues: [
        "Grupo mayoritariamente femenino con ese punto de complicidad.",
        "Cada una a lo suyo: el foco está en la coreo, no en los cuerpos.",
        "Vienes tal cual: ropa cómoda y ganas — sin encajar en ningún molde.",
        "Te mueves a gusto, y por eso vuelves. Así de simple.",
      ],
    },
    clase: {
      slug: "heels",
      nombre: "Heels",
      titulo: "Heels: la clase más libre de la escuela",
      descripcion:
        "Heels reúne un grupo mayoritariamente femenino con una premisa clara: no hay un molde — hay un espejo. Cada persona encuentra su versión del estilo, del detalle suave al golpe de actitud, con tacones o sin ellos. Un espacio para ocupar tu sitio sin pedir permiso y sin que nadie te mida.",
      porQue: [
        {
          title: "Complicidad de grupo",
          text: "Grupo mayoritariamente femenino, ambiente de apoyo: la energía es de equipo, no de competición.",
        },
        {
          title: "Tu versión del estilo",
          text: "No hay molde único: cada persona adapta el estilo a su cuerpo y su punto de partida.",
        },
        {
          title: "Expresión sin permiso",
          text: "Es la clase más libre de la escuela: presencia, actitud y cero justificaciones.",
        },
      ],
      cta: "Probar Heels",
    },
    dolorSolucion: [
      {
        dolor: "Te echa para atrás la idea de un ambiente competitivo o con miradas encima.",
        solucion: "El grupo está centrado en aprender y disfrutar, no en compararse ni competir por quién lo hace mejor.",
      },
      {
        dolor: "En otros espacios de deporte sientes que te evalúan físicamente.",
        solucion: "Aquí el foco está en el movimiento y en la música, no en cómo te ves mientras entrenas.",
      },
      {
        dolor: "Buscas un ambiente predominantemente femenino donde sentirte cómoda.",
        solucion: "Disciplinas como heels o lady style reúnen un grupo mayoritariamente femenino, con ese punto de complicidad.",
      },
    ],
    objecion: {
      pregunta: "\"¿Es un ambiente de postureo o se puede venir tal cual?\"",
      respuesta: "Se viene tal cual: con ropa cómoda y ganas de moverte, sin necesidad de encajar en nada.",
    },
    pruebaSocial: "El grupo es mayoritariamente femenino y el ambiente está lejos de cualquier competición.",
    faqExtra: [
      {
        q: "¿Es un ambiente solo de mujeres?",
        a: "El grupo de heels y lady style es mayoritariamente femenino, aunque la clase está abierta a cualquiera que quiera apuntarse.",
      },
    ],
    cierreEmocional: "Aquí nadie te mide. Se viene a bailar, no a competir. Ven a comprobarlo.",
    metaTitle: "Espacio femenino sin juicios — Heels, Vilanova",
    metaDescription:
      "Un grupo mayoritariamente femenino, sin miradas ni competición: te mueves a tu manera y a tu ritmo. Prueba una clase de Heels en Vilanova.",
  },

  "cardio-divertido": {
    icp: "expresion",
    dolor: "cardio-divertido",
    headline: "Cardio y tono que sí vas a mantener.",
    subhead:
      "Porque no se siente como entrenar: es una hora de música, coreografía y grupo que te deja con ganas de volver la semana siguiente.",
    ctaHero: "Quiero un cardio que enganche",
    mensajeWhatsapp: "¡Hola! Quiero hacer cardio y ponerme en forma pero necesito que sea divertido, ¿cómo son vuestras clases? 💃",
    agitacion: {
      kicker: "La verdad sobre la constancia",
      parrafos: [
        "Todos los planes de ejercicio funcionan sobre el papel. Correr funciona. El HIIT funciona. Las pesas funcionan. Solo tienen un fallo: hay que seguir yendo. Y ahí es donde se caen todos los planes que has probado.",
        "La industria del fitness te ha vendido que el problema es tu disciplina. Mentira: nadie sostiene años algo que detesta. La variable que decide si entrenas dentro de un año no es tu fuerza de voluntad — es si disfrutas la sesión de hoy.",
        "Por eso el mejor cardio no es el que más quema por hora: es el que sigues haciendo en marzo, en junio y el año que viene. El que se disfraza tan bien de fiesta que se te olvida que era ejercicio.",
      ],
    },
    antesDespues: {
      titulo: "El plan que abandonas vs. el que se queda",
      antesLabel: "Tus planes anteriores",
      antes: [
        "Arranques de motivación que mueren en semanas.",
        "Ejercicio como castigo: sufrir hoy para verse bien algún día.",
        "Aburrimiento garantizado: mismas series, misma cinta, mismo techo.",
        "El resultado nunca llega porque la constancia nunca llega.",
      ],
      despuesLabel: "El plan que engancha",
      despues: [
        "Vienes por la clase, no por el deber: la diversión sostiene el hábito.",
        "Una coreografía nueva cada vez: imposible aburrirse dos semanas seguidas.",
        "Cardio completo de verdad — piernas, core, resistencia — sin notarlo.",
        "El tono llega como efecto secundario de pasarlo bien. El orden correcto.",
      ],
    },
    clase: {
      slug: "reggaeton",
      nombre: "Reggaeton",
      titulo: "Reggaeton: cardio disfrazado de fiesta",
      descripcion:
        "Una clase entera de reggaeton es un entrenamiento completo: piernas, core y resistencia con la mejor banda sonora posible. Técnica de cadera, disociación y coreografías sobre los temas del momento — la clase donde más se ríe de toda la escuela, y de la que sales sudando sin haber mirado el reloj.",
      porQue: [
        {
          title: "Entrenamiento completo real",
          text: "Piernas, core y resistencia en cada sesión: el mejor cardio de la semana, medido en sudor.",
        },
        {
          title: "Imposible aburrirse",
          text: "Coreografías sobre los temas del momento: cada clase es distinta y la playlist hace de motivación.",
        },
        {
          title: "Cero requisitos",
          text: "Sin pareja, sin experiencia, sin edad \"correcta\". Ropa cómoda y ganas de soltarte.",
        },
      ],
      cta: "Probar reggaeton",
    },
    dolorSolucion: [
      {
        dolor: "Necesitas cardio y tono, pero si es aburrido lo dejas a las pocas semanas.",
        solucion: "Aquí el cardio viene disfrazado de coreografía: te mueves una hora entera sin pensar que estás entrenando.",
      },
      {
        dolor: "Te cuesta mantener cualquier rutina de ejercicio si no te engancha.",
        solucion: "Lo que te hace volver no es la disciplina, es que la clase te gusta: eso es lo que sostiene el hábito.",
      },
      {
        dolor: "Buscas resultados físicos, pero no a costa de pasarlo mal cada sesión.",
        solucion: "El tono y la resistencia llegan como efecto de bailar, no como un objetivo que hay que sufrir.",
      },
    ],
    objecion: {
      pregunta: "\"¿Esto realmente pone en forma o es solo diversión?\"",
      respuesta: "Las dos cosas: una hora de clase mueve el cuerpo entero y deja el mismo cansancio que una sesión de cardio.",
    },
    pruebaSocial: "La gente repite semana tras semana precisamente porque no se siente como \"hacer deporte\".",
    faqExtra: [
      {
        q: "¿Cuánto se suda en una clase?",
        a: "Depende de la disciplina, pero reggaeton, heels y lady style dejan un buen cardio; ven con ropa cómoda.",
      },
    ],
    cierreEmocional: "El mejor entrenamiento es el que no abandonas. Este no se abandona: engancha.",
    metaTitle: "Cardio que sí mantienes — Reggaeton en Vilanova",
    metaDescription:
      "Cardio completo disfrazado de fiesta: una hora de música, coreografía y grupo que te deja con ganas de volver. Reggaeton en Vilanova.",
  },
};
