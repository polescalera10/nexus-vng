import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { mediaComunidad } from "@/content/media";
import { reviews, googleRating } from "@/content/landing";

/**
 * "El corazón son las personas": mosaico de fotos reales de clase.
 *
 * Estuvo desactivada de la home desde el rebrand porque el mosaico eran cuatro
 * placeholders a rayas. Vuelve con fotografía real de los intensivos de agosto
 * de 2026 (`content/media.ts`).
 *
 * Las reseñas siguen su propia regla: solo se pintan si `content/landing.ts`
 * trae reseñas REALES de Google. Mientras la lista esté vacía, la sección
 * enseña el mosaico y nada más — sin marcador visible y sin nota media
 * inventada (Directiva Omnibus).
 */
export function Comunidad() {
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

        {/* Badge de valoración: solo se pinta con la nota REAL de Google (ver content/landing.ts). */}
        {googleRating && (
          <Reveal delay={0.12} className="mt-[18px] inline-flex items-center gap-3 rounded-full border border-white/10 bg-bg-panel px-[18px] py-2.5 shadow-soft">
            <span className="font-display text-[26px] leading-none text-text-strong">{googleRating}</span>
            <span className="text-base tracking-[1px] text-star">★★★★★</span>
            <span className="font-body text-[13px] font-semibold text-text-muted">
              Reseñas reales en Google
            </span>
          </Reveal>
        )}

        {/* Mosaico. En escritorio: 3 columnas × 2 filas; la primera imagen es
            el ancla vertical de la izquierda (ocupa las dos filas) y las otras
            cuatro rellenan el 2×2 de la derecha — de ahí que `mediaComunidad`
            tenga que traer exactamente cinco. En móvil, dos columnas a secas. */}
        <Reveal delay={0.14} className="mt-[30px] grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mediaComunidad.map((img, i) => (
            <div
              key={img.src}
              className={`bg-bg-elevated overflow-hidden rounded-lg border border-white/8 ${
                i === 0 ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.ancho}
                height={img.alto}
                sizes="(max-width: 640px) 50vw, 33vw"
                className={`w-full object-cover transition-transform duration-500 hover:scale-[1.04] ${
                  i === 0 ? "aspect-[16/10] sm:aspect-auto sm:h-full" : "aspect-[4/5]"
                }`}
              />
            </div>
          ))}
        </Reveal>

        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
          {reviews.map((r, i) => (
            <Reveal
              key={r.name}
              delay={i * 0.08}
              className="flex flex-col rounded-lg border border-white/8 bg-bg-panel p-6 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-[11px]">
                  <span className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full font-body text-[17px] font-bold text-ink ${r.hue}`}>
                    {r.initial}
                  </span>
                  <div className="min-w-0">
                    <div className="font-body text-sm font-bold text-text-strong">{r.name}</div>
                    <div className="font-body text-xs text-text-faint">{r.date}</div>
                  </div>
                </div>
                <span className="flex-none rounded-full border border-white/12 px-[9px] py-1 font-body text-[11px] font-bold text-text-muted">
                  Google
                </span>
              </div>
              <div className="mt-3.5 text-[15px] tracking-[1px] text-star">★★★★★</div>
              <p className="mt-2.5 font-body text-[15px] leading-relaxed text-text-body">{r.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
