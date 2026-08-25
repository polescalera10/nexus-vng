/**
 * Contenido editorial de cada disciplina — /clases/[modalidad].
 *
 * Los datos "vivos" (nombre, descripción corta, orden, activo) salen de la
 * tabla `modalidades` de Supabase (con fallback en content/landing.ts).
 * Este archivo aporta el contenido largo de cada página: qué es, qué se
 * aprende, cómo es una clase, qué te llevas y para quién es.
 *
 * Si mañana se añade una disciplina nueva en la BD sin entrada aquí, la
 * página se renderiza igualmente con el layout genérico (sin secciones ricas).
 *
 * `estilos` conecta cada página con el cartel real (`horario-regular.ts`): son
 * los nombres de estilo SIN el número de nivel ("Salsa 1" → "Salsa"), que es
 * como los agrupa `disciplinasRegulares`. De ahí salen el horario visible de la
 * página y el `hasCourseInstance` del schema — nunca se escriben días ni horas
 * a mano.
 *
 * Regla de honestidad: nada de datos inventados (profesores, años de
 * experiencia, número de alumnos, reseñas ni resultados garantizados). Solo se
 * describe la disciplina y cómo es la experiencia de clase.
 */

export type ModalidadContenido = {
  /** Intro de cabecera de la página (sustituye a la descripción corta). */
  lead: string;
  /** Título de la primera sección, con el artículo correcto ("¿Qué es el reparto?"). */
  queEsTitle: string;
  /** "¿Qué es?" — párrafos descriptivos. */
  queEs: string[];
  /** "En clase aprenderás" — lista de contenidos. */
  aprenderas: string[];
  /** "Cómo es una clase" — párrafos sobre la dinámica real de la sesión. */
  comoEsLaClase: string[];
  /** "Qué te llevas" — beneficios con título y texto. */
  beneficios: { title: string; text: string }[];
  /** Cierre persuasivo: para quién es y por qué apuntarse. */
  paraTi: string;
  /**
   * Estilos del cartel semanal que pertenecen a esta disciplina, sin número de
   * nivel. Vacío = la disciplina no está en el horario regular (no se pinta la
   * sección de horario).
   */
  estilos: string[];
  /** Enlaces cruzados al final de la página: 2–3 disciplinas y por qué. */
  relacionadas: { slug: string; text: string }[];
};

