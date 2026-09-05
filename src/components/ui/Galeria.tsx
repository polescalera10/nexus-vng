import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { VideoLoop } from "@/components/ui/VideoLoop";
import type { MediaImagen, MediaVideo } from "@/content/media";

/**
 * Rejilla de fotogramas verticales (3:4), con un microvídeo opcional al frente.
 *
 * El material de la escuela está grabado en vertical con el móvil, así que la
 * rejilla es vertical también: recortar a apaisado tiraría media imagen. En
 * móvil van dos columnas; a partir de `sm`, una por elemento.
 *
 * Las imágenes son `loading="lazy"` (el defecto de next/image sin `priority`):
 * ninguna galería está above-the-fold.
 */
export function Galeria({
  imagenes,
  video,
  altVideo,
  className = "",
}: {
  imagenes: MediaImagen[];
  /** Bucle mudo que abre la galería. Si falta, solo se pintan las fotos. */
  video?: MediaVideo;
  altVideo?: string;
  className?: string;
}) {
  const celdas = imagenes.length + (video ? 1 : 0);
  if (celdas === 0) return null;

  // Una columna por celda en escritorio: la fila entera cabe sin huecos.
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[
    Math.min(Math.max(celdas, 2), 4) as 2 | 3 | 4
  ];
  const anchoCelda = `${Math.round(100 / celdas)}vw`;

  return (
    <ul className={`grid list-none grid-cols-2 gap-3 p-0 ${cols} ${className}`}>
      {video && (
        <Reveal as="li" className="bg-bg-elevated overflow-hidden rounded-lg border border-white/8">
          <VideoLoop
            fuente={{ src: video.src, poster: video.poster }}
            alt={altVideo ?? ""}
            ancho={video.ancho}
            alto={video.alto}
            sizes={`(max-width: 640px) 45vw, ${anchoCelda}`}
            className="relative aspect-[3/4] w-full"
          />
        </Reveal>
      )}
      {imagenes.map((img, i) => (
        <Reveal
          as="li"
          key={img.src}
          delay={((i + (video ? 1 : 0)) % 4) * 0.06}
          className="bg-bg-elevated overflow-hidden rounded-lg border border-white/8"
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.ancho}
            height={img.alto}
            sizes={`(max-width: 640px) 45vw, ${anchoCelda}`}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
          />
        </Reveal>
      ))}
    </ul>
  );
}
