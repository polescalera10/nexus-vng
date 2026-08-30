/**
 * El parte de lo que pasó al convertir un lead, de la acción a la ficha.
 *
 * La conversión en un clic hace varias cosas a la vez (crear la ficha,
 * matricular, dejar en lista de espera) y luego navega. Sin este parte, el
 * admin aterriza en la ficha sin saber si sus clases entraron o no, que es
 * justo lo que no puede quedar en silencio: una matrícula que no ocurrió no
 * se distingue de un lead que no pidió nada.
 *
 * Viaja por query string porque el destino es una página distinta y el aviso
 * dura un vistazo — no merece una tabla ni una cookie.
 */

export type ConversionSummary = {
  enrolled: number;
  waitlisted: number;
  failed: number;
  /** Lo que pidió el lead y no se ha podido cruzar con ningún curso. */
  unmatched: string[];
};

/** Con más de esto en la barra de direcciones nadie lee nada. */
const UNMATCHED_LIMIT = 3;

export function buildConversionQuery(summary: ConversionSummary): string {
  const params = new URLSearchParams({ convertido: "1" });
  if (summary.enrolled > 0) params.set("alta", String(summary.enrolled));
  if (summary.waitlisted > 0) params.set("espera", String(summary.waitlisted));
  if (summary.failed > 0) params.set("fallidas", String(summary.failed));
  if (summary.unmatched.length > 0) {
    params.set("sin_cruzar", summary.unmatched.slice(0, UNMATCHED_LIMIT).join("|"));
    const rest = summary.unmatched.length - UNMATCHED_LIMIT;
    if (rest > 0) params.set("sin_cruzar_mas", String(rest));
  }
  return `?${params.toString()}`;
}

export type ConversionNotice = {
  tone: "success" | "warning";
  lines: string[];
};

function toInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const clases = (n: number) => (n === 1 ? "clase" : "clases");

/**
 * Lee el parte de los searchParams. Devuelve null si no viene de una
 * conversión, para que la ficha no pinte nada al entrar por su cuenta.
 */
export function readConversionNotice(
  searchParams: Record<string, string | string[] | undefined>,
): ConversionNotice | null {
  if (first(searchParams.convertido) !== "1") return null;

  const enrolled = toInt(searchParams.alta);
  const waitlisted = toInt(searchParams.espera);
  const failed = toInt(searchParams.fallidas);
  const unmatched = first(searchParams.sin_cruzar).split("|").filter(Boolean);
  const unmatchedRest = toInt(searchParams.sin_cruzar_mas);

  const lines: string[] = [
    enrolled > 0
      ? `Matriculado en ${enrolled} ${clases(enrolled)}.`
      : "Ficha creada sin matrículas.",
  ];

  if (waitlisted > 0) {
    lines.push(
      `${waitlisted} ${clases(waitlisted)} en lista de espera por aforo completo.`,
    );
  }
  if (failed > 0) {
    lines.push(
      `${failed} ${clases(failed)} no se pudieron guardar. Añádelas desde Editar alumno.`,
    );
  }
  if (unmatched.length > 0) {
    const extra = unmatchedRest > 0 ? ` y ${unmatchedRest} más` : "";
    lines.push(
      `Pidió ${unmatched.join(", ")}${extra}, que no corresponde a ningún curso activo.`,
    );
  }

  return {
    tone: waitlisted + failed + unmatched.length > 0 ? "warning" : "success",
    lines,
  };
}
