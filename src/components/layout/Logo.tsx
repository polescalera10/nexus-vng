import Image from "next/image";
import Link from "next/link";

/**
 * Logo NEXUS (imagen oficial, public/images/nexus-logo.png, ratio ~2.13:1)
 * + wordmark "VNG". El PNG lleva el contorno negro integrado: sobre fondos
 * oscuros funciona directo; `onDark=false` queda para fondos claros puntuales.
 */
export function Logo({
  size = 34,
  onDark = true,
  priority = false,
}: {
  /** Alto del logo en px. */
  size?: number;
  onDark?: boolean;
  /**
   * Solo el logo de la cabecera. Estaba puesto fijo, así que el del pie —que
   * queda fuera de pantalla— también emitía su `<link rel="preload">`: dos
   * precargas compitiendo con lo que de verdad pinta el LCP.
   */
  priority?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-[10px] no-underline">
      <Image
        src="/images/nexus-logo.png"
        alt="NEXUS"
        width={Math.round(size * 2.13)}
        height={size}
        priority={priority}
        className="h-auto"
        style={{ width: Math.round(size * 2.13) }}
      />
      <span
        className={`font-body text-[10px] font-bold uppercase tracking-[0.3em] ${onDark ? "text-neon-mint" : "text-text-strong"}`}
      >
        VNG
      </span>
    </Link>
  );
}
