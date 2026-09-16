import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ResenasGoogle } from "@/components/landing/ResenasGoogle";
import { mediaMosaico } from "@/content/media";
import type { ResenasGoogle as Resenas } from "@/lib/google-reviews";

/**
 * "El corazón son las personas": fotos reales de clase y, debajo, lo que dicen
 * los alumnos en Google. Caras y voces juntas, antes de profesores y precios,
 * que es donde quien no nos conoce decide si fiarse.
 *
 * El mosaico sale de los intensivos de agosto de 2026 (`content/media.ts`).
 * Las reseñas llegan de la ficha real vía Featurable (`lib/google-reviews.ts`);
 * sin ellas la sección enseña solo las fotos, sin marcador ni nota inventada
 * (Directiva Ómnibus).
 */
export function Comunidad({ resenas }: { resenas: Resenas | null }) {
  return (
    <section className="bg-bg-base py-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          El corazón
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3.5 max-w-[16ch] text-balance font-display text-[clamp(34px,5.5vw,66px)] leading-[0.98] text-text-strong">
            El corazón son las personas
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-[58ch] font-body text-base leading-relaxed text-text-muted">
            Fotos de clases reales de la escuela, en la sala de Vilanova. Ni banco de imágenes ni
            modelos: es la gente que viene cada semana.
          </p>
        </Reveal>

        {/* Mosaico: 15 teselas cuadradas y pequeñas. Antes eran 5 grandes y la
            sección se comía media pantalla; con muchas caras a la vez se dice
            lo mismo en un tercio de alto. 3 columnas en móvil, 5 desde `sm`. */}
        <Reveal delay={0.14} className="mt-[30px] grid grid-cols-3 gap-2 sm:grid-cols-5">
          {mediaMosaico.map((img) => (
            <div
              key={img.src}
              className="bg-bg-elevated overflow-hidden rounded-md border border-white/8"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.ancho}
                height={img.alto}
                sizes="(max-width: 640px) 33vw, 20vw"
                className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.06]"
              />
            </div>
          ))}
        </Reveal>

        {resenas && <ResenasGoogle datos={resenas} />}
      </div>
    </section>
  );
}
