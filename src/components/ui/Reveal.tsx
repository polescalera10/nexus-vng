"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";

type Tag = "div" | "section" | "li" | "span";

type RevealProps = HTMLAttributes<HTMLElement> & {
  /** Retardo en segundos (para escalonar hermanos). */
  delay?: number;
  as?: Tag;
};

/**
 * Entrada sutil al hacer scroll: fade + leve translateY.
 *
 * Antes esto era `motion.div` de Framer Motion con `whileInView`. La animación
 * es la misma, pero Framer costaba 110 KB de JavaScript (37 KB comprimidos) en
 * el bundle de la landing, y ese peso retrasaba el momento en el que la página
 * queda interactiva — que es justo lo que Lighthouse usa para estimar el LCP
 * en móvil. Un IntersectionObserver + la animación `reveal-in` de globals.css
 * hacen lo mismo con unas pocas líneas.
 *
 * Respeta `prefers-reduced-motion` por la regla global de `@layer base`, que
 * deja la duración en 0,001 ms: el elemento aparece directamente en su sitio.
 *
 * Para contenido que ya está en pantalla al cargar existe `RevealEager`, que
 * no necesita JavaScript en absoluto.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;

    const el = ref.current;
    if (!el) return;

    // Sin IntersectionObserver (navegadores muy viejos) se muestra sin más:
    // más vale enseñar el contenido que dejarlo invisible para siempre.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    /**
     * Framer usaba `amount: 0.2` (un 20% del elemento visible). Con un bloque
     * más alto que la pantalla ese 20% puede no alcanzarse nunca y el
     * contenido se quedaría oculto, así que en ese caso basta con que asome.
     */
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: tall ? 0 : 0.2, rootMargin: "0px 0px -7% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      {...rest}
      // El ref es genérico para los cuatro tags admitidos; todos son HTMLElement.
      ref={ref as React.RefObject<never>}
      className={[shown ? "reveal-in" : "reveal-pending", className].filter(Boolean).join(" ")}
      style={shown && delay ? { ...style, animationDelay: `${delay}s` } : style}
    >
      {children}
    </Tag>
  );
}
