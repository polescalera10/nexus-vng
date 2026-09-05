import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { HeroFondo } from "@/components/ui/HeroFondo";
import { HorarioSemanal } from "@/components/landing/HorarioSemanal";
import { Precios } from "@/components/landing/Precios";
import { InterestLeadForm } from "@/components/forms/InterestLeadForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, courseListLd } from "@/components/seo/JsonLd";
import { cursoRegularGrupos } from "@/content/horario-regular";
import { portadaAnchaModalidad } from "@/content/media";
import { getModalidades } from "@/lib/queries/modalidades";

export const metadata: Metadata = {
  title: "Clases de Baile · Curso Regular",
  // 150–160 caracteres: por encima, Google corta la descripción en el SERP.
  description:
    "Curso regular de baile en Vilanova i la Geltrú, temporada 26·27: salsa cubana, bachata, reggaetón y más, de lunes a viernes. Desde cero y desde 35 €/mes.",
  alternates: { canonical: "/clases" },
};

// Revalidar cada hora por si cambian las modalidades en Supabase.
export const revalidate = 3600;

const razones = [
  {
    n: "01",
    title: "Constancia que se nota",
    text: "Una clase suelta motiva; el curso regular transforma. Cada semana avanzas sobre lo anterior y en pocos meses bailas de verdad, no de milagro.",
    accent: "text-neon",
  },
  {
    n: "02",
    title: "Tu grupo, tu gente",
    text: "Vienes cada semana con las mismas caras. Llegas solo y a las pocas clases el finde ya empieza en la pista. La comunidad es el mejor motivo para no faltar.",
    accent: "text-neon-mint",
  },
  {
    n: "03",
    title: "Desde cero absoluto",
    text: "Grupos por nivel real, sin presión y sin ridículos. Empieces donde empieces, hay un hueco pensado para ti — y profes que te acompañan.",
    accent: "text-neon-lime",
  },
];

