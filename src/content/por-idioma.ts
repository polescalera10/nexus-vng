import type { Locale } from "@/i18n/locales";
import { ctaFinal, experience, faqs, founding, hero, levels, steps } from "@/content/landing";
import {
  ctaFinalCa,
  descripcionesCa,
  experienceCa,
  faqsCa,
  foundingCa,
  heroCa,
  levelsCa,
  stepsCa,
} from "@/content/ca/landing";
import { metaDescripciones, modalidadesContenido, type ModalidadContenido } from "@/content/modalidades";
import { metaDescripcionesCa, modalidadesContenidoCa } from "@/content/ca/modalidades";
import { altsCa, claimsCa } from "@/content/ca/media";

/*
  Punto único para pedir contenido en un idioma. En castellano devuelve los
  objetos de siempre, así que las páginas actuales no cambian.
*/

export function landingEn(locale: Locale) {
  if (locale === "es") return { hero, levels, experience, steps, faqs, ctaFinal, founding };
  return {
    hero: heroCa,
    levels: levelsCa,
    experience: experienceCa,
    steps: stepsCa,
    faqs: faqsCa,
    ctaFinal: ctaFinalCa,
    founding: { ...founding, ...foundingCa },
  };
}

export function contenidoModalidad(slug: string, locale: Locale): ModalidadContenido | undefined {
  return locale === "ca" ? modalidadesContenidoCa[slug] : modalidadesContenido[slug];
}

export function metaModalidad(slug: string, locale: Locale): string | undefined {
  return locale === "ca" ? metaDescripcionesCa[slug] : metaDescripciones[slug];
}

/** Descripción corta de una disciplina (en castellano, la de Supabase). */
export function descripcionModalidad(
  m: { slug: string; descripcion: string | null },
  locale: Locale,
): string | null {
  return locale === "ca" ? (descripcionesCa[m.slug] ?? m.descripcion) : m.descripcion;
}

/** Nombre visible de una disciplina: en catalán «Cía» es «Cia». */
export function nombreModalidad(nombre: string, locale: Locale): string {
  return locale === "ca" ? nombre.replace(/^Cía\b/, "Cia") : nombre;
}

/** `alt` de una foto por su ruta (o por una clave como `hero` o `profesor:pol`). */
export function altEn(clave: string, altEs: string, locale: Locale): string {
  return locale === "ca" ? (altsCa[clave] ?? altEs) : altEs;
}

export function claimProfesor(slug: string, claimEs: string, locale: Locale): string {
  return locale === "ca" ? (claimsCa[slug] ?? claimEs) : claimEs;
}