export const modalidadesContenido: Record<string, ModalidadContenido> = {
  "salsa-cubana": {
    lead:
      "El baile social por excelencia: son, sabor y rueda de casino. La salsa cubana no se estudia, se vive en grupo — y engancha desde la primera clase.",
    queEsTitle: "¿Qué es la salsa cubana?",
    queEs: [
      "La salsa cubana (o casino) nace en La Habana y se baila en pareja, con un estilo circular, juguetón y muy musical. A diferencia de otros estilos de salsa más lineales, aquí todo fluye alrededor de tu pareja: giros, cambios de dirección y mucha conversación entre los dos cuerpos.",
      "Su formato más famoso es la rueda de casino: varias parejas bailan en círculo, un cantante va marcando las figuras en voz alta y todo el mundo cambia de pareja al ritmo de la música. Es pura energía colectiva — imposible salir de una rueda sin sonreír, aunque te equivoques la mitad de las veces.",
      "Debajo hay una música enorme: son, timba y todo lo que suena en Cuba desde hace un siglo. Aprender casino es también aprender a escucharla — dónde está la clave, cuándo entra el coro, cuándo el tema pide calma o pide fuego. Y funciona igual en Vilanova que en Barcelona o en La Habana: con la base, entras en cualquier pista del mundo.",
    ],
    aprenderas: [
      "El paso básico, el peso del cuerpo y la guía en pareja desde cero, sin necesidad de experiencia previa ni de venir acompañado.",
      "Las figuras clásicas del casino: dile que no, enchufla, setenta, vacílala y sus variantes, encadenadas con sentido.",
      "Rueda de casino: bailar en grupo, escuchar al cantante y cambiar de pareja con soltura y sin colisiones.",
      "Técnica de giros y de manos: preparar el giro, marcar sin tirar del brazo y seguir sin adivinar.",
      "Musicalidad: entender la clave, el son y la timba para bailar con la música y no encima de ella.",
      "Recursos de improvisación para defenderte en cualquier fiesta, con cualquier pareja y a cualquier velocidad.",
    ],
    comoEsLaClase: [
      "Cada sesión dura una hora y sigue la misma estructura: calentamiento y paso básico, un bloque de técnica individual (peso, giro, brazos) y después la figura del día, desmontada por partes y montada de nuevo con música.",
      "Se rota de pareja toda la clase. Es la norma que hace posible venir solo: nadie se queda fuera y aprendes a guiar o a seguir a personas distintas, que es lo que pasa en una fiesta.",
      "Los grupos van por nivel: 0 para quien no ha bailado nunca, 1 iniciación y 2 intermedio. Si no sabes dónde encajas, te ubicamos nosotros. Solo necesitas ropa cómoda y un calzado que gire bien sobre el suelo de la sala.",
    ],
    beneficios: [
      {
        title: "Vida social real",
        text: "Es el baile más social que existe: rotas de pareja en cada clase, conoces a todo el grupo y las fiestas se convierten en tu plan de finde.",
      },
      {
        title: "Coordinación y memoria",
        text: "Guiar o seguir figuras trabaja la coordinación, el oído musical y la memoria — un entrenamiento completo que no parece entrenamiento.",
      },
      {
        title: "Confianza que se nota",
        text: "Sacar a alguien a bailar (o dejarte llevar) delante de gente cambia cómo te plantas en cualquier situación, dentro y fuera de la pista.",
      },
      {
        title: "Una hora de desconexión",
        text: "Mientras cuentas el tiempo y escuchas el coro no piensas en nada más. Sales sudando y con la cabeza despejada entre semana.",
      },
    ],
    paraTi:
      "Si quieres un baile alegre, de grupo, con el que salir a cualquier pista del mundo y encontrar gente con quien bailar, la salsa cubana es tu puerta de entrada. No necesitas pareja, ni ritmo previo, ni una forma física concreta: solo ganas y una hora a la semana. Ven a probar una clase y decide después.",
    estilos: ["Salsa"],
    relacionadas: [
      {
        slug: "bachata",
        text: "El otro pilar del baile social: mismo ambiente, misma gente y un básico que se aprende en un par de clases. Casi todo el mundo acaba haciendo las dos.",
      },
      {
        slug: "lady-style-salsa",
        text: "Si quieres que tus giros, tus brazos y tu postura se vean como en tu cabeza, la técnica individual es el atajo. Se nota directamente en la rueda.",
      },
      {
        slug: "reparto",
        text: "La otra Cuba, la urbana y actual. Comparte raíz musical con la timba y suelta el cuerpo para todo lo demás.",
      },
    ],
  },

  bachata: {
    lead:
      "Conexión, musicalidad y cero prisa. La bachata es el baile de pareja que engancha desde el primer día — y el que más suena en todas las fiestas.",
    queEsTitle: "¿Qué es la bachata?",
    queEs: [
      "La bachata nace en República Dominicana y hoy es el baile social más bailado en España. Se baila en pareja, con un básico sencillo de aprender y un techo altísimo: de los primeros pasos a los estilos más modernos hay todo un mundo de musicalidad, ondas y juego.",
      "Trabajamos desde la base dominicana hasta los recursos de la bachata moderna y sensual: conexión con la pareja, interpretación de la música y ese punto de elegancia que hace que dos personas parezcan una sola sobre la pista. No hay una única bachata correcta — hay una base común y muchas formas de vestirla.",
      "Su gran ventaja es el ritmo: cuatro tiempos, un golpe de cadera al cuarto y una música que casi siempre va a una velocidad amable. Por eso es el baile con el que más gente descubre que sí sabe bailar. A partir de ahí, lo que separa a quien lleva un mes de quien lleva un año no son más figuras: es la calidad de la conexión y la escucha.",
    ],
    aprenderas: [
      "El paso básico, el peso y la conexión en pareja desde el primer día, vengas solo o acompañado.",
      "Figuras y giros con una guía clara y cómoda para los dos, sin tirones ni fuerza.",
      "Musicalidad: interpretar la guitarra, el bongó, la güira y las pausas de cada canción.",
      "Ondas, aislamientos y movimiento de cadera para no bailar en modo automático.",
      "Recursos de bachata moderna y sensual, con criterio sobre cuándo tienen sentido y cuándo sobran.",
      "Adaptarte a cualquier pareja y a cualquier nivel en una fiesta: la habilidad más útil de todas.",
    ],
    comoEsLaClase: [
      "La clase dura una hora y arranca siempre con básico y calentamiento sobre la música del día. Después viene un bloque de técnica —peso, cadera, brazos, o el detalle que toque— y por último la combinación de la sesión, explicada por partes, primero sin música y luego con ella hasta que sale sola.",
      "Se rota de pareja constantemente, así que no hace falta venir con nadie. Rotar es incómodo el primer día y liberador a partir del segundo: es lo que te enseña a guiar y a seguir de verdad.",
      "Hay grupos de nivel 0 (desde cero absoluto), 1 (iniciación) y 2 (intermedio), más una clase de estilo femenino aplicado a la bachata. Si dudas de tu nivel, escríbenos y te colocamos en el grupo donde vas a disfrutar más, no en el que suene mejor.",
    ],
    beneficios: [
      {
        title: "Resultados rápidos",
        text: "El básico se aprende en pocas clases: en poco tiempo ya puedes salir a bailar de verdad. Pocas cosas motivan tanto como progresar rápido y notarlo el mismo mes.",
      },
      {
        title: "Conexión de verdad",
        text: "La bachata enseña a escuchar al otro sin hablar: propuesta, respuesta y confianza. Una habilidad que se queda contigo bastante más allá de la pista.",
      },
      {
        title: "El baile más demandado",
        text: "Suena en todas las fiestas, bodas y sociales, y en el Garraf hay bachata casi cada semana. Saberla es la llave que abre cualquier pista.",
      },
      {
        title: "Cuerpo y postura",
        text: "Trabajar cadera, aislamientos y colocación una hora a la semana cambia cómo te mueves. No es un gimnasio, pero el cuerpo se entera.",
      },
    ],
    paraTi:
      "Si buscas un baile de pareja elegante, cercano y con progresión rápida — o si la salsa te impone y quieres empezar por algo más pausado — la bachata es el punto de partida perfecto. Funciona igual si vienes solo, con tu pareja o con un amigo. Ven a probar una clase: viene siendo la favorita de los que dicen «yo no sé bailar».",
    estilos: ["Bachata"],
    relacionadas: [
      {
        slug: "salsa-cubana",
        text: "El complemento natural: mismo ambiente social, energía más alta y rueda de casino. En las fiestas suenan las dos, así que compensa tenerlas.",
      },
      {
        slug: "lady-style-bachata",
        text: "Técnica y estilo individual para que tus brazos, tus ondas y tu postura acompañen. Es lo que hace que la misma figura se vea el doble de bien.",
      },
      {
        slug: "reggaeton",
        text: "Si te cuesta soltar la cadera, una hora de urbano a la semana desbloquea el movimiento y se nota directo en tu bachata.",
      },
    ],
  },

  reparto: {
    lead:
      "El sonido de las calles de La Habana. El reparto es el género urbano cubano del momento: actitud, flow y un estilo que no se parece a nada.",
    queEsTitle: "¿Qué es el reparto?",
    queEs: [
      "El reparto es el género urbano que domina Cuba hoy: nace en los barrios (los «repartos») de La Habana, hereda del reggaetón cubano y de la timba, y tiene un lenguaje corporal propio — pasos marcados, disociación, actitud y mucha improvisación.",
      "Se baila individual, sin pareja, y es pura expresión: cada canción tiene sus pasos, sus gestos y su código. En clase desmontamos ese lenguaje paso a paso para que lo hagas tuyo, aunque nunca hayas bailado nada urbano y aunque creas que no tienes el cuerpo suelto.",
      "Musicalmente es un género rápido, sincopado y muy reconocible: bases electrónicas, percusión cubana y letras de barrio. Bailarlo bien no consiste en ir rápido, sino en entender dónde están los acentos y qué se hace con el cuerpo en cada uno — por eso se trabaja tanto el detalle antes que la velocidad.",
      "Es, además, un estilo vivo: los pasos cambian cada temporada al ritmo de lo que sale en Cuba. Aquí se enseña lo que se está bailando ahora, no una versión congelada de hace cinco años.",
    ],
    aprenderas: [
      "Los pasos y códigos del reparto actual, explicados desde cero y a la velocidad que haga falta.",
      "Disociación corporal: mover pecho, cadera, hombros y brazos de forma independiente.",
      "Flow y actitud: bailar suelto, con intención, sin parecer una coreografía de academia.",
      "Musicalidad urbana: acentos, cortes, silencios y cómo jugar con ellos en vez de ignorarlos.",
      "Control del peso y del suelo, que es de donde sale la potencia de cada paso.",
      "Improvisación: recursos para defenderte con cualquier tema, no solo con el de clase.",
    ],
    comoEsLaClase: [
      "Una hora de trabajo físico y de detalle. Se empieza con calentamiento y movilidad —cuello, hombros, columna y cadera— porque el reparto pide un cuerpo despierto, y se sigue con bloques de disociación y pasos base repetidos hasta que dejan de costar.",
      "La segunda mitad es la parte divertida: se encadenan pasos sobre los temas del momento y se trabaja el flow, que es lo que separa a quien ejecuta de quien baila. Se practica en filas y frente al espejo, cada uno a su ritmo y sin exponerse más de lo que quiera.",
      "No se necesita pareja, ni experiencia previa, ni una condición física especial: se necesita ropa cómoda, zapatillas y aguantar la vergüenza los diez primeros minutos del primer día. Después ya no la recuerdas.",
    ],
    beneficios: [
      {
        title: "Cardio disfrazado de fiesta",
        text: "Es de las clases más físicas de la escuela: sudas, quemas y entrenas todo el cuerpo sin mirar el reloj ni una vez en toda la hora.",
      },
      {
        title: "Suelta el cuerpo",
        text: "La disociación y la improvisación desbloquean tu forma de moverte. Se nota después en cualquier otro estilo que bailes, empezando por la salsa y la bachata.",
      },
      {
        title: "Un estilo que pocos tienen",
        text: "Fuera de Cuba casi nadie lo enseña con criterio. Dominar reparto te da un sello propio en cualquier pista y en cualquier fiesta.",
      },
      {
        title: "Cero dependencia",
        text: "Se baila solo: no dependes de que venga tu pareja, ni de encontrar con quién. Vienes, bailas y te vas contento.",
      },
    ],
    paraTi:
      "Si te va lo urbano, quieres bailar sin pareja y buscas algo con más calle que una coreografía comercial, el reparto es tu clase. También es la mejor opción si ya bailas salsa o bachata y notas el cuerpo rígido: aquí se desbloquea. No hace falta nivel previo — hace falta actitud, y eso se entrena aquí como todo lo demás.",
    estilos: ["Reparto"],
    relacionadas: [
      {
        slug: "reggaeton",
        text: "La hermana mayor y más conocida: misma familia urbana, temas que ya te sabes y una técnica de cadera que se transfiere entera.",
      },
      {
        slug: "salsa-cubana",
        text: "La otra mitad de Cuba. Comparten raíz musical y ambiente, y bailarlas juntas te da un repertorio completo para cualquier fiesta cubana.",
      },
      {
        slug: "heels",
        text: "Si te gusta la parte escénica y de actitud del urbano, heels lleva ese trabajo a otro terreno: líneas, potencia y presencia.",
      },
    ],
  },

  reggaeton: {
    lead:
      "La música que ya te sabes, bailada con técnica y actitud. Reggaeton es la clase donde sudar, soltarte y pasarlo en grande — sin pareja y sin complejos.",
    queEsTitle: "¿Qué es el reggaeton?",
    queEs: [
      "Todos hemos bailado reggaeton en una fiesta. La diferencia entre «moverse» y bailar de verdad está en la técnica: control de cadera, disociación, actitud y saber qué hacer con cada parte del cuerpo en cada acento de la música.",
      "En clase trabajamos coreografías y pasos base sobre los temas del momento, con progresión real: primero el movimiento, luego el estilo, y al final ese punto de seguridad que hace que cualquier paso se vea bien. No se trata de imitar un vídeo, sino de entender el porqué de cada movimiento.",
      "El reggaeton tiene una base rítmica muy marcada —el dembow— que se repite toda la canción. Aprender a jugar con ella, a llegar tarde a propósito, a parar y a acentuar, es lo que hace que dos personas bailando el mismo paso se vean completamente distintas.",
      "Y es una clase abierta: aquí se baila reggaeton sin etiquetas, cada uno con su estilo y su nivel de intensidad. El objetivo no es que todos os veáis iguales, es que cada uno salga bailando mejor de lo que entró.",
    ],
    aprenderas: [
      "Pasos base del reggaeton y cómo encadenarlos con naturalidad, sin quedarte en blanco a la tercera canción.",
      "Técnica de cadera y de perreo con control, cuidando rodillas y lumbares.",
      "Disociación: que cada parte del cuerpo vaya a lo suyo cuando toca.",
      "Coreografías completas sobre los temas que suenan ahora mismo.",
      "Trabajo de niveles y de suelo, adaptado a lo que tu cuerpo permita hoy.",
      "Actitud escénica: bailar para ti, no para aprobar un examen.",
    ],
    comoEsLaClase: [
      "Una hora que empieza con calentamiento y movilidad de verdad —cadera, columna y hombros— porque casi todo lo que viene después sale de ahí. Luego se trabajan pasos base y ejercicios de técnica, en filas, con espejo y a la velocidad que necesite el grupo.",
      "La segunda parte se dedica a la coreografía del tema de la semana: se monta por bloques, se repite y se acaba bailando entera con música. No hay examen ni exhibición obligatoria; si un día te apetece solo mirar y marcar, también vale.",
      "Se baila sin pareja, con zapatillas y ropa cómoda. Vienen personas que no habían pisado una clase de baile nunca y personas que llevan años: cada uno se lleva la versión del paso que su cuerpo puede hacer hoy, y eso cambia bastante rápido.",
    ],
    beneficios: [
      {
        title: "El mejor cardio de la semana",
        text: "Una clase entera de reggaeton es un entrenamiento completo: piernas, core y resistencia — con la mejor banda sonora posible y sin contar repeticiones.",
      },
      {
        title: "Confianza inmediata",
        text: "Es el estilo con la recompensa más rápida: en cuanto dominas dos o tres pasos, la próxima fiesta es otra historia y se nota desde fuera.",
      },
      {
        title: "Cero requisitos",
        text: "Sin pareja, sin experiencia, sin edad «correcta» y sin nivel mínimo. Solo ropa cómoda y ganas de soltarte una hora.",
      },
      {
        title: "Desahogo garantizado",
        text: "Hay semanas que no necesitas una clase técnica: necesitas gritar la letra y sudar. Esta es esa clase.",
      },
    ],
    paraTi:
      "Si quieres una clase para desconectar, sudar y salir con una sonrisa — y de paso dejar de bailar siempre los mismos dos pasos en las fiestas — apúntate a reggaeton. Va igual de bien como única clase de la semana que como complemento físico si ya bailas en pareja. Es la clase donde más se ríe de toda la escuela, y eso también cuenta.",
    estilos: ["Reggaetón"],
    relacionadas: [
      {
        slug: "reparto",
        text: "El paso siguiente dentro del urbano: raíz cubana, más disociación y un lenguaje que casi nadie enseña por aquí.",
      },
      {
        slug: "heels",
        text: "Misma actitud, otro terreno: técnica de danza, líneas y presencia escénica, con tacones o sin ellos.",
      },
      {
        slug: "bachata",
        text: "Si además quieres bailar en pareja en cualquier fiesta, la bachata es la puerta más rápida — y la cadera ya la traes trabajada.",
      },
    ],
  },

  "lady-style-salsa": {
    lead:
      "Técnica, presencia y estilo propio aplicados a la salsa cubana. Lady Style Salsa es la clase para trabajar tu forma de bailar: brazos, cadera, giros y seguridad que se ve desde lejos.",
    queEsTitle: "¿Qué es Lady Style Salsa?",
    queEs: [
      "Lady Style Salsa es una clase de técnica y estilo individual: se trabaja sin pareja, frente al espejo, puliendo todo lo que hace que un baile se vea bonito — la postura, las líneas de brazos, el movimiento de cadera, los giros y la actitud.",
      "El vocabulario es el de la salsa cubana: el mismo peso, los mismos tiempos y los mismos remates que después te encuentras en la rueda. Por eso lo que entrenas aquí se traslada directo al baile social — es la clase que hace que tu salsa suba de nivel.",
      "En el baile en pareja hay una parte que el guía no puede darte: cómo colocas el brazo libre, cómo terminas un giro, qué haces con la mirada, cómo ocupas el espacio. Esa parte es tuya y solo se entrena por separado, con tiempo y con espejo.",
      "Si lo tuyo es la bachata, la clase hermana es Lady Style Bachata: mismos principios de técnica, otro vocabulario y otra música. Se pueden hacer las dos.",
    ],
    aprenderas: [
      "Postura y líneas: cómo colocarte para que cada movimiento se vea limpio desde fuera.",
      "Técnica de brazos y manos aplicada a los giros y remates de la salsa cubana.",
      "Movimiento de cadera y peso al estilo cubano, con control y sin forzar la espalda.",
      "Técnica de giros: preparación, spot, eje y salida — para dejar de marearte y empezar a rematar.",
      "Musicalidad de la timba: dónde marcar, dónde parar y dónde soltarte.",
      "Presencia y actitud: bailar ocupando tu espacio, sin pedir permiso.",
    ],
    comoEsLaClase: [
      "Una hora muy de técnica, en formato clase de danza: calentamiento y movilidad, ejercicios de postura y brazos, trabajo de cadera y una batería de giros con progresión. Todo frente al espejo, que es la herramienta principal — verte es la mitad del aprendizaje.",
      "La parte final es la más agradecida: se monta una secuencia corta con un tema de salsa donde se aplica todo lo trabajado. No es una coreografía de exhibición, es un laboratorio para probar el estilo hasta que deja de parecer prestado.",
      "No hace falta pareja ni haber bailado antes, aunque la clase rinde el doble si además haces salsa cubana: lo que aquí pules, allí se ve al instante. Ropa cómoda que te deje ver las líneas del cuerpo y calzado con el que estés a gusto girando.",
    ],
    beneficios: [
      {
        title: "Multiplica tu salsa",
        text: "Cada hora de técnica se nota después en la rueda: tu baile cambia de categoría cuando el estilo lo pones tú y no la figura.",
      },
      {
        title: "Postura y control corporal",
        text: "Trabajas core, equilibrio y conciencia corporal de forma constante. Caminas distinto al salir de clase — literalmente.",
      },
      {
        title: "Seguridad que se queda",
        text: "Mirarte al espejo y gustarte bailando hace más por la autoestima que muchos discursos. Aquí se entrena eso, semana a semana.",
      },
      {
        title: "Ritmo propio",
        text: "Al no depender de una pareja, avanzas a tu velocidad. Es la clase donde cada persona compite consigo misma y con nadie más.",
      },
    ],
    paraTi:
      "Si ya bailas salsa y quieres pulir tu estilo, o si prefieres empezar trabajando tu propio movimiento antes de lanzarte al baile social, Lady Style Salsa es tu clase. También encaja si vuelves después de años parada y quieres reconciliarte con tu cuerpo sin la presión de una pista llena. Ven como eres: la elegancia no se trae de casa, se entrena.",
    estilos: ["Lady Salsa"],
    relacionadas: [
      {
        slug: "salsa-cubana",
        text: "El destino directo de todo lo que aquí trabajas: giros, rueda y baile social en grupo.",
      },
      {
        slug: "lady-style-bachata",
        text: "La clase hermana. Mismos principios de técnica, vocabulario de bachata: ondas, cadera lenta y musicalidad.",
      },
      {
        slug: "cia-salsa",
        text: "Si el gusanillo se convierte en ganas de escenario, la compañía de salsa es el siguiente paso.",
      },
    ],
  },

  "lady-style-bachata": {
    lead:
      "El lenguaje corporal de la bachata, entrenado en solitario. Ondas, cadera, brazos y musicalidad para que tu bachata se vea como suena.",
    queEsTitle: "¿Qué es Lady Style Bachata?",
    queEs: [
      "Lady Style Bachata es la clase de técnica y estilo individual aplicada a la bachata: se trabaja sin pareja, frente al espejo, puliendo la postura, las líneas de brazos, las ondas de cuerpo, los giros y la actitud.",
      "La bachata moderna pide un lenguaje corporal muy concreto — ondas continuas, disociación de cadera y torso, control de la lentitud — que en la clase de pareja casi nunca hay tiempo de trabajar a fondo. Aquí sí.",
      "Todo lo que entrenas se traslada directo a la pista: la misma figura, con las ondas y los remates puestos, se ve el doble de bien. Y funciona también sola, como espacio para ganar soltura y confianza con tu propio cuerpo.",
      "Si lo tuyo es la salsa, la clase hermana es Lady Style Salsa: misma técnica de base, otro vocabulario y otra música.",
    ],
    aprenderas: [
      "Ondas de cuerpo y disociación cadera–torso, el sello de la bachata moderna.",
      "Técnica de brazos y manos para los remates y las salidas de giro.",
      "Control de la lentitud: mover despacio es más difícil que mover rápido, y se entrena.",
      "Técnica de giros con eje y spot, adaptada a los tiempos de la bachata.",
      "Musicalidad: dónde está el golpe de la güira y cómo aprovecharlo.",
      "Presencia y actitud: bailar ocupando tu espacio, sin pedir permiso.",
    ],
    comoEsLaClase: [
      "Calentamiento y movilidad de columna, que es la articulación protagonista, y después bloques de técnica: postura, brazos, ondas y aislamientos. Todo frente al espejo y con mucha corrección individual.",
      "En la última parte se monta una secuencia corta sobre un tema de bachata para aplicar lo trabajado con música real, que es cuando la técnica deja de ser un ejercicio y se convierte en baile.",
      "No hace falta pareja ni experiencia previa. Rinde el doble si además haces bachata en pareja: lo que aquí pules, allí se nota al instante. Ropa cómoda y calzado con el que estés a gusto girando.",
    ],
    beneficios: [
      {
        title: "Multiplica tu bachata",
        text: "La misma figura con ondas y remates puestos se ve el doble de bien. Es la diferencia entre ejecutar y bailar.",
      },
      {
        title: "Movilidad de columna",
        text: "Trabajar ondas y aislamientos semana a semana es de lo mejor que puedes hacer por una espalda que pasa el día sentada.",
      },
      {
        title: "Seguridad que se queda",
        text: "Verte bailar bien en el espejo cambia cómo te mueves fuera de la sala. No es una frase: pasa.",
      },
      {
        title: "Ritmo propio",
        text: "Sin pareja no hay que esperar a nadie: avanzas a tu velocidad y en tu propio proceso.",
      },
    ],
    paraTi:
      "Si ya bailas bachata y quieres que tu estilo acompañe a tu técnica, o si prefieres empezar por ti antes de lanzarte a la pista, esta es tu clase. También si vuelves después de tiempo parada y quieres recuperar la relación con tu cuerpo sin prisa. Ven como eres: aquí se entrena, no se posa.",
    estilos: ["Bachata Lady"],
    relacionadas: [
      {
        slug: "bachata",
        text: "El destino directo de todo lo que aquí trabajas: la pista, con pareja y con música de verdad.",
      },
      {
        slug: "lady-style-salsa",
        text: "La clase hermana. Misma técnica de base con el vocabulario y los tiempos de la salsa cubana.",
      },
      {
        slug: "cia-bachata-lady",
        text: "Si te engancha el trabajo coreográfico, la compañía de bachata lady lo lleva al escenario.",
      },
    ],
  },

  heels: {
    lead:
      "Potencia, líneas y mucha actitud — sobre tacones o sin ellos. Heels es la clase donde la elegancia y la fuerza dejan de ser opuestos.",
    queEsTitle: "¿Qué es Heels?",
    queEs: [
      "Heels es un estilo de danza urbana que se baila (cuando quieras) sobre tacones: combina técnica de danza, trabajo de líneas, coreografía y una actitud escénica potente. Nació en los estudios de Los Ángeles y hoy llena clases en todo el mundo.",
      "No hace falta empezar con tacones: la técnica se construye primero descalza o con zapatillas, y los tacones llegan cuando tú estés lista. Lo importante no es el zapato — es la seguridad con la que lo pisas.",
      "Es una clase coreográfica: cada tema tiene su secuencia, con sus cambios de nivel, sus pausas y sus momentos de mirar al frente. Se trabaja el detalle, la calidad del movimiento y la intención, que es lo que convierte una serie de pasos en una interpretación.",
      "Y es, sin exagerar, de lo más exigente que se hace en la escuela: equilibrio, fuerza de piernas y control del centro durante una hora. Por eso engancha tanto — la recompensa es proporcional.",
    ],
    aprenderas: [
      "Técnica base sobre tacones: equilibrio, pisada segura, transiciones y cómo proteger tobillos y rodillas.",
      "Líneas y extensiones para sacar el máximo partido a cada movimiento.",
      "Coreografías con carácter, del detalle suave al golpe de actitud.",
      "Trabajo de suelo y cambios de nivel, adaptados a tu punto de partida.",
      "Control del centro y de la mirada: dos cosas que cambian por completo cómo se ve un baile.",
      "Presencia escénica: sostener una mirada, un silencio y un escenario.",
    ],
    comoEsLaClase: [
      "Se empieza con un calentamiento serio: movilidad de tobillos, activación de piernas y core, y trabajo de postura. En heels el calentamiento no es un trámite — es lo que permite bailar una hora sobre un tacón sin pagarlo al día siguiente.",
      "Después llegan los ejercicios de técnica cruzando la sala (caminatas, giros, cambios de peso) y por último la coreografía del tema, montada por bloques y repetida hasta que sale con música. Cada bloque tiene su versión más suave y su versión más exigente: eliges la tuya.",
      "Puedes venir con zapatillas todas las clases que quieras. Cuando decidas subirte al tacón, empieza por uno ancho y estable; ya te diremos qué mirar. No hay nivel mínimo ni cuerpo «adecuado» para esta clase.",
    ],
    beneficios: [
      {
        title: "Fuerza y equilibrio reales",
        text: "Bailar sobre tacones entrena piernas, core y estabilidad como pocas disciplinas. La elegancia, por debajo, es pura fuerza.",
      },
      {
        title: "Empoderamiento sin postureo",
        text: "Heels es un espacio para ocupar el escenario sin pedir perdón. La actitud que se entrena aquí se viene contigo a la calle.",
      },
      {
        title: "Expresión sin límites",
        text: "Es la clase más libre de la escuela: cada persona encuentra su versión del estilo. No hay un molde — hay un espejo.",
      },
      {
        title: "Coreografía de verdad",
        text: "Aprender secuencias completas entrena memoria, musicalidad y precisión. Salir bailando un tema entero es una sensación difícil de explicar.",
      },
    ],
    paraTi:
      "Si buscas una clase que combine técnica de danza, actitud y un chute de confianza — y te apetece un reto diferente a todo lo demás — Heels te está esperando. Funciona tanto si vienes del urbano como si no has bailado nunca y quieres empezar por algo que te obligue a mirarte de frente. Con tacones o sin ellos: la energía es la misma y la puerta está abierta.",
    estilos: ["Heels"],
    relacionadas: [
      {
        slug: "reggaeton",
        text: "El complemento perfecto: misma familia urbana, más cardio y coreografías sobre los temas del momento.",
      },
      {
        slug: "sexy-style",
        text: "La misma familia urbana con otro registro: control, respiración y sensualidad trabajada con técnica, sin tacón obligatorio.",
      },
      {
        slug: "reparto",
        text: "Si lo que te engancha es la actitud, el reparto es el lenguaje urbano cubano en estado puro: flow, disociación y calle.",
      },
    ],
  },
  "sexy-style": {
    lead:
      "Sensualidad trabajada con técnica: control, respiración y actitud. Sexy Style no va de gustar a nadie — va de moverte como te da la gana y que se note.",
    queEsTitle: "¿Qué es Sexy Style?",
    queEs: [
      "Sexy Style es una clase de danza urbana centrada en la calidad del movimiento: cómo se mueve el cuerpo despacio, cómo se sostiene una pausa y cómo se cambia de nivel sin perder el control. Todo lo contrario a la caricatura: aquí hay técnica y hay trabajo físico.",
      "Se baila descalza o con zapatilla, sin tacón obligatorio, y se trabaja mucho el suelo, las ondas y los aislamientos. La música va del R&B lento al urbano actual, y cada tema tiene su coreografía.",
      "Comparte familia con Heels, pero pone el foco en otro sitio: menos líneas de tacón y más control del peso, la respiración y la intención. Muchas alumnas hacen las dos porque se complementan.",
      "Es también, y esto no es menor, un espacio seguro para trabajar la relación con el propio cuerpo sin que nadie mire por encima del hombro.",
    ],
    aprenderas: [
      "Calidad de movimiento: mover despacio con control, que es lo difícil de verdad.",
      "Ondas, aislamientos y disociación de cadera, torso y hombros.",
      "Trabajo de suelo y cambios de nivel adaptados a tu punto de partida.",
      "Respiración e intención: lo que convierte una secuencia de pasos en una interpretación.",
      "Coreografías completas sobre temas actuales, montadas por bloques.",
      "Presencia: sostener la mirada y el silencio sin salir corriendo.",
    ],
    comoEsLaClase: [
      "Calentamiento largo y consciente — movilidad de columna, cadera y hombros — porque casi todo lo que viene después sale de ahí. A continuación, bloques de técnica cruzando la sala y en el sitio.",
      "La segunda mitad es coreografía: se monta la secuencia del tema por partes, se repite, se limpia y se baila entera con música. Cada bloque tiene versión suave y versión exigente; eliges la tuya.",
      "No hay nivel mínimo ni cuerpo «adecuado». Ropa cómoda, rodilleras si vas a trabajar suelo y ganas de mirarte al espejo sin juzgarte.",
    ],
    beneficios: [
      {
        title: "Control corporal fino",
        text: "Mover despacio exige fuerza isométrica y conciencia. Es entrenamiento real disfrazado de baile.",
      },
      {
        title: "Confianza sin postureo",
        text: "Trabajar la sensualidad como técnica, y no como pose, cambia la relación con el propio cuerpo.",
      },
      {
        title: "Movilidad y espalda",
        text: "Ondas y aislamientos semana a semana son de lo mejor que puedes hacer por una columna que pasa el día sentada.",
      },
      {
        title: "Repertorio propio",
        text: "Sales con coreografías completas que puedes bailar donde quieras. Eso engancha.",
      },
    ],
    paraTi:
      "Si quieres una clase que te saque de la zona conocida sin exponerte, que trabaje el cuerpo de verdad y que te deje con la sensación de haber hecho algo tuyo, Sexy Style encaja. Vengas del urbano o no hayas bailado nunca. Aquí no se compite con nadie.",
    estilos: ["Sexy Style"],
    relacionadas: [
      {
        slug: "heels",
        text: "La hermana con tacón: más líneas, más potencia y el mismo trabajo de actitud escénica.",
      },
      {
        slug: "reggaeton",
        text: "Misma familia urbana, más cardio y coreografías sobre los temas del momento.",
      },
      {
        slug: "lady-style-bachata",
        text: "Si quieres llevar el control del movimiento a la pista social, la técnica de bachata lady es el puente.",
      },
    ],
  },

  "cia-salsa": {
    lead:
      "El grupo de compañía de salsa: montaje coreográfico, ensayo continuo y actuaciones. No es una clase suelta — es un proyecto de temporada.",
    queEsTitle: "¿Qué es la Cía Salsa?",
    queEs: [
      "La compañía de salsa es el grupo que prepara y lleva a escena las coreografías de la escuela: festivales, fiestas, congresos y todo lo que surja durante la temporada.",
      "No funciona como una clase abierta. Se entra por audición o invitación del equipo docente, hay un nivel técnico de partida y se pide compromiso con los ensayos: una coreografía de grupo solo funciona si están todos.",
      "El trabajo es distinto al de una clase regular: se limpia hasta el detalle, se cuentan tiempos, se trabaja la sincronía y se ensaya con formaciones, entradas y salidas. Se aprende muchísimo, pero exige.",
      "Importante y sin letra pequeña: los grupos de compañía quedan FUERA de la tarifa plana y de la plaza de socio fundador. Las condiciones se acuerdan aparte con la escuela.",
    ],
    aprenderas: [
      "Montaje coreográfico completo: bloques, transiciones, entradas y salidas.",
      "Sincronía de grupo y trabajo de formaciones sobre el escenario.",
      "Limpieza técnica al detalle: la misma figura repetida hasta que sale igual en todos.",
      "Musicalidad avanzada: contar, marcar acentos y respetar los silencios.",
      "Presencia escénica y gestión de los nervios de una actuación.",
      "Trabajo en equipo: una compañía es tan buena como su ensayo más flojo.",
    ],
    comoEsLaClase: [
      "El ensayo semanal es largo y muy concreto: se repasa lo montado, se limpia lo que quedó flojo y se añade material nuevo. Hay repeticiones, muchas, porque es la única forma de que veinte cuerpos hagan lo mismo a la vez.",
      "Según se acerca una actuación, el ritmo sube: pases completos, ensayo con vestuario y ajustes de espacio según el escenario real.",
      "Se pide asistencia constante. Faltar a un ensayo no te afecta solo a ti: afecta a la formación entera.",
    ],
    beneficios: [
      {
        title: "Salto técnico real",
        text: "Nada pule tanto como preparar una coreografía para escenario. Vuelves a la pista social con otro nivel.",
      },
      {
        title: "Escenario de verdad",
        text: "Bailar delante de público es una experiencia que no se parece a nada y que se recuerda mucho tiempo.",
      },
      {
        title: "Grupo que se hace equipo",
        text: "Ensayar juntos durante meses crea un vínculo distinto al de la clase semanal.",
      },
      {
        title: "Disciplina que se contagia",
        text: "El método de trabajo de una compañía — repetir, corregir, medir — sirve mucho más allá del baile.",
      },
    ],
    paraTi:
      "Si ya tienes base de salsa cubana, te sobra el gusanillo del escenario y puedes comprometerte con los ensayos de la temporada, este es tu sitio. Escríbenos y te contamos cuándo es la próxima audición y qué condiciones tiene el grupo.",
    estilos: ["Cía Salsa"],
    relacionadas: [
      {
        slug: "salsa-cubana",
        text: "El punto de partida obligatorio: la clase regular donde se construye la base que aquí se pule.",
      },
      {
        slug: "lady-style-salsa",
        text: "La técnica individual que marca la diferencia cuando veinte personas hacen la misma figura.",
      },
      {
        slug: "cia-bachata-lady",
        text: "La otra compañía de la escuela, con formato parecido y vocabulario de bachata lady.",
      },
    ],
  },

  "cia-bachata-lady": {
    lead:
      "El grupo de compañía de bachata lady: montaje coreográfico, ensayo continuo y actuaciones. Un proyecto de temporada, no una clase suelta.",
    queEsTitle: "¿Qué es la Cía Bachata Lady?",
    queEs: [
      "Es el grupo que prepara y lleva a escena las coreografías de bachata lady de la escuela: festivales, fiestas y congresos a lo largo de la temporada.",
      "Se entra por audición o invitación del equipo docente. Hay un nivel técnico de partida — ondas, aislamientos y giros ya resueltos — y se pide compromiso con los ensayos.",
      "El trabajo va del detalle: sincronía, limpieza, formaciones y calidad de movimiento. Una coreografía de bachata lady se sostiene sobre la precisión de las ondas y los remates, y eso solo sale repitiendo.",
      "Como el resto de grupos de compañía, queda FUERA de la tarifa plana y de la plaza de socio fundador. Las condiciones se acuerdan aparte con la escuela.",
    ],
    aprenderas: [
      "Montaje coreográfico completo, con transiciones y formaciones.",
      "Sincronía de grupo aplicada a un vocabulario muy fino: ondas, pausas y remates.",
      "Limpieza técnica al detalle bajo la mirada del espejo y del equipo docente.",
      "Musicalidad avanzada de la bachata moderna.",
      "Presencia escénica y gestión de los nervios de una actuación.",
      "Trabajo en equipo y método de ensayo.",
    ],
    comoEsLaClase: [
      "Ensayo semanal largo: repaso de lo montado, limpieza de lo que quedó flojo y material nuevo. Muchas repeticiones, que es lo que hace que el grupo se vea como un solo cuerpo.",
      "Al acercarse una actuación se hacen pases completos, ensayo con vestuario y ajuste al escenario real.",
      "Se pide asistencia constante: una ausencia rompe la formación de todo el grupo.",
    ],
    beneficios: [
      {
        title: "Salto técnico real",
        text: "Preparar coreografía para escenario pule la técnica como no lo hace ninguna clase semanal.",
      },
      {
        title: "Escenario de verdad",
        text: "Bailar delante de público es una experiencia que no se parece a nada.",
      },
      {
        title: "Grupo que se hace equipo",
        text: "Meses de ensayo juntas crean un vínculo distinto al de la clase regular.",
      },
      {
        title: "Método que se queda",
        text: "Repetir, corregir y medir: la forma de trabajar de una compañía sirve mucho más allá del baile.",
      },
    ],
    paraTi:
      "Si ya tienes base de bachata lady, te tira el escenario y puedes comprometerte con los ensayos de la temporada, escríbenos: te contamos cuándo es la próxima audición y qué condiciones tiene el grupo.",
    estilos: ["Cía Lady Bachata"],
    relacionadas: [
      {
        slug: "lady-style-bachata",
        text: "La clase regular donde se construye la técnica que aquí se lleva al escenario.",
      },
      {
        slug: "bachata",
        text: "La bachata en pareja: el otro lado del mismo baile, y la mejor forma de entender la música.",
      },
      {
        slug: "cia-salsa",
        text: "La otra compañía de la escuela, con formato parecido y vocabulario de salsa cubana.",
      },
    ],
  },
};
