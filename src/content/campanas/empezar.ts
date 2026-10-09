import type { CampanaDolorContent } from "./types";

/**
 * ICP 4 — El principiante bloqueado ("yo no sé bailar").
 * Fuente: analisis-icp-pain-points.md § ICP 4. Barrera de entrada nº1: motor de
 * conversión nº1 junto a "social".
 * Psicología: reencuadre de creencia limitante + reducción de fricción + contraste.
 * Los argumentos de clase salen del contenido real de content/modalidades.ts.
 */
export const empezar: Record<string, CampanaDolorContent> = {
  "dos-pies-izquierdos": {
    icp: "empezar",
    dolor: "dos-pies-izquierdos",
    headline: "\"No tengo ritmo\". El ritmo se entrena.",
    subhead:
      "Nadie nace sabiendo llevar el compás. Se entrena con repetición y una buena guía, como cualquier otra habilidad.",
    ctaHero: "Quiero probarlo aunque no tenga ritmo",
    mensajeWhatsapp: "¡Hola! Creo que tengo dos pies izquierdos pero me gustaría probar una clase 🙂",
    agitacion: {
      kicker: "¿De dónde sacaste esa idea?",
      parrafos: [
        "Piénsalo: ¿cuándo decidiste que no tienes ritmo? Probablemente en una fiesta, hace años, comparándote con alguien que llevaba tiempo bailando. Desde entonces lo repites como si fuera un diagnóstico: \"yo es que no valgo para esto\".",
        "Pero nadie diría \"no valgo para conducir\" por no saber conducir sin haber ido a la autoescuela. El ritmo funciona igual: es una técnica con pasos concretos, no una lotería genética. Se cuenta, se marca, se repite — y un día el cuerpo lo hace solo.",
        "La diferencia entre tú y la gente \"con ritmo\" no es el talento. Es que ellos ya pasaron por las clases que tú todavía no has probado.",
      ],
    },
    antesDespues: {
      titulo: "La misma persona, con y sin técnica",
      antesLabel: "Tú, hasta hoy",
      antes: [
        "Bailas dos canciones por compromiso y te sientas — \"esto no es lo mío\".",
        "Miras a la pista desde la barra, con ganas y con freno a la vez.",
        "Repites \"tengo dos pies izquierdos\" como si fuera incurable.",
        "Cada fiesta confirma la historia que te cuentas.",
      ],
      despuesLabel: "Tú, entrenando el ritmo",
      despues: [
        "Cuentas la música sin darte cuenta — el compás se vuelve automático.",
        "El paso básico te sale solo, y sobre él todo lo demás se construye.",
        "Descubres que \"no tener ritmo\" era solo no haberlo entrenado nunca.",
        "La pista deja de ser territorio enemigo: es donde practicas lo tuyo.",
      ],
    },
    clase: {
      slug: "bachata",
      nombre: "Bachata",
      titulo: "Bachata: la favorita de los que dicen \"yo no sé bailar\"",
      descripcion:
        "No lo decimos por decir — es literal: la bachata viene siendo la favorita de quienes llegan convencidos de que no saben bailar. Su básico es sencillo de aprender, el ritmo es pausado y claro, y la progresión se nota rápido: el antídoto perfecto contra los \"dos pies izquierdos\".",
      porQue: [
        {
          title: "El básico más accesible",
          text: "El paso básico de bachata se aprende en pocas clases: victoria temprana que desmonta la creencia de raíz.",
        },
        {
          title: "Ritmo claro y pausado",
          text: "La bachata marca el compás de forma evidente: el mejor terreno para entrenar el oído desde cero.",
        },
        {
          title: "Progresión que motiva",
          text: "Pocas cosas convencen tanto como progresar rápido — y en bachata el avance se nota clase a clase.",
        },
      ],
      cta: "Probar bachata",
    },
    dolorSolucion: [
      {
        dolor: "Crees que \"tienes dos pies izquierdos\" y que eso no se puede cambiar.",
        solucion: "El ritmo es una técnica, no un don: se entrena paso a paso como cualquier otra cosa.",
      },
      {
        dolor: "Te comparas con quien ya baila bien y das por hecho que tú no puedes.",
        solucion: "Esa persona también empezó sin saber. Los grupos están pensados para partir de cero real.",
      },
      {
        dolor: "Piensas que sin oído musical no hay nada que hacer.",
        solucion: "El oído se afina con la práctica: en pocas clases empiezas a sentir el compás sin pensarlo.",
      },
    ],
    objecion: {
      pregunta: "\"¿Y si de verdad no tengo ritmo, ni entrenándolo?\"",
      respuesta: "Nadie se queda sin aprender por eso: es cuestión de repetición, no de talento.",
    },
    pruebaSocial: "La inmensa mayoría de quienes empiezan aquí lo hacen sin haber bailado nunca.",
    faqExtra: [
      {
        q: "¿De verdad se puede aprender sin tener ritmo natural?",
        a: "Sí. El ritmo se trabaja con ejercicios concretos, igual que cualquier técnica; no es un rasgo con el que se nace o no.",
      },
    ],
    cierreEmocional: "Llevas años creyéndote lo de los dos pies izquierdos. Una clase basta para empezar a desmentirlo.",
    metaTitle: "\"No tengo ritmo\" — Bachata desde cero, Vilanova",
    metaDescription:
      "El ritmo se entrena, no es un don: repetición y buena guía. Bachata desde cero, la favorita de quien dice \"yo no sé bailar\". En Vilanova.",
  },

  "miedo-al-ridiculo": {
    icp: "empezar",
    dolor: "miedo-al-ridiculo",
    headline: "Sin miedo al ridículo. Nadie te mira.",
    subhead: "Todo el grupo empezó exactamente donde estás tú ahora. Aquí se viene a aprender, no a juzgar.",
    ctaHero: "Quiero probar sin pasar vergüenza",
    mensajeWhatsapp: "¡Hola! Nunca he bailado y me da corte, pero me gustaría probar 🙂",
    agitacion: {
      kicker: "El foco imaginario",
      parrafos: [
        "En tu cabeza, la escena es así: tú te equivocas y toda la clase lo ve. Como si hubiera un foco siguiéndote y un público esperando el fallo.",
        "La realidad de una clase de iniciación es mucho menos dramática: quince personas concentradísimas en sus propios pies, sin capacidad mental para fiscalizar los tuyos. Todo el mundo falla — cada clase, muchas veces. El fallo no es la excepción vergonzosa: es el método.",
        "Lo curioso es que el miedo al ridículo se cura exactamente con lo que lo provoca: bailando delante de gente. Solo que en el sitio correcto, donde todos están en lo mismo. Ahí el miedo no aguanta ni media clase.",
      ],
    },
    antesDespues: {
      titulo: "El miedo, antes y después de una clase",
      antesLabel: "Desde fuera",
      antes: [
        "Cada error te parece un foco apuntándote.",
        "Ensayas mentalmente el ridículo antes de que pase.",
        "Dices \"yo miro\" en cada fiesta — y llevas años mirando.",
        "El corte de empezar pesa más que las ganas de bailar.",
      ],
      despuesLabel: "Desde dentro",
      despues: [
        "Descubres que nadie mira: cada uno está en su propia batalla con el paso.",
        "Te equivocas, te ríes, repites — como todos, en todas las clases.",
        "La rueda te lleva: no hay tiempo para la vergüenza cuando la música manda.",
        "Sales pensando \"¿de esto tenía yo miedo?\".",
      ],
    },
    clase: {
      slug: "salsa-cubana",
      nombre: "Salsa cubana",
      titulo: "Salsa cubana: donde la vergüenza no sobrevive a una rueda",
      descripcion:
        "Para el miedo al ridículo, la rueda de casino es medicina: bailas en círculo con todo el grupo, un cantante marca las figuras y todos cambian a la vez. Nadie es protagonista, nadie es el centro — la energía es colectiva y la risa, compartida. Imposible salir de una rueda sin sonreír.",
      porQue: [
        {
          title: "Nadie es el centro",
          text: "En la rueda todos hacen lo mismo a la vez: no hay foco posible sobre ti — el protagonista es el grupo.",
        },
        {
          title: "El fallo es colectivo",
          text: "Cuando media rueda se equivoca en la misma figura, la vergüenza se convierte en risa compartida.",
        },
        {
          title: "Desde cero real",
          text: "El paso básico y la guía se aprenden sin experiencia previa — no necesitas llegar sabiendo nada.",
        },
      ],
      cta: "Probar salsa cubana",
    },
    dolorSolucion: [
      {
        dolor: "Te da pánico hacer el ridículo delante de gente que ya sabe bailar.",
        solucion: "En tu grupo de nivel nadie sabe más que tú: todos están aprendiendo lo mismo, a la vez.",
      },
      {
        dolor: "Imaginas que todas las miradas están puestas en ti.",
        solucion: "Cada persona está concentrada en sus propios pasos, no en los tuyos. Nadie tiene tiempo de mirarte.",
      },
      {
        dolor: "El miedo al ridículo lleva años frenándote de apuntarte.",
        solucion: "Ese miedo suele durar diez minutos de la primera clase: lo que tardas en ver que todo el mundo está igual.",
      },
    ],
    objecion: {
      pregunta: "\"Me da mucha vergüenza moverme delante de gente\"",
      respuesta: "Es la reacción más habitual en la primera clase, y en la mayoría se pasa en cuanto empieza la música.",
    },
    faqExtra: [
      {
        q: "¿Se ríe la gente si te equivocas?",
        a: "No. Equivocarse es parte de aprender y le pasa a todo el mundo, cada clase.",
      },
    ],
    cierreEmocional: "El corte se pasa en la primera clase. El mensaje es el paso más difícil, y ya casi lo has dado.",
    metaTitle: "Sin miedo al ridículo — Salsa cubana en Vilanova",
    metaDescription:
      "Todo el grupo empezó donde estás tú: en la rueda de casino nadie es el centro y la vergüenza no sobrevive a una clase. Prueba en Vilanova.",
  },

  "ya-soy-mayor": {
    icp: "empezar",
    dolor: "ya-soy-mayor",
    headline: "¿Mayor para bailar? Aquí se empieza de los 18 a los 60 y pico.",
    subhead:
      "En los grupos hay gente de todas las décadas dando sus primeros pasos. Empezar de adulto no es la excepción: es la norma.",
    ctaHero: "Quiero empezar ahora",
    mensajeWhatsapp: "¡Hola! Creo que ya soy mayor para empezar a bailar, ¿es buena idea probar igualmente? 🙂",
    agitacion: {
      kicker: "La cuenta que no echas",
      parrafos: [
        "\"Tenía que haber empezado de joven.\" Puede ser. Pero esa cuenta ya no se puede cambiar — y hay otra que sí: si no empiezas ahora, dentro de cinco años dirás exactamente la misma frase, con cinco años más.",
        "Lo de la edad, además, tiene trampa: te imaginas una clase llena de veinteañeros flexibles y tú desentonando. La clase real se parece más a un corte transversal del pueblo — gente de los 18 a los 60 y pico, cada uno con su cuerpo y su punto de partida, todos aprendiendo lo mismo.",
        "El baile social no es gimnasia rítmica: no premia la juventud, premia las ganas y la constancia. Y de eso no hay edad de caducidad.",
      ],
    },
    antesDespues: {
      titulo: "Los próximos años, con o sin este paso",
      antesLabel: "Si sigues esperando",
      antes: [
        "\"Me hubiera gustado bailar\" — la frase se repite, la edad sube.",
        "En las celebraciones sigues sentado/a, mirando a los que se atreven.",
        "La idea de que \"ya no es tu momento\" se hace más fuerte cada año.",
        "El baile queda en la lista de cosas que se quedaron sin probar.",
      ],
      despuesLabel: "Si empiezas ahora",
      despues: [
        "En unas semanas eres alguien que baila — a la edad que tengas.",
        "Compartes clase con gente de tu franja y de todas las demás.",
        "Tu cuerpo gana coordinación, memoria y soltura: el mejor mantenimiento.",
        "La frase cambia: de \"me hubiera gustado\" a \"por fin lo estoy haciendo\".",
      ],
    },
    clase: {
      slug: "salsa-cubana",
      nombre: "Salsa cubana",
      titulo: "Salsa cubana: el baile que no pregunta la edad",
      descripcion:
        "La salsa cubana lleva décadas bailándose en todas las generaciones a la vez — es el baile social por excelencia, y en las ruedas de casino conviven todas las edades con naturalidad. No necesitas pareja, ni experiencia, ni un cuerpo de veinte años: el básico se aprende desde cero y a tu ritmo.",
      porQue: [
        {
          title: "Todas las edades en la pista",
          text: "Es un baile de todas las generaciones: en una rueda de casino conviven décadas distintas con total normalidad.",
        },
        {
          title: "Entrenamiento completo y amable",
          text: "Coordinación, oído musical y memoria — un entrenamiento que no parece entrenamiento, a tu ritmo.",
        },
        {
          title: "Desde cero, sin requisitos",
          text: "Ni pareja ni experiencia previa: el paso básico y la guía se aprenden desde el primer día.",
        },
      ],
      cta: "Probar salsa cubana",
    },
    dolorSolucion: [
      {
        dolor: "Piensas que ya eres \"mayor\" para empezar algo nuevo como esto.",
        solucion: "Los grupos reúnen edades muy distintas; empezar de adulto/a es lo más habitual, no la excepción.",
      },
      {
        dolor: "Te da miedo que tu cuerpo ya no responda como antes.",
        solucion: "Los grupos de nivel inicial van al ritmo de quien empieza, no al de quien lleva años entrenando.",
      },
      {
        dolor: "Crees que has \"perdido el tren\" de aprender a bailar.",
        solucion: "Ese tren no pasa una vez: cada grupo nuevo que abre vuelve a salir desde cero.",
      },
    ],
    objecion: {
      pregunta: "\"¿No seré la persona más mayor de la clase?\"",
      respuesta: "El rango de edad real va de los 18 a los 60 y pico; siempre hay compañía en tu franja.",
    },
    faqExtra: [
      {
        q: "¿Hay edad mínima o máxima?",
        a: "Somos una escuela para adultos: hay gente de los 18 a los 60 y pico. El único requisito es tener ganas.",
      },
    ],
    cierreEmocional: "Llevas años diciendo \"me hubiera gustado bailar\". Todavía estás a tiempo de cambiar el verbo.",
    metaTitle: "Nunca es tarde para bailar — Salsa en Vilanova",
    metaDescription:
      "De los 18 a los 60 y pico: en los grupos hay gente de todas las décadas dando sus primeros pasos. Prueba salsa cubana en Vilanova.",
  },

  "el-peor-de-la-clase": {
    icp: "empezar",
    dolor: "el-peor-de-la-clase",
    headline: "No vas a frenar a nadie.",
    subhead: "Empiezas con gente que está exactamente en tu mismo punto. Nadie espera que ya sepas.",
    ctaHero: "Quiero empezar en mi nivel",
    mensajeWhatsapp: "¡Hola! Me da miedo ser el/la que menos sabe y frenar a los demás, ¿cómo funcionan los grupos? 🙂",
    agitacion: {
      kicker: "El cálculo que te bloquea",
      parrafos: [
        "Tu miedo tiene lógica: recuerdas la clase del colegio donde uno no seguía el ritmo y todos resoplaban. No quieres ser esa persona. Es comprensible — y está basado en un formato que aquí no existe.",
        "Aquellas clases mezclaban niveles a la fuerza. Aquí los grupos se montan justo al revés: por nivel real. Si empiezas de cero, tu grupo entero empieza de cero. No puedes frenar a gente que va exactamente a tu velocidad.",
        "Y hay algo más: en un grupo donde todos empiezan, preguntar dos veces no molesta a nadie — al contrario, la mitad de la clase agradece en silencio que alguien pregunte lo que ellos no se atrevían.",
      ],
    },
    antesDespues: {
      titulo: "El grupo que temes vs. el grupo que existe",
      antesLabel: "El grupo que imaginas",
      antes: [
        "Todos avanzados menos tú, esperándote con los brazos cruzados.",
        "El profesor repitiendo \"otra vez, por ti\" delante de todos.",
        "Preguntar dos veces = molestar.",
        "Cada clase, la angustia de quedar en evidencia.",
      ],
      despuesLabel: "El grupo real, por nivel",
      despues: [
        "Todo el grupo en tu mismo punto: nadie espera a nadie.",
        "Repetir es el método: se repite lo que el grupo necesita, sin señalar.",
        "Tus preguntas ayudan a media clase que no se atrevía.",
        "El avance rápido del básico te quita el miedo en pocas semanas.",
      ],
    },
    clase: {
      slug: "bachata",
      nombre: "Bachata",
      titulo: "Bachata: donde nadie se queda atrás",
      descripcion:
        "Si tu miedo es no seguir el ritmo del grupo, la bachata juega a tu favor: su básico es de los más sencillos de aprender de todo el baile social, con resultados rápidos que se notan en pocas clases. La forma más segura de comprobar que no vas a frenar a nadie — porque avanzas antes de que te dé tiempo a preocuparte.",
      porQue: [
        {
          title: "Resultados rápidos",
          text: "El básico se aprende en pocas clases: pocas cosas desmontan el miedo tan rápido como ver que avanzas.",
        },
        {
          title: "Guía clara para los dos",
          text: "Las figuras se enseñan con guía cómoda y clara: no dependes de \"pillarlo al vuelo\".",
        },
        {
          title: "Rotación sin jerarquía",
          text: "Al rotar de pareja, nadie carga con nadie: cada canción es un empezar de nuevo entre iguales.",
        },
      ],
      cta: "Probar bachata",
    },
    dolorSolucion: [
      {
        dolor: "Te preocupa ser el/la peor de la clase y ralentizar al resto.",
        solucion: "Los grupos se forman por nivel real: si empiezas de cero, todo tu grupo empieza de cero contigo.",
      },
      {
        dolor: "Sientes que harás esperar a los demás mientras entiendes el paso.",
        solucion: "El ritmo lo marca el grupo, no una sola persona; todos repiten los mismos pasos las veces que hace falta.",
      },
      {
        dolor: "Te da vergüenza preguntar algo que \"todos ya saben\".",
        solucion: "En un grupo de nivel inicial nadie sabe más: preguntar es lo normal, no la excepción.",
      },
    ],
    objecion: {
      pregunta: "\"¿Y si me cuesta más que a los demás?\"",
      respuesta: "Cada persona avanza a su ritmo dentro del grupo; nadie se queda atrás por tardar un poco más.",
    },
    pruebaSocial: "Cada grupo nuevo que abre está formado, en su mayoría, por gente que empieza de cero a la vez.",
    faqExtra: [
      {
        q: "¿Qué nivel necesito para empezar?",
        a: "El que tengas. Hay grupos desde cero absoluto hasta avanzado, y el profesor te asigna el que mejor encaja contigo.",
      },
    ],
    cierreEmocional: "Nadie va a frenar a nadie: todo el grupo empieza igual. Escríbenos y lo compruebas tú mismo/a.",
    metaTitle: "No frenarás a nadie — Bachata en Vilanova",
    metaDescription:
      "Empiezas con gente que está exactamente en tu mismo punto: grupos por nivel desde cero y un básico que se aprende rápido. En Vilanova.",
  },

  "que-disciplina": {
    icp: "empezar",
    dolor: "que-disciplina",
    headline: "¿Por dónde empiezo? Te lo decimos nosotros.",
    subhead: "No hace falta que sepas si quieres salsa, bachata o heels antes de escribir. Te ubicamos según lo que buscas.",
    ctaHero: "Quiero que me orientéis",
    mensajeWhatsapp: "¡Hola! No sé qué disciplina elegir para empezar, ¿me ayudáis a decidir? 🙂",
    agitacion: {
      kicker: "La parálisis del catálogo",
      parrafos: [
        "Salsa, bachata, reparto, reggaeton, lady style, heels... Llevas semanas mirando la lista como quien mira una carta de restaurante demasiado larga. Y mientras decides, no pruebas ninguna.",
        "Es la trampa clásica: creer que hay una elección correcta y que fallarla es perder el tiempo. Pero elegir disciplina no es un examen — es como elegir el primer libro de una biblioteca a la que vas a volver. Se empieza por uno, y ya.",
        "Además, aquí la elección ni siquiera es definitiva por diseño: la tarifa fundadora da acceso a todas las disciplinas de tu nivel. Tu única decisión real es escribir o seguir mirando la carta.",
      ],
    },
    antesDespues: {
      titulo: "De mirar el catálogo a estar en la pista",
      antesLabel: "Mientras lo piensas",
      antes: [
        "Semanas comparando estilos en Instagram sin decidirte.",
        "Miedo a elegir mal y \"perder\" el tiempo o el dinero.",
        "La duda como excusa perfecta para no empezar nunca.",
        "Sigues sin bailar nada, que es la única elección mala.",
      ],
      despuesLabel: "Cuando nos escribes",
      despues: [
        "Nos cuentas qué buscas y te proponemos el punto de partida.",
        "Empiezas por una disciplina — y puedes probar las demás de tu nivel.",
        "Si no te encaja, cambias: la cuota cubre todas las de tu nivel.",
        "La decisión difícil resulta que eran dos líneas de WhatsApp.",
      ],
    },
    clase: {
      slug: "salsa-cubana",
      nombre: "Salsa cubana",
      titulo: "¿Sin preferencia clara? Empieza por salsa cubana",
      descripcion:
        "Si después de contarnos lo que buscas sigues sin verlo claro, la salsa cubana es la puerta de entrada clásica: el baile social por excelencia, alegre, de grupo, con el que puedes salir a cualquier pista del mundo. Y con la tarifa fundadora, empezar por salsa no te cierra ninguna puerta: tienes acceso a todas las disciplinas de tu nivel.",
      porQue: [
        {
          title: "La puerta de entrada clásica",
          text: "Alegre, social y sin requisitos: la salsa cubana es el punto de partida más versátil del baile social.",
        },
        {
          title: "Te ubicamos nosotros",
          text: "Nos cuentas qué buscas —energía, pareja, estilo— y te proponemos el grupo y la disciplina que encajan.",
        },
        {
          title: "Sin puertas cerradas",
          text: "La tarifa fundadora incluye todas las disciplinas de tu nivel: empezar por una no es renunciar al resto.",
        },
      ],
      cta: "Pedir orientación por WhatsApp",
    },
    dolorSolucion: [
      {
        dolor: "No sabes si te pega más la salsa, la bachata, el reggaeton o los heels.",
        solucion: "Nos cuentas qué buscas —ritmo, estilo, energía— y te proponemos por dónde empezar.",
      },
      {
        dolor: "La duda de \"qué elegir\" te está frenando de apuntarte a nada.",
        solucion:
          "No necesitas decidirlo solo/a: la tarifa fundadora da acceso a todas las disciplinas de tu nivel, así que puedes probar más de una.",
      },
      {
        dolor: "Te preocupa elegir mal y arrepentirte después.",
        solucion: "Nada es definitivo: puedes cambiar de disciplina dentro de tu nivel cuando quieras.",
      },
    ],
    objecion: {
      pregunta: "\"No tengo ni idea de estilos de baile\"",
      respuesta: "No hace falta saberlo: cuéntanos qué te llama la atención y te orientamos nosotros.",
    },
    faqExtra: [
      {
        q: "¿Puedo probar varias disciplinas antes de decidirme?",
        a: "Sí: la tarifa fundadora incluye acceso a todas las disciplinas de tu nivel, así que puedes ir probando.",
      },
    ],
    cierreEmocional: "No necesitas tener claro el estilo. Solo necesitas escribirnos y contarnos qué buscas.",
    metaTitle: "¿Qué disciplina elijo? Te ubicamos nosotros",
    metaDescription:
      "¿No sabes por dónde empezar a bailar? Cuéntanos qué buscas y te orientamos entre salsa, bachata, reggaeton o heels. Escuela en Vilanova.",
  },

  "probar-sin-compromiso": {
    icp: "empezar",
    dolor: "probar-sin-compromiso",
    headline: "Prueba antes de decidir. Sin letra pequeña.",
    subhead: "Una clase de prueba para conocer el ambiente antes de comprometerte a nada. Sin presión y sin sorpresas.",
    ctaHero: "Quiero mi clase de prueba",
    mensajeWhatsapp: "¡Hola! Me gustaría probar una clase antes de decidirme, ¿cómo funciona? 🙂",
    agitacion: {
      kicker: "Lo que de verdad te frena",
      parrafos: [
        "No es el baile. Es el compromiso: la cuota, la permanencia imaginaria, el \"¿y si me apunto y luego no voy?\". Has visto demasiados gimnasios cobrando meses de servicios que nadie usa.",
        "Por eso aquí el orden es el contrario: primero vienes, bailas una clase entera, conoces al grupo y al profe — y luego decides. Sin haber firmado nada, sin que nadie te persiga, sin letra pequeña esperándote.",
        "Lo peor que puede pasar es que pases una hora bailando y decidas que no es lo tuyo. Compara ese riesgo con el de quedarte otra temporada con la duda.",
      ],
    },
    antesDespues: {
      titulo: "Decidir a ciegas vs. decidir después de probar",
      antesLabel: "Apuntarse a ciegas",
      antes: [
        "Pagar sin saber si el ambiente te encaja.",
        "Miedo a la permanencia y a la letra pequeña.",
        "La duda te tiene meses en el \"ya lo miraré\".",
        "Decidir con miedo — o no decidir nunca.",
      ],
      despuesLabel: "Probar primero aquí",
      despues: [
        "Una clase completa, con el grupo real y el profe real.",
        "Sin permanencia: si te quedas, es porque quieres volver.",
        "Todas tus dudas respondidas en persona, sin compromiso.",
        "Decides con datos: la clase ya la has vivido.",
      ],
    },
    clase: {
      slug: "bachata",
      nombre: "Bachata",
      titulo: "Bachata: la mejor primera clase de prueba",
      descripcion:
        "Para una clase de prueba quieres algo donde notar avance en una sola sesión — y ahí la bachata no tiene rival: básico sencillo, ritmo claro y la sensación de estar bailando de verdad desde el primer día. Si te gusta, la tarifa fundadora te abre además todas las disciplinas de tu nivel.",
      porQue: [
        {
          title: "Avance en una sesión",
          text: "El básico de bachata se coge rápido: en tu clase de prueba ya sales habiendo bailado de verdad.",
        },
        {
          title: "Sin requisitos de entrada",
          text: "Ni pareja ni experiencia: llegas, te sumas al grupo de tu nivel y pruebas tal cual eres.",
        },
        {
          title: "Decisión informada",
          text: "Ves el ambiente, el grupo y el método en directo — decides con la experiencia ya vivida.",
        },
      ],
      cta: "Reservar mi clase de prueba",
    },
    dolorSolucion: [
      {
        dolor: "Quieres probar antes de comprometerte a una cuota mensual.",
        solucion: "Tienes una clase de prueba pensada exactamente para eso: conocer el ambiente antes de decidir.",
      },
      {
        dolor: "Te da corte incluso preguntar el precio o escribir por primera vez.",
        solucion: "Un WhatsApp basta. Sin formularios eternos ni compromiso por preguntar.",
      },
      {
        dolor: "Temes que \"probar\" esconda letra pequeña o permanencia.",
        solucion: "No hay permanencia: decides después de probar, sin condiciones ocultas.",
      },
    ],
    objecion: {
      pregunta: "\"¿Probar significa que ya estoy apuntado/a?\"",
      respuesta: "No. Pruebas, ves si te encaja, y decides después. Sin compromiso ninguno.",
    },
    faqExtra: [
      {
        q: "¿Qué llevo a la clase de prueba?",
        a: "Ropa cómoda y unas zapatillas limpias. El resto —música, grupo y buen rollo— lo ponemos nosotros.",
      },
    ],
    cierreEmocional: "Todo empieza por probar. Decide después, con calma.",
    metaTitle: "Clase de prueba sin compromiso en Vilanova",
    metaDescription:
      "Prueba una clase de baile antes de decidir nada: sin permanencia y sin letra pequeña. Ven a conocer el ambiente en Vilanova i la Geltrú.",
  },
};
