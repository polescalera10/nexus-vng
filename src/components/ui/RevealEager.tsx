import type { CSSProperties, ReactNode } from "react";

type Tag = "div" | "section" | "li" | "span";

type RevealEagerProps = {
  children: ReactNode;
  /** Retardo en segundos (para escalonar hermanos), igual que en `Reveal`. */
  delay?: number;
  as?: Tag;
  /**
   * `true` en el elemento LCP (el titular del hero): sube igual pero SIN
   * fundido, porque Chrome descarta del LCP todo lo que se pinta con
   * `opacity: 0`. Ver el comentario de `reveal-slide` en globals.css.
   */
  lcp?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Versión sin JavaScript de `Reveal`, para lo que ya está en pantalla al cargar.
 *
 * `Reveal` es un componente de Framer Motion: arranca en `opacity: 0` y solo
 * llega a `opacity: 1` cuando el bundle de motion se descarga e hidrata. Para
 * el h1 del hero eso significaba que el elemento LCP no se pintaba hasta
 * después de la hidratación — 4,5 s de LCP en móvil con 4G lento en PageSpeed
 * (15-08-2026), contra 0,9 s de FCP.
 *
 * Aquí la misma animación (fade + 30px, 0.8s, misma curva) vive en CSS
 * (`reveal-in` en globals.css), así que empieza al parsear el HTML: el
 * resultado visual es idéntico y el pintado ya no depende de JS.
 *
 * Úsalo SOLO above-the-fold. Para lo que entra al hacer scroll sigue haciendo
 * falta `Reveal`, que espera al viewport con `whileInView`.
 */
export function RevealEager({
  children,
  delay = 0,
  as: Tag = "div",
  lcp = false,
  className,
  style,
}: RevealEagerProps) {
  const base = lcp ? "reveal-slide" : "reveal-in";

  return (
    <Tag
      className={className ? `${base} ${className}` : base}
      style={delay ? { ...style, animationDelay: `${delay}s` } : style}
    >
      {children}
    </Tag>
  );
}
