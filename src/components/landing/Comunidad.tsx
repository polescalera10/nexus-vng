import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ResenasGoogle } from "@/components/landing/ResenasGoogle";
import { mediaMosaico } from "@/content/media";
import type { ResenasGoogle as Resenas } from "@/lib/google-reviews";
import { altEn } from "@/content/por-idioma";
import type { Locale } from "@/i18n/locales";
import { tComunidad } from "@/i18n/textos/inicio";

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
export function Comunidad({ resenas, locale = "es" }: { resenas: Resenas | null; locale?: Locale }) {
  const t = tComunidad[locale];
  return (
    <section className="bg-bg-base py-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          {t.kicker}
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3.5 max-w-[16ch] text-balance font-display text-[clamp(34px,5.5vw,66px)] leading-[0.98] text-text-strong">
            {t.titulo}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-[58ch] font-body text-base leading-relaxed text-text-muted">
            {t.texto}
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
                alt={altEn(img.src, img.alt, locale)}
                width={img.ancho}
                height={img.alto}
                sizes="(max-width: 640px) 33vw, 20vw"
                className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.06]"
              />
            </div>
          ))}
        </Reveal>

        {resenas && <ResenasGoogle datos={resenas} locale={locale} />}
      </div>
    </section>
  );
}
