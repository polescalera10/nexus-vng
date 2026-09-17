/**
 * Copy de la home en catalán — espejo de `content/landing.ts`.
 *
 * Mismos datos que el castellano, sin añadir ni quitar nada. Donde el
 * castellano estaba desactualizado (FAQ de dirección, horarios, precio de la
 * prueba y rotación), el catalán ya lleva el dato confirmado por Pol y el
 * castellano queda señalado en docs/traduccions/revisio-piloto-ca.md.
 */

import { disciplinasRegulares } from "@/content/horario-regular";
import type { ctaFinal as CtaFinalEs, experience as ExperienceEs, founding as FoundingEs, hero as HeroEs, steps as StepsEs } from "@/content/landing";

export const heroCa: typeof HeroEs = {
  kicker: "Escola de ball a Vilanova i la Geltrú",
  title: "No véns a una classe. Entres a una comunitat.",
  subtitle:
    "Comencis on comencis —des de zero absolut o amb anys de pista— aquí trobes el teu grup, el teu ritme i la teva gent.",
  cta: "Escriu-nos per WhatsApp",
  ctaNote: "Reserva la teva primera classe de prova i coneix l'ambient.",
};

export const levelsCa = [
  { n: "00", label: "Mai he ballat" },
  { n: "01", label: "Estic començant" },
  { n: "02", label: "Intermedi" },
  { n: "03", label: "Avançat" },
];

export const experienceCa: typeof ExperienceEs = [
  {
    title: "Avances sense pressió",
    text: "Grups per nivell real. Avances quan estàs a punt, no quan toca.",
    accent: "bg-neon",
  },
  {
    title: "Una comunitat de veritat",
    text: "Arribes sol i surts amb plans. El cap de setmana comença aquí, a la pista.",
    accent: "bg-neon-mint",
  },
  {
    title: "Surts sentint-te capaç",
    text: "Cada classe et torna una mica de confiança. I això també es nota fora de la pista.",
    accent: "bg-neon-lime",
  },
];

/** Descripción corta de cada disciplina (en castellano sale de Supabase). */
export const descripcionesCa: Record<string, string> = {
  "salsa-cubana": "El sabor del son i la roda de casino. Energia, girs i moltes rialles en grup.",
  bachata: "Sensibilitat, musicalitat i connexió. La que enganxa des del primer dia.",
  reparto: "El gènere urbà que triomfa a l'Havana. Moviment, actitud i molt de carrer.",
  reggaeton: "Perreo amb tècnica i estil. Sona fort, i se sent encara més fort.",
  "lady-style-salsa": "Estil femení aplicat a la salsa cubana: braços, maluc i presència pròpia.",
  "lady-style-bachata": "El llenguatge corporal de la bachata en solitari: ones, girs i musicalitat.",
  "sexy-style": "Sensualitat treballada amb tècnica: control, respiració i actitud.",
  heels: "Potència, actitud i glamur. Amb talons o sense, l'energia és la mateixa.",
  "cia-salsa": "Grup de companyia de salsa: coreografia, assaig continu i actuacions.",
  "cia-bachata-lady": "Grup de companyia de bachata lady: muntatge coreogràfic i xous.",
};

export const stepsCa: typeof StepsEs = [
  {
    n: "01",
    title: "Escriu-nos",
    text: "Un WhatsApp i llestos. Sense formularis eterns, sense compromís.",
  },
  {
    n: "02",
    title: "T'ubiquem",
    text: "Et proposem el grup, el dia i el nivell que millor t'encaixen per provar.",
  },
  {
    n: "03",
    title: "Véns a provar",
    text: "Balles, coneixes el grup i decideixes. Sense pressió i sense lletra petita.",
  },
];

