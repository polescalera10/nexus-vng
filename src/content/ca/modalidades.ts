import type { ModalidadContenido } from "@/content/modalidades";

/**
 * Fichas de disciplina en catalán: solo las del piloto (`MODALIDADES_CA` en
 * i18n/rutas.ts). Traducción de `content/modalidades.ts` con una corrección:
 * la rotación de pareja es voluntaria y recomendada (Pol, 16-09-2026), no
 * obligatoria como dice todavía el castellano.
 */

export const metaDescripcionesCa: Record<string, string> = {
  "salsa-cubana":
    "Classes de salsa cubana a Vilanova i la Geltrú: casino, roda i musicalitat en grups per nivell, des de zero. Reserva la teva classe de prova per WhatsApp.",
  bachata:
    "Classes de bachata a Vilanova i la Geltrú: connexió, musicalitat i passos en parella, amb grups des de zero. Reserva la teva classe de prova per WhatsApp.",
};

/** Contenido largo de las fichas del piloto (los enlaces cruzados pueden ir a fichas en castellano). */
export const modalidadesContenidoCa: Record<string, ModalidadContenido> = {
  "salsa-cubana": {
    lead:
      "El ball social per excel·lència: son, sabor i roda de casino. La salsa cubana no s'estudia, es viu en grup, i enganxa des de la primera classe.",
    queEsTitle: "Què és la salsa cubana?",
    queEs: [
      "La salsa cubana (o casino) neix a l'Havana i es balla en parella, amb un estil circular, juganer i molt musical. A diferència d'altres estils de salsa més lineals, aquí tot flueix al voltant de la parella: girs, canvis de direcció i molta conversa entre els dos cossos.",
      "El seu format més famós és la roda de casino: diverses parelles ballen en cercle, un cantant va marcant les figures en veu alta i tothom canvia de parella al ritme de la música. És pura energia col·lectiva: és impossible sortir d'una roda sense somriure, encara que t'equivoquis la meitat de les vegades.",
      "A sota hi ha una música enorme: son, timba i tot el que sona a Cuba des de fa un segle. Aprendre casino també és aprendre a escoltar-la: on és la clau, quan entra el cor, quan el tema demana calma o demana foc. I funciona igual a Vilanova que a Barcelona o a l'Havana: amb la base, entres a qualsevol pista del món.",
    ],
    aprenderas: [
      "El pas bàsic, el pes del cos i la guia en parella des de zero, sense experiència prèvia i sense haver de venir acompanyat.",
      "Les figures clàssiques del casino: dile que no, enchufla, setenta, vacílala i les seves variants, encadenades amb sentit.",
      "Roda de casino: ballar en grup, escoltar el cantant i canviar de parella amb soltesa i sense xocs.",
      "Tècnica de girs i de mans: preparar el gir, marcar sense estirar el braç i seguir sense endevinar.",
      "Musicalitat: entendre la clau, el son i la timba per ballar amb la música i no per sobre.",
      "Recursos d'improvisació per defensar-te a qualsevol festa, amb qualsevol parella i a qualsevol velocitat.",
    ],
    comoEsLaClase: [
      "Cada sessió dura una hora i segueix la mateixa estructura: escalfament i pas bàsic, un bloc de tècnica individual (pes, gir, braços) i després la figura del dia, desmuntada per parts i muntada de nou amb música.",
      "La rotació de parella és voluntària, però la recomanem: ballar amb persones diferents t'ensenya a guiar o a seguir energies diferents, que és el que passa a una festa. Per això pots venir sol sense problema.",
      "Els grups van per nivell: 0 per a qui no ha ballat mai, 1 iniciació i 2 intermedi. El nivell te l'assigna el professor, així que no cal que sàpigues on encaixes. Només necessites roba còmoda i un calçat que giri bé sobre el terra de la sala.",
    ],
    beneficios: [
      {
        title: "Vida social real",
        text: "És el ball més social que hi ha: coneixes tot el grup i les festes es converteixen en el teu pla del cap de setmana.",
      },
      {
        title: "Coordinació i memòria",
        text: "Guiar o seguir figures treballa la coordinació, l'oïda musical i la memòria: un entrenament complet que no sembla un entrenament.",
      },
      {
        title: "Confiança que es nota",
        text: "Treure algú a ballar (o deixar-te portar) davant de gent canvia com et plantes en qualsevol situació, dins i fora de la pista.",
      },
      {
        title: "Una hora de desconnexió",
        text: "Mentre comptes el temps i escoltes el cor no penses en res més. Surts suant i amb el cap clar entre setmana.",
      },
    ],
    paraTi:
      "Si vols un ball alegre, de grup, amb què sortir a qualsevol pista del món i trobar gent amb qui ballar, la salsa cubana és la teva porta d'entrada. No necessites parella, ni ritme previ, ni una forma física concreta: només ganes i una hora a la setmana. Vine a provar una classe i decideix després.",
    estilos: ["Salsa"],
    relacionadas: [
      {
        slug: "bachata",
        text: "L'altre pilar del ball social: mateix ambient, mateixa gent i un bàsic que s'aprèn en un parell de classes. Gairebé tothom acaba fent les dues.",
      },
      {
        slug: "lady-style-salsa",
        text: "Si vols que els teus girs, els teus braços i la teva postura es vegin com els tens al cap, la tècnica individual és la drecera. Es nota directament a la roda.",
      },
      {
        slug: "reparto",
        text: "L'altra Cuba, la urbana i actual. Comparteix arrel musical amb la timba i deixa anar el cos per a tota la resta.",
      },
    ],
  },

  bachata: {
    lead:
      "Connexió, musicalitat i zero presses. La bachata és el ball de parella que enganxa des del primer dia, i el que més sona a totes les festes.",
    queEsTitle: "Què és la bachata?",
    queEs: [
      "La bachata neix a la República Dominicana i avui és el ball social més ballat a Espanya. Es balla en parella, amb un bàsic senzill d'aprendre i un sostre altíssim: dels primers passos als estils més moderns hi ha tot un món de musicalitat, ones i joc.",
      "Treballem des de la base dominicana fins als recursos de la bachata moderna i sensual: connexió amb la parella, interpretació de la música i aquell punt d'elegància que fa que dues persones semblin una de sola a la pista. No hi ha una única bachata correcta: hi ha una base comuna i moltes maneres de vestir-la.",
      "El seu gran avantatge és el ritme: quatre temps, un cop de maluc al quart i una música que gairebé sempre va a una velocitat amable. Per això és el ball amb què més gent descobreix que sí que sap ballar. A partir d'aquí, el que separa qui porta un mes de qui porta un any no són més figures: és la qualitat de la connexió i de l'escolta.",
    ],
    aprenderas: [
      "El pas bàsic, el pes i la connexió en parella des del primer dia, tant si véns sol com acompanyat.",
      "Figures i girs amb una guia clara i còmoda per als dos, sense estirades ni força.",
      "Musicalitat: interpretar la guitarra, el bongo, la güira i les pauses de cada cançó.",
      "Ones, aïllaments i moviment de maluc per no ballar en mode automàtic.",
      "Recursos de bachata moderna i sensual, amb criteri sobre quan tenen sentit i quan sobren.",
      "Adaptar-te a qualsevol parella i a qualsevol nivell en una festa: l'habilitat més útil de totes.",
    ],
    comoEsLaClase: [
      "La classe dura una hora i sempre comença amb bàsic i escalfament sobre la música del dia. Després ve un bloc de tècnica —pes, maluc, braços o el detall que toqui— i finalment la combinació de la sessió, explicada per parts, primer sense música i després amb música fins que surt sola.",
      "La rotació de parella és voluntària, però la recomanem: canviar de parella és incòmode el primer dia i alliberador a partir del segon, perquè et fa conèixer energies de ball diferents i és el que t'ensenya a guiar i a seguir de debò. No cal venir amb ningú.",
      "Hi ha grups de nivell 0 (des de zero absolut), 1 (iniciació) i 2 (intermedi), a més d'una classe d'estil femení aplicat a la bachata. El nivell te l'assigna el professor: t'ubiquem al grup on gaudiràs més, no al que soni millor.",
    ],
    beneficios: [
      {
        title: "Resultats ràpids",
        text: "El bàsic s'aprèn en poques classes: en poc temps ja pots sortir a ballar de debò. Poques coses motiven tant com progressar ràpid i notar-ho el mateix mes.",
      },
      {
        title: "Connexió de veritat",
        text: "La bachata ensenya a escoltar l'altre sense parlar: proposta, resposta i confiança. Una habilitat que et queda bastant més enllà de la pista.",
      },
      {
        title: "El ball més demanat",
        text: "Sona a totes les festes, casaments i socials, i al Garraf hi ha bachata gairebé cada setmana. Saber-ne és la clau que obre qualsevol pista.",
      },
      {
        title: "Cos i postura",
        text: "Treballar maluc, aïllaments i col·locació una hora a la setmana canvia com et mous. No és un gimnàs, però el cos se n'adona.",
      },
    ],
    paraTi:
      "Si busques un ball de parella elegant, proper i amb progressió ràpida, o si la salsa t'imposa i vols començar per una cosa més pausada, la bachata és el punt de partida perfecte. Funciona igual si véns sol, amb la teva parella o amb un amic. Vine a provar una classe: acostuma a ser la preferida dels qui diuen «jo no sé ballar».",
    estilos: ["Bachata"],
    relacionadas: [
      {
        slug: "salsa-cubana",
        text: "El complement natural: mateix ambient social, energia més alta i roda de casino. A les festes sonen totes dues, així que val la pena tenir-les.",
      },
      {
        slug: "lady-style-bachata",
        text: "Tècnica i estil individual perquè els teus braços, les teves ones i la teva postura acompanyin. És el que fa que la mateixa figura llueixi el doble.",
      },
      {
        slug: "reggaeton",
        text: "Si et costa deixar anar el maluc, una hora d'urbà a la setmana desbloqueja el moviment i es nota directament a la teva bachata.",
      },
    ],
  },
};
