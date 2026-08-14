import { modalidadesFallback } from "@/content/landing";

/**
 * Mensaje de WhatsApp según LA PÁGINA que se está mirando.
 *
 * El problema que resuelve: los CTA globales (sticky, cabecera, menú móvil,
 * footer) están en todas las páginas y hasta ahora mandaban siempre el mismo
 * texto genérico, así que los mensajes llegaban sin decir de qué va la
 * consulta. Aquí cada ruta tiene su mensaje ya escrito ("Me gustaría info
 * sobre los intensivos", "…sobre las clases de bachata"), de forma que el
 * primer mensaje del chat ya dice qué le interesa a esa persona.
 *
 * `label` viaja a GA4 como `cta_label` junto al origen del bloque: origen =
 * qué CTA se pulsó, label = desde qué página. Con los dos se sabe qué página
 * y qué bloque convierten.
 *
 * Las rutas con contenido dinámico (una modalidad, un evento, un profe) pasan
 * su nombre exacto desde la página con `<SetWaPageContext>`; lo de aquí es el
 * mapa estático y el fallback por sección.
 */
export type WaPageContext = {
  /** Etiqueta corta del contexto — va a GA4 como `cta_label`. */
  label: string;
  /** Texto ya redactado que se prerrellena en el chat. */
  message: string;
};

/** Rutas legales y cualquier cosa fuera del mapa: mensaje neutro pero correcto. */
const DEFAULT: WaPageContext = {
  label: "general",
  message: "¡Hola! Vengo de la web de NEXUS VNG y me gustaría más información 🙂",
};

const EVENTOS: WaPageContext = {
  label: "eventos",
  message: "¡Hola! Me gustaría info sobre los próximos eventos 🙂",
};

const PROFESORES: WaPageContext = {
  label: "profesores",
  message: "¡Hola! Me gustaría info sobre las clases y el equipo de profes 🙂",
};

const STATIC: Record<string, WaPageContext> = {
  "/": {
    label: "home",
    message: "¡Hola! Vengo de la web y me gustaría info para empezar en las clases de baile 🙂",
  },
  "/clases": {
    label: "clases",
    message: "¡Hola! Me gustaría info sobre las clases de baile 🙂",
  },
  "/intensivos": {
    label: "intensivos",
    message: "¡Hola! Me gustaría info sobre los intensivos 🙂",
  },
  "/horarios": {
    label: "horarios",
    message: "¡Hola! Me gustaría info sobre los horarios de las clases 🙂",
  },
  "/eventos": EVENTOS,
  "/profesores": PROFESORES,
  "/socio-fundador": {
    label: "socio-fundador",
    message: "¡Hola! Me gustaría info sobre la plaza de socio fundador de NEXUS VNG ✨",
  },
  "/faq": {
    label: "faq",
    message: "¡Hola! Tengo una duda sobre las clases que no he visto en las preguntas frecuentes 🙂",
  },
  "/contacto": {
    label: "contacto",
    message: "¡Hola! Os escribo desde la web y me gustaría info sobre las clases 🙂",
  },
  "/sobre-nosotros": {
    label: "sobre-nosotros",
    message: "¡Hola! Me gustaría info sobre la escuela y sobre cómo empezar 🙂",
  },
};

/**
 * Nombres de disciplina para el fallback por ruta. El nombre bueno viene de la
 * BD y lo inyecta la propia página; esto cubre el primer render y los enlaces
 * pulsados antes de hidratar.
 */
const NOMBRE_POR_SLUG = new Map(modalidadesFallback.map((m) => [m.slug, m.nombre]));

/** "Salsa cubana" → "…las clases de salsa cubana": en minúscula dentro de la frase. */
const enFrase = (nombre: string) => nombre.toLocaleLowerCase("es-ES");

export function waContextModalidad(slug: string, nombre?: string): WaPageContext {
  const label = NOMBRE_POR_SLUG.get(slug) ?? slug.replace(/-/g, " ");
  return {
    label: `clase:${slug}`,
    message: `¡Hola! Me gustaría info sobre las clases de ${enFrase(nombre ?? label)} 💃`,
  };
}

export function waContextEvento(slug: string, titulo?: string): WaPageContext {
  return {
    label: `evento:${slug}`,
    message: titulo ? `¡Hola! Me gustaría info sobre el evento «${titulo}» 🙂` : EVENTOS.message,
  };
}

export function waContextProfesor(slug: string, nombre?: string): WaPageContext {
  return {
    label: `profesor:${slug}`,
    message: nombre
      ? `¡Hola! Me gustaría info para probar una clase con ${nombre} 🙂`
      : PROFESORES.message,
  };
}

/** Quita la barra final y la query para poder buscar la ruta en el mapa. */
function normalize(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const clean = pathname.split(/[?#]/)[0] ?? "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

export function waContextForPath(pathname: string | null | undefined): WaPageContext {
  const path = normalize(pathname);
  const exact = STATIC[path];
  if (exact) return exact;

  const [, section, slug] = path.split("/");
  if (!slug) return DEFAULT;
  if (section === "clases") return waContextModalidad(slug);
  if (section === "eventos") return waContextEvento(slug);
  if (section === "profesores") return waContextProfesor(slug);
  return DEFAULT;
}