export const faqsCa = [
  {
    q: "On sou?",
    a: "Al Gimnàs Aranha, a la Rambla del Garraf, 32, primera planta, a Sant Pere de Ribes, tocant a Vilanova i la Geltrú. Si et costa trobar-nos, escriu-nos per WhatsApp i t'hi guiem.",
  },
  {
    q: "Quant costa?",
    a: "La tarifa fundadora de llançament és de 85 €/mes (només 10 places) i inclou accés a totes les disciplines, amb la quota bloquejada mentre continuïs d'alta. Després, la tarifa plana amb tots els estils és de 100 €/mes; també pots venir per estils solts des de 35 €/mes. I abans de decidir pots fer una classe de prova: té un cost, que et descomptem si t'inscrius.",
  },
  {
    q: "Quins horaris hi ha?",
    a: "Fem classe de dilluns a divendres, de 18:30 a 22:30, en sessions d'una hora. La graella completa és a la pàgina d'horaris; escriu-nos amb la teva disponibilitat i et diem quins grups t'encaixen.",
  },
  {
    q: "He de venir amb parella?",
    a: "No cal. A classe la rotació de parella és voluntària, però la recomanem: ballar amb persones diferents ajuda molt a aprendre. La majoria de gent ve sola.",
  },
  {
    q: "Quin nivell necessito?",
    a: "El que tinguis. Hi ha grups des de zero absolut fins a avançat, i el professor t'assigna el que millor t'encaixa.",
  },
  {
    q: "Hi ha edat mínima o màxima?",
    a: "Som una escola per a adults: hi ha gent dels 18 als 60 i escaig. L'únic requisit és tenir ganes.",
  },
  {
    q: "Què porto a la classe de prova?",
    a: "Roba còmoda i unes sabatilles netes. La resta —música, grup i bon rotllo— la posem nosaltres.",
  },
];

export const ctaFinalCa: typeof CtaFinalEs = {
  kicker: "Últim pas",
  title: "Comencem?",
  subtitle: "La teva primera classe de prova és a un missatge de distància.",
  cta: "Escriu-nos per WhatsApp",
  note: "Responem ràpid. De debò.",
};

/** Solo los textos: precio, plazas y fecha salen del objeto castellano. */
export const foundingCa: Pick<
  typeof FoundingEs,
  | "kicker"
  | "title"
  | "subtitle"
  | "badge"
  | "deadlineLabel"
  | "urgencyNote"
  | "cta"
  | "finePrint"
  | "benefitsTitle"
  | "benefitsIntro"
  | "benefits"
  | "conditionNote"
> = {
  kicker: "Places fundadores",
  title: "Balla cada dia",
  subtitle: `La plaça fundadora obre les ${disciplinasRegulares.length} disciplines regulars de l'escola —del teu nivell o inferior— de dilluns a divendres, amb la quota bloquejada mentre continuïs d'alta. És la tarifa de qui ve a ballar molt.`,
  badge: "Quota bloquejada mentre continuïs d'alta",
  deadlineLabel: "La tarifa fundadora tanca d'aquí a",
  urgencyNote:
    "La tarifa fundadora només existeix mentre obrim l'escola. Els grups tenen l'aforament limitat: quan s'omplen, es tanquen.",
  cta: "Vull la meva plaça fundadora",
  finePrint: "Sense permanència. Si et dones de baixa, la tarifa fundadora no es recupera.",
  benefitsTitle: "Què inclou la plaça fundadora?",
  benefitsIntro:
    "No compres un estil: compres la setmana sencera. És la tarifa de qui vol venir tres, quatre o cinc dies. Si només vindràs una o dues vegades, et surt més a compte la mensualitat normal, i t'ho direm nosaltres.",
  benefits: [
    {
      title: `Les ${disciplinasRegulares.length} disciplines, del teu nivell o inferior`,
      text: "Salsa, bachata, lady salsa, bachata lady, reparto, reggaeton, sexy style, heels i els dos grups de companyia: totes les classes regulars obertes al teu nivell o per sota, de dilluns a divendres. A la companyia s'hi entra per audició, però sense cost a part.",
    },
    {
      title: "Quota bloquejada (amb condicions)",
      text: "La teva quota mensual es manté congelada mentre continuïs d'alta.",
    },
    {
      title: "Accés preferent a esdeveniments",
      text: "Prioritat de reserva a festes socials i masterclasses.",
    },
  ],
  conditionNote:
    "* La quota fundadora es manté sempre que la subscripció no tingui períodes de baixa.",
};
