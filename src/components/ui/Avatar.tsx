/**
 * Avatar del alumno: foto si la ha subido, iniciales si no.
 *
 * Las iniciales no son un placeholder de relleno — en una lista de veinte
 * nombres, el tinte fijo de cada persona es lo que permite reconocerla de un
 * vistazo sin leer. Por eso el color se deriva del `seed` (el id) y no se
 * reparte al azar.
 *
 * La foto llega como URL FIRMADA y caduca en una hora (bucket privado, ver
 * `lib/avatars.ts`). Se pinta con `<img>` a propósito y no con `next/image`:
 * el optimizador cachea por URL, y una URL que cambia cada hora convertiría
 * cada visita en una optimización nueva facturable de la misma foto.
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
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
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
  src,
  size = "md",
  className = "",
}: {
  name: string;
  /** Cualquier valor estable por persona; normalmente el id. */
  seed?: string;
  /** URL firmada de la foto. Sin ella se pintan las iniciales. */
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }

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
