import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/i18n/locales";
import { tProfesores } from "@/i18n/textos/inicio";

export function Profesores({ locale = "es" }: { locale?: Locale }) {
  const t = tProfesores[locale];
  return (
    <section className="bg-bg-panel py-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-center gap-[clamp(24px,4vw,56px)]">
          <Reveal>
            {/* Recorte con fondo transparente: object-contain sobre el panel, no
                cover — recortarlo cortaría cabezas en móvil. */}
            <div className="bg-bg-elevated relative overflow-hidden rounded-xl">
              {/* `sizes`: el grid son 2 columnas dentro de container-nexus (máx.
                  1180px), así que por encima de 1180px la imagen nunca pasa de
                  ~590px. Con "50vw" a secas el navegador pedía la variante de
                  750px para pintarla a 507px (PageSpeed, 15-08-2026). */}
              <Image
                src="/images/equipo-nexus.png"
                alt={t.alt}
                width={921}
                height={568}
                sizes="(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 590px"
                className="h-auto w-full object-contain"
              />
            </div>
          </Reveal>

          <div>
            <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
              {t.kicker}
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-3.5 max-w-[16ch] text-balance font-display text-[clamp(32px,5vw,58px)] leading-[0.98] text-text-strong">
                {t.titulo}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-[18px] max-w-[54ch] font-body text-[clamp(16px,1.4vw,19px)] leading-[1.65] text-text-body">
                {t.texto}
              </p>
            </Reveal>
            <Reveal delay={0.18} className="mt-[22px] flex flex-wrap gap-2.5">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-bg-elevated px-[17px] py-[11px] font-body text-[13px] font-semibold text-text-body"
                >
                  {tag}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