export default async function ClasesPage() {
  const modalidades = await getModalidades();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero de ventas */}
        <section className="bg-bg-panel relative overflow-hidden border-b border-white/6 pt-[clamp(48px,8vw,80px)] pb-[clamp(48px,8vw,88px)]">
          <HeroFondo />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgba(113,233,201,.12),transparent_70%)]" />
          <div className="container-nexus relative z-[1]">
            <Reveal
              as="span"
              className="font-body text-neon-mint block text-xs font-bold tracking-[0.18em] uppercase"
            >
              Curso regular · Temporada 26·27 · Vilanova i la Geltrú
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-display mt-3 max-w-[18ch] text-[clamp(40px,7vw,80px)] leading-[0.92] text-balance">
                Aprende a bailar y <span className="text-gradient-nexus">encuentra tu gente</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="font-body mt-5 max-w-[56ch] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-white/80">
                Salsa cubana, bachata, urbano y estilo, de lunes a viernes, con grupos desde cero
                absoluto. La mejor decisión de este año no es un propósito más: son dos horas a la
                semana para ti.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#apuntarme"
                  className="bg-neon font-body text-ink shadow-neon inline-flex items-center justify-center rounded-md px-7 py-[15px] text-base font-bold no-underline transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Quiero apuntarme
                </a>
                <span className="font-body text-sm text-white/60">
                  Desde 35 €/mes · sin presión, sin permanencia.
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Migas: declaran la jerarquía Inicio → Clases → disciplina, que hasta
            ahora solo existía en las fichas hijas. */}
        <div className="bg-bg-base pt-7">
          <div className="container-nexus">
            <Breadcrumbs
              items={[
                { name: "Inicio", path: "/" },
                { name: "Clases", path: "/clases" },
              ]}
            />
          </div>
        </div>

        {/* Por qué apuntarse */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Reveal>
              <h2 className="font-display text-text-strong max-w-[24ch] text-[clamp(28px,4vw,44px)] leading-tight">
                Por qué apuntarte es lo mejor que puedes hacer
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {razones.map((r, idx) => (
                <Reveal
                  key={r.n}
                  delay={idx * 0.06}
                  className="bg-bg-panel shadow-soft rounded-lg border border-white/8 p-6"
                >
                  <div className={`font-display text-2xl font-bold ${r.accent}`}>{r.n}</div>
                  <h3 className="font-display text-text-strong mt-3 text-xl">{r.title}</h3>
                  <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">
                    {r.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Estilos que puedes bailar (cards → detalle SEO) */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">
                Estilos que puedes bailar
              </h2>
              <p className="font-body text-text-muted mt-3 max-w-[60ch] text-base">
                Elige uno, combínalos o llévatelos todos con la tarifa plana. Entra en cualquiera
                para ver de qué va y a quién le encaja.
              </p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modalidades.map((m, idx) => {
                /* Foto solo de las disciplinas grabadas (content/media.ts). Las
                   demás se quedan con el degradado de marca en el mismo hueco:
                   así todas las tarjetas miden igual y la rejilla no cojea. */
                const portada = portadaAnchaModalidad(m.slug);

                return (
                  <Reveal
                    key={m.slug}
                    delay={idx * 0.05}
                    className="bg-bg-base shadow-soft hover:border-neon/30 hover:shadow-card flex flex-col justify-between overflow-hidden rounded-lg border border-white/8 transition-all duration-300 hover:-translate-y-1"
                  >
                    {portada ? (
                      <Image
                        src={portada.src}
                        alt={portada.alt}
                        width={portada.ancho}
                        height={portada.alto}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        className="bg-bg-elevated aspect-[4/3] w-full bg-[repeating-linear-gradient(135deg,rgba(48,228,236,.10)_0_14px,rgba(48,228,236,.03)_14px_28px)]"
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="font-display text-text-strong mb-2 text-2xl">{m.nombre}</h3>
                        <p className="font-body text-text-muted mb-6 text-[14px] leading-relaxed">
                          {m.descripcion}
                        </p>
                      </div>
                      {/* Anchor descriptivo, no "Ver más": el texto del enlace es
                          de lo poco que le dice a Google de qué va el destino. */}
                      <Link
                        href={`/clases/${m.slug}`}
                        className="font-body text-neon mt-auto inline-flex items-center text-sm font-bold no-underline hover:underline"
                      >
                        Clases de {m.nombre.toLowerCase()} &rarr;
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Horario de la temporada */}
        <section id="horario" className="bg-bg-base scroll-mt-24 py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">
                Horario de la temporada
              </h2>
              <p className="font-body text-text-muted mt-3 max-w-[60ch] text-base">
                De lunes a viernes, de 18:30 a 21:30. Elige tu estilo y tu franja; nosotros te
                ubicamos en el grupo de tu nivel.
              </p>
            </Reveal>

            {/* Fuente única de la parrilla: el mismo componente que usa
                /horarios. Antes este marcado estaba duplicado aquí. */}
            <HorarioSemanal />
          </div>
        </section>

        {/* Precios */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Precios />
          </div>
        </section>

        {/* Formulario */}
        <section id="apuntarme" className="bg-bg-base scroll-mt-24 py-[clamp(48px,8vw,96px)]">
          <div className="container-nexus grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <Reveal>
                <h2 className="font-display text-text-strong text-[clamp(30px,4.5vw,48px)] leading-tight">
                  Apúntate al curso
                </h2>
              </Reveal>
              <Reveal delay={0.06}>
                <p className="font-body text-text-muted max-w-[52ch] text-base leading-relaxed">
                  El formulario está ordenado por días, igual que el horario de arriba: busca el día
                  que te va bien y marca la clase. Te escribimos para confirmar tu grupo y resolver
                  cualquier duda antes de empezar.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="font-body text-text-muted text-sm">
                  ¿Prefieres preguntar antes?{" "}
                  <WaLink
                    origin="pagina"
                    contextual
                    variant="outline"
                    showGlyph={false}
                    className="px-4 py-2 text-sm"
                  >
                    Escríbenos por WhatsApp
                  </WaLink>
                </p>
              </Reveal>
            </div>

            <Reveal
              delay={0.1}
              className="bg-bg-panel shadow-card rounded-xl border border-white/8 p-6 sm:p-8"
            >
              <InterestLeadForm
                origen="curso-regular"
                groups={cursoRegularGrupos}
                submitLabel="Apuntarme al curso"
                interesesLabel="¿Qué día y qué clase?"
                interesesHelp="Marca todas las que quieras. Los números son el nivel: 0 = desde cero, 1 = iniciación, 2 = intermedio. Si no lo tienes claro, marca «Ayudadme a elegir» al final y lo vemos juntos."
              />
            </Reveal>
          </div>
        </section>
      </main>
      <JsonLd data={courseListLd(modalidades)} />
    </>
  );
}
