import { formatTime, WEEKDAYS } from "@/lib/format";

/**
 * De lo que pidió un lead a los cursos reales del panel.
 *
 * El formulario público guarda en `leads.intereses` la etiqueta legible de la
 * clase — "Salsa 1 · Miércoles 20:30" — y los cursos del panel se dieron de
 * alta para reproducirla exactamente (`name` = el estilo, sin día ni hora).
 * Esa etiqueta es la clave de cruce, y hace falta entera: hay dos "Bachata 1"
 * en el horario (lunes 18:30 y miércoles 21:30), así que casar solo por
 * nombre elegiría uno al azar.
 *
 * Quedan sueltos dos formatos que ya no genera nadie pero siguen en la base:
 * los slugs de la versión vieja del formulario (`reparto`, `cia-salsa`…) y los
 * `intensivo-*`. Los primeros se aceptan mientras resuelvan a un único curso;
 * los segundos no son curso regular y se descartan.
 */

export type CourseLike = {
  id: string;
  name: string;
  weekday: number;
  start_time: string;
};

export type LeadCourseMatch = {
  /** Cursos identificados sin ambigüedad, en el orden en que los pidió. */
  courseIds: string[];
  /** Lo que se pidió y no se ha podido cruzar. Se enseña, no se adivina. */
  unmatched: string[];
};

/** La etiqueta tal cual la guarda el formulario público. */
export function courseLabel(course: CourseLike): string {
  return `${course.name} · ${WEEKDAYS[course.weekday]} ${formatTime(course.start_time)}`;
}

/** Sin acentos, en minúsculas y con los espacios colapsados. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** "Cía Lady Bachata" → "cia-lady-bachata", que es como lo guardaba el form viejo. */
function slugify(value: string): string {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Interés que no apunta a ningún curso regular por definición. */
function isNoise(interes: string): boolean {
  const n = normalize(interes);
  return n.length === 0 || n.startsWith("intensivo-") || n.startsWith("aun no se");
}

/**
 * Cruza los intereses de un lead con el catálogo de cursos.
 *
 * Se prueba primero la etiqueta completa; si no casa, el nombre o su slug,
 * y solo cuando apuntan a un único curso. Un interés que casaría con dos
 * cursos se devuelve en `unmatched`: matricular en el que no era cuesta más
 * de arreglar que matricular a mano.
 */
export function matchLeadCourses(
  intereses: string[] | null | undefined,
  courses: CourseLike[],
): LeadCourseMatch {
  // Set y no lista: "Heels" da el mismo texto como nombre y como slug, y
  // contarlo dos veces lo haría pasar por ambiguo.
  const byLabel = new Map<string, Set<string>>();
  const byName = new Map<string, Set<string>>();

  const index = (map: Map<string, Set<string>>, key: string, courseId: string) => {
    const bucket = map.get(key) ?? new Set<string>();
    bucket.add(courseId);
    map.set(key, bucket);
  };

  for (const course of courses) {
    index(byLabel, normalize(courseLabel(course)), course.id);
    index(byName, normalize(course.name), course.id);
    index(byName, slugify(course.name), course.id);
  }

  const courseIds: string[] = [];
  const unmatched: string[] = [];

  for (const interes of intereses ?? []) {
    if (isNoise(interes)) continue;

    const key = normalize(interes);
    const candidates = byLabel.get(key) ?? byName.get(key);

    // Ninguno o más de uno: no hay nada que adivinar.
    if (!candidates || candidates.size !== 1) {
      unmatched.push(interes);
      continue;
    }
    const courseId = [...candidates][0];
    if (courseId && !courseIds.includes(courseId)) courseIds.push(courseId);
  }

  return { courseIds, unmatched };
}
