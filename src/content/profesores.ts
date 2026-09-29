import { modalidadesContenido } from "@/content/modalidades";
import { modalidadesFallback } from "@/content/landing";
import { sesionesRegulares, type SesionRegular } from "@/content/horario-regular";

/**
 * El equipo de NEXUS VNG — fuente única de las fichas de profesor.
 *
 * Regla de honestidad del proyecto: aquí solo van datos confirmados por Pol
 * (01-08-2026): nombre, foto y quién imparte qué. Las clases NO se escriben a
 * mano, se derivan del cartel (`horario-regular.ts`) buscando el nombre en el
 * campo `profes` — así la ficha nunca contradice al horario.
 *
 * `bio` es opcional a propósito: mientras esté vacía, la ficha muestra solo lo
 * verificable (sus clases, sus disciplinas y el CTA). Nada de trayectorias,
 * años de experiencia ni titulaciones inventadas.
 */
export type Profesor = {
  slug: string;
  /** Nombre tal y como aparece en el cartel de horarios. */
  nombre: string;
  /** Frase corta de presentación, visible en la tarjeta y bajo el nombre. */
  claim: string;
  foto: string;
  /** Texto alternativo de la foto. */
  fotoAlt: string;
  /** Dimensiones reales del archivo: next/image las necesita para el srcset. */
  ancho: number;
  alto: number;
  /** Bio real. Vacía hasta que Pol la pase — ver comentario de cabecera. */
  bio?: string[];
};

export const profesores: Profesor[] = [
  {
    slug: "davide",
    nombre: "Davide",
    claim: "Bachata en pareja, desde cero hasta intermedio.",
    foto: "/images/profes/davide.jpg",
    fotoAlt: "Davide, profesor de bachata de NEXUS VNG",
    ancho: 933,
    alto: 1400,
  },
  {
    slug: "martina",
    nombre: "Martina",
    claim: "Bachata, lady style y los grupos de compañía.",
    foto: "/images/profes/martina.jpg",
    fotoAlt: "Martina, profesora de bachata y lady style de NEXUS VNG",
    ancho: 933,
    alto: 1400,
  },
  {
    slug: "pol",
    nombre: "Pol",
    claim: "Salsa cubana y bachata, desde cero absoluto.",
    foto: "/images/profes/pol.jpg",
    fotoAlt: "Pol, profesor de salsa cubana y bachata de NEXUS VNG",
    ancho: 1021,
    alto: 1400,
  },
  {
    slug: "yuri",
    nombre: "Yuri",
    claim: "Heels y sexy style: técnica, líneas y actitud.",
    foto: "/images/profes/yuri.jpg",
    fotoAlt: "Yuri, profesora de heels y sexy style de NEXUS VNG",
    ancho: 1050,
    alto: 1400,
  },
  {
    slug: "ana-aylen",
    nombre: "Ana Aylén",
    claim: "Estilo cubano y urbano: salsa, reparto y reggaetón.",
    foto: "/images/profes/ana-aylen.jpg",
    fotoAlt: "Ana Aylén, profesora de salsa, reparto y reggaetón de NEXUS VNG",
    ancho: 1050,
    alto: 1400,
  },
];

export function getProfesor(slug: string): Profesor | undefined {
  return profesores.find((p) => p.slug === slug);
}

export function listProfesorSlugs(): string[] {
  return profesores.map((p) => p.slug);
}

/**
 * Clases que imparte, sacadas del cartel. El campo `profes` es texto libre
 * ("Martina y Davide"), así que se busca el nombre dentro de la cadena.
 */
export function clasesDe(nombre: string): SesionRegular[] {
  return sesionesRegulares.filter((s) => s.profes.includes(nombre));
}

/** Los otros nombres que aparecen junto al suyo en el cartel. */
export function companerosDe(nombre: string): string[] {
  const otros = new Set<string>();
  for (const sesion of clasesDe(nombre)) {
    for (const p of profesores) {
      if (p.nombre !== nombre && sesion.profes.includes(p.nombre)) otros.add(p.nombre);
    }
  }
  return [...otros];
}

/**
 * Páginas de disciplina en las que aparece: se cruza el estilo de sus clases
 * con el campo `estilos` de cada modalidad (p. ej. "Salsa 1" → "Salsa" →
 * /clases/salsa-cubana). Devuelve slug y nombre legible.
 */
export function modalidadesDe(nombre: string): Array<{ slug: string; nombre: string }> {
  const estilos = clasesDe(nombre).map((s) => s.estilo);
  const salida: Array<{ slug: string; nombre: string }> = [];

  for (const [slug, contenido] of Object.entries(modalidadesContenido)) {
    const encaja = contenido.estilos.some((estilo) =>
      estilos.some((e) => e === estilo || e.replace(/\s+\d+$/, "").trim() === estilo),
    );
    if (encaja) {
      // El nombre legible vive en el fallback estático (mismo que usa la BD),
      // así la ficha no depende de Supabase para pintar los enlaces.
      const nombreModalidad = modalidadesFallback.find((m) => m.slug === slug)?.nombre;
      if (nombreModalidad) salida.push({ slug, nombre: nombreModalidad });
    }
  }
  return salida;
}

/** Profesores que imparten una disciplina, para pintarlos en /clases/[modalidad]. */
export function profesoresDe(slugModalidad: string): Profesor[] {
  return profesores.filter((p) => modalidadesDe(p.nombre).some((m) => m.slug === slugModalidad));
}
