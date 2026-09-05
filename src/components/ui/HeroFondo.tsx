import { VideoLoop } from "@/components/ui/VideoLoop";
import { heroBanda } from "@/content/media";

/**
 * Fondo de las cabeceras que NO son el hero de la home: el mismo vídeo de clase
 * en su variante «banda» (ver `heroBanda`), con el velo oscuro que mantiene el
 * contraste del titular.
 *
 * Va aparte del `Hero` de la home a propósito. Aquel ocupa la pantalla entera,
 * lleva zoom lento y sus propias luces de club; aquí la franja mide unos 250 px
 * y lo único que hace falta es que el h1 se lea. Un componente para las dos
 * cosas acabaría siendo un puñado de flags.
 *
 * El `<section>` que lo contiene tiene que ser `relative overflow-hidden`, y el
 * contenido ir por encima con `relative z-[1]`.
 */
export function HeroFondo({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <VideoLoop
        fuente={{
          movil: { src: heroBanda.movil.src, poster: heroBanda.movil.poster },
          desktop: { src: heroBanda.desktop.src, poster: heroBanda.desktop.poster },
        }}
        alt=""
        ancho={heroBanda.desktop.ancho}
        alto={heroBanda.desktop.alto}
        sizes="100vw"
        className="absolute inset-0"
      />
      {/* Velo denso: debajo hay suelo blanco y focos, y encima va un titular
          con degradado de marca que necesita mantener el contraste AA. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.86)_0%,rgba(10,10,10,.76)_45%,rgba(10,10,10,.93)_100%)]" />
    </div>
  );
}
