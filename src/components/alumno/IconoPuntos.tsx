import type { IconoPuntos as IconoNombre } from "@/types/database";

/**
 * Iconos de la gamificación: uno por regla y por premio (columna `icon`, 0050).
 *
 * SVG inline de trazo, como los del menú (`DashboardNav`): sin librería de
 * iconos para doce dibujos. La lista es la del CHECK de la BD; si se amplía
 * allí, se amplía aquí y en el tipo `IconoPuntos`.
 */
const PATHS: Record<IconoNombre, React.ReactNode> = {
  masterclass: <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" />,
  congreso: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5s-1.2 5.9-3.6 8.5c-2.4-2.6-3.6-5.4-3.6-8.5S9.6 6.1 12 3.5Z" />
    </>
  ),
  amigo: (
    <>
      <circle cx="9.5" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3.3 3-5.3 6-5.3s5.4 2 6 5.3M18.5 8v6M15.5 11h6" />
    </>
  ),
  perfil: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.8 20c.5-3.9 3.4-6.1 7.2-6.1s6.7 2.2 7.2 6.1" />
    </>
  ),
  story: (
    <>
      <circle cx="12" cy="12" r="8.5" strokeDasharray="3.2 2.4" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  reel: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M3.5 9h17M8 4.5 10 9M13.5 4.5l2 4.5M10.5 12.3v4.4l3.8-2.2-3.8-2.2Z" />
    </>
  ),
  estrella: (
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  ),
  invitado: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 5.5a3 3 0 0 1 0 5.6M17.5 14.4c1.7.6 2.7 2.2 3 4.6" />
    </>
  ),
  descuento: (
    <>
      <path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.5 1.5 0 0 1 0 2.1l-6.1 6.1a1.5 1.5 0 0 1-2.1 0L3.5 12.3Z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  entrada: (
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5v-2Z" />
      <path d="M14.5 6.5v11" strokeDasharray="1.8 2" />
    </>
  ),
  mes: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4M9 14.5l2 2 4-4" />
    </>
  ),
  hoodie: (
    <path d="M8.5 4 4 6.5 2.5 12l3 1v7h13v-7l3-1L20 6.5 15.5 4c-.5 1.6-1.9 2.6-3.5 2.6S9 5.6 8.5 4Z" />
  ),
  pase: (
    <>
      <rect x="6" y="7" width="12" height="14" rx="2" />
      <path d="M10 3h4v4h-4zM9 17.5h6" />
      <circle cx="12" cy="12.5" r="2" />
    </>
  ),
  corona: (
    <>
      <path d="M4 8.5 7.5 12 12 5.5 16.5 12 20 8.5 18.5 18h-13L4 8.5Z" />
      <path d="M5.5 21h13" />
    </>
  ),
  regalo: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5C6.5 9 9.5 9 12 9Zm0 0c1.5-3.5 5.5-4 5.5-1.5 0 1.5-3 1.5-5.5 1.5Z" />
    </>
  ),
};

const TONOS = {
  /** Se puede ganar o pedir ya. */
  accent: "bg-accent/12 text-accent",
  /** Destacado: el premio de leyenda, el que se acaba de desbloquear. */
  lime: "bg-neon-lime/12 text-neon-lime",
  /** Todavía lejos, o un movimiento que resta. */
  muted: "bg-text-strong/6 text-text-muted",
} as const;

const TAMANOS = {
  sm: { caja: "size-9 rounded-sm", svg: "size-[18px]" },
  md: { caja: "size-11 rounded-md", svg: "size-[22px]" },
  lg: { caja: "size-14 rounded-lg", svg: "size-7" },
} as const;

export function IconoPuntos({
  name,
  tono = "accent",
  size = "md",
}: {
  name: IconoNombre | null;
  tono?: keyof typeof TONOS;
  size?: keyof typeof TAMANOS;
}) {
  const t = TAMANOS[size];
  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center ${t.caja} ${TONOS[tono]}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={t.svg}
      >
        {PATHS[name ?? "estrella"]}
      </svg>
    </span>
  );
}
