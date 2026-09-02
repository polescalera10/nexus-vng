/**
 * Avatar de iniciales.
 *
 * No guardamos fotos de alumnos (no hay columna ni bucket), así que el avatar
 * es tipográfico: las iniciales sobre un tinte estable derivado del `seed`
 * (el id). No es decoración — en una lista de veinte nombres, el color fijo de
 * cada persona es lo que permite reconocerla de un vistazo sin leer.
 */

const TINTS = [
  "bg-neon/15 text-neon",
  "bg-neon-mint/15 text-neon-mint",
  "bg-neon-lime/15 text-neon-lime",
  "bg-warning/15 text-warning",
  "bg-text-strong/10 text-text-strong",
] as const;

const SIZES = {
  sm: "h-9 w-9 text-[12px]",
  md: "h-11 w-11 text-sm",
} as const;

/** Primera letra del nombre y del último apellido: "Ana Ruiz Gil" → "AG". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Índice de tinte estable: el mismo alumno sale siempre del mismo color. */
function tintIndex(seed: string): number {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum = (sum + seed.charCodeAt(i)) % 9973;
  return sum % TINTS.length;
}

export function Avatar({
  name,
  seed,
  size = "md",
  className = "",
}: {
  name: string;
  /** Cualquier valor estable por persona; normalmente el id. */
  seed?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-body font-bold tracking-wide ${
        SIZES[size]
      } ${TINTS[tintIndex(seed ?? name)]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
