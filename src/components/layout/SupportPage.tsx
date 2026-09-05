import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroFondo } from "@/components/ui/HeroFondo";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Envoltorio de las páginas de soporte/SEO: cabecera sólida + banda de título
 * + contenedor de contenido. Mantiene una sola intención por página.
 */
export function SupportPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/6 bg-bg-panel pb-[clamp(40px,7vw,80px)] pt-[clamp(40px,7vw,72px)] text-white">
          <HeroFondo />
          {/* Luz cian lateral, muy tenue: separa la banda de título del fondo negro. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_100%,rgba(48,228,236,.08),transparent_70%)]" />
          <div className="container-nexus relative z-[1]">
            {eyebrow && (
              <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon-mint">
                {eyebrow}
              </Reveal>
            )}
            <Reveal delay={0.06}>
              <h1 className="mt-3 max-w-[20ch] text-balance font-display text-[clamp(36px,6vw,72px)] leading-[0.95]">
                <span className="text-gradient-nexus">{title}</span>
              </h1>
            </Reveal>
            {intro && (
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-[60ch] font-body text-[clamp(15px,1.4vw,18px)] leading-relaxed text-white/75">
                  {intro}
                </p>
              </Reveal>
            )}
          </div>
        </section>

        <div className="bg-bg-base py-[clamp(48px,8vw,96px)]">
          <div className="container-nexus">{children}</div>
        </div>
      </main>
    </>
  );
}

/** Caja de contenido placeholder para secciones aún sin desarrollar. */
export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-bg-elevated/60 p-8 font-body text-text-muted">
      {/* PLACEHOLDER: copy/imágenes con agente */}
      {children}
    </div>
  );
}
