import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Countdown } from "@/components/ui/Countdown";
import { WaLink } from "@/components/ui/WaLink";
import { InterestLeadForm } from "@/components/forms/InterestLeadForm";
import { JsonLd, faqLd, orgRef } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ogImages } from "@/lib/seo";
import { site } from "@/lib/site";
import { founding } from "@/content/landing";
import { disciplinas, kickerPlazas, numeros, socioFundador as c } from "@/content/socio-fundador";
import { getFoundingSpots } from "@/lib/queries/founding";
import { barraPct, tieneAforo, type FoundingSpots } from "@/lib/founding-spots";

export const metadata: Metadata = {
  title: "Socio Fundador · 10 plazas a 85 €/mes",
  // 150–160 caracteres: por encima, Google corta la descripción en el SERP.
  description:
    "Socio fundador en NEXUS VNG (Vilanova i la Geltrú): todas las disciplinas regulares de tu nivel, de lunes a viernes, por 85 €/mes con la cuota bloqueada.",
  alternates: { canonical: "/socio-fundador" },
  openGraph: {
    title: "Socio Fundador de NEXUS VNG · 10 plazas a 85 €/mes",
    description:
      "Baila todos los días: las 8 disciplinas regulares de tu nivel o inferior por 85 €/mes, con la cuota bloqueada. Solo 10 plazas.",
    url: "/socio-fundador",
    images: ogImages,
  },
};

// ISR: la página es estática, pero el contador de plazas sale de `leads` y hay
// que refrescarlo. La Server Action que guarda un lead fundador ya revalida esta
// ruta al instante (src/lib/actions/leads.ts); esto es solo la red de seguridad.
export const revalidate = 3600;

/**
 * `Offer` de la plaza fundadora: el precio (85 €/mes) y la disponibilidad que
 * ya se anuncian en pantalla, declarados también en schema.org. Todos los
 * valores salen de `founding`/`precios`, no se escriben a mano: si mañana
 * cambia la cuota o se agotan las plazas, el schema cambia solo.
 */
function ofertaFundadoraLd(spots: FoundingSpots) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: "Plaza de socio fundador · NEXUS VNG",
    description: `Acceso a las ${numeros.disciplinas} disciplinas regulares de tu nivel o inferior, de lunes a viernes, con la cuota bloqueada mientras sigas de alta.`,
    url: `${site.url}/socio-fundador`,
    category: "Subscription",
    price: numeros.cuota,
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: numeros.cuota,
      priceCurrency: "EUR",
      // Cuota mensual: una unidad de referencia = 1 mes (unitCode UN/CEFACT "MON").
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
    },
    // Sin recuento fiable se declara solo la oferta, sin inventario: un
    // `inventoryLevel` inventado en el schema es la misma afirmación falsa que
    // en pantalla, y encima legible por máquinas.
    ...(tieneAforo(spots)
      ? {
          availability:
            spots.left > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          inventoryLevel: {
            "@type": "QuantitativeValue",
            value: spots.left,
            maxValue: spots.total,
          },
        }
      : {}),
    areaServed: { "@type": "City", name: site.locality },
    // Referencia al nodo de la escuela del layout raíz: una entidad, no dos.
    offeredBy: orgRef(),
  };
}

export default async function SocioFundadorPage() {
  const spots = await getFoundingSpots();
  const hasSpots = tieneAforo(spots);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero de venta: promesa + tarjeta de precio ─────────────── */}
        <section className="bg-bg-panel relative overflow-hidden border-b border-white/6 pt-[clamp(40px,7vw,76px)] pb-[clamp(48px,8vw,88px)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_20%_0%,rgba(113,233,201,.16),transparent_70%)]" />
          <div className="container-nexus relative z-[1]">
            <Breadcrumbs
              items={[
                { name: "Inicio", path: "/" },
                { name: "Socio fundador", path: "/socio-fundador" },
              ]}
            />
          </div>
          <div className="container-nexus relative z-[1] mt-6 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <Reveal
                as="span"
                className="border-neon-lime/40 bg-neon-lime/10 font-body text-neon-lime inline-block rounded-full border px-3.5 py-[7px] text-[11px] font-extrabold tracking-[0.14em] uppercase"
              >
                {c.hero.kicker}
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="font-display mt-4 max-w-[16ch] text-[clamp(40px,7.5vw,80px)] leading-[0.92] text-balance">
                  {c.hero.title} <span className="text-gradient-nexus">{c.hero.titleAccent}</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="font-body mt-5 max-w-[54ch] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-white/80">
                  {c.hero.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a
                    href="#reservar"
                    className="bg-neon font-body text-ink shadow-neon inline-flex min-h-12 items-center justify-center rounded-md px-7 py-[15px] text-base font-bold no-underline transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {c.hero.cta}
                  </a>
                  <WaLink
                    origin="founding"
                    variant="outline"
                    className="min-h-12 px-6 py-[14px] text-[15px]"
                  >
                    Preguntar por WhatsApp
                  </WaLink>
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="font-body mt-4 text-sm text-white/55">{c.hero.ctaNote}</p>
              </Reveal>
            </div>

            {/* Tarjeta de oferta: el bloque premium de la página. */}
            <Reveal
              delay={0.1}
              className="border-neon-lime/45 shadow-glow rounded-xl border-[1.5px] bg-[linear-gradient(180deg,#16161b,#0d0d10)] p-[clamp(24px,4vw,36px)]"
            >
              <div className="flex justify-center">
                <span className="border-neon-lime/40 bg-neon-lime/10 font-body text-neon-lime rounded-full border px-3.5 py-[7px] text-center text-[11px] font-extrabold tracking-[0.12em] uppercase">
                  {founding.badge}
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-center gap-2.5">
                <span className="font-display text-neon-mint text-[clamp(54px,9vw,76px)] leading-none">
                  {founding.price}
                </span>
                <span className="font-body text-[17px] text-white/65">/mes</span>
                {founding.priceOld && (
                  <span className="font-body text-[19px] text-white/40 line-through">
                    {founding.priceOld}
                  </span>
                )}
              </div>
              <p className="font-body mt-2 text-center text-[13px] text-white/60">
                Las {numeros.disciplinas} disciplinas regulares · de lunes a viernes · de tu nivel o
                inferior.
              </p>

              {/* Cuenta atrás: solo si hay fecha de cierre real. */}
              {founding.deadline && (
                <>
                  <div className="font-body mt-6 text-center text-xs font-semibold tracking-[0.05em] text-white/60 uppercase">
                    {founding.deadlineLabel}
                  </div>
                  <Countdown deadline={founding.deadline} />
                </>
              )}

              {hasSpots && (
                <div className="mt-6">
                  <div className="font-body mb-2 flex justify-between text-xs text-white/65">
                    <span>Plazas fundadoras</span>
                    <span>
                      Quedan {spots.left} / {spots.total}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-white/8"
                    role="img"
                    aria-label={`Quedan ${spots.left} de ${spots.total} plazas fundadoras`}
                  >
                    <div
                      className="from-neon-lime via-neon-mint to-neon h-full rounded-full bg-linear-to-r"
                      style={{ width: `${barraPct(spots.total - spots.left, spots.total)}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="font-body mt-6 text-center text-sm leading-relaxed text-white/70">
                {founding.urgencyNote}
              </p>

              <a
                href="#reservar"
                className="bg-neon-lime font-body text-ink shadow-glow mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md px-6 py-[16px] text-base font-bold no-underline transition-transform duration-200 hover:-translate-y-0.5"
              >
                {c.form.submitLabel}
              </a>
              <p className="font-body mt-3 text-center text-xs text-white/50">
                {founding.finePrint}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── La promesa explicada ───────────────────────────────────── */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus max-w-[820px]">
            <Reveal>
              <h2 className="font-display text-text-strong max-w-[22ch] text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.promesa.title}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="font-body text-text-muted mt-5 text-[clamp(15px,1.5vw,18px)] leading-relaxed">
                {c.promesa.body}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="font-body text-text-muted mt-4 text-[clamp(15px,1.5vw,18px)] leading-relaxed">
                {c.promesa.body2}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Las 8 disciplinas incluidas ────────────────────────────── */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus max-w-[900px] space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.incluye.title}
              </h2>
              <p className="font-body text-text-muted mt-3 max-w-[60ch] text-base leading-relaxed">
                {c.incluye.intro}
              </p>
            </Reveal>

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3">
              {disciplinas.map((d, idx) => (
                <Reveal
                  key={d}
                  delay={idx * 0.04}
                  className="border-neon-lime/20 bg-bg-base flex items-center gap-3 rounded-lg border px-4 py-4"
                >
                  <span aria-hidden="true" className="text-neon-lime text-lg leading-none">
                    ✓
                  </span>
                  <span className="font-display text-text-strong text-lg">{d}</span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.06} className="space-y-3">
              <p className="bg-bg-base font-body text-text-muted rounded-lg border border-white/8 p-5 text-[14px] leading-relaxed">
                {c.incluye.nivelNota}
              </p>
              <p className="font-body text-text-faint text-[13px] leading-relaxed">
                {c.incluye.fuera}
              </p>
              <p className="font-body text-text-faint text-[13px]">
                ¿Quieres ver a qué hora es cada una?{" "}
                <Link
                  href="/clases#horario"
                  className="text-neon font-semibold no-underline hover:underline"
                >
                  Mira el horario completo de la semana
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Beneficios ─────────────────────────────────────────────── */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Reveal>
              <h2 className="font-display text-text-strong max-w-[24ch] text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.beneficios.title}
              </h2>
              <p className="font-body text-text-muted mt-3 max-w-[58ch] text-base">
                {c.beneficios.intro}
              </p>
            </Reveal>
            <div className="mt-10 grid [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
              {c.beneficios.items.map((b, idx) => (
                <Reveal
                  key={b.n}
                  delay={idx * 0.05}
                  className="bg-bg-base shadow-soft rounded-lg border border-white/8 p-6"
                >
                  <div className={`font-display text-2xl font-bold ${b.accent}`}>{b.n}</div>
                  <h3 className="font-display text-text-strong mt-3 text-xl">{b.title}</h3>
                  <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">
                    {b.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── ¿Te sale a cuenta? Cualifica con números, no con humo ──── */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus max-w-[900px] space-y-8">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.cuandoSale.title}
              </h2>
              <p className="font-body text-text-muted mt-3 max-w-[58ch] text-base">
                {c.cuandoSale.intro}
              </p>
            </Reveal>

            {/* La tabla se desplaza dentro de su caja, nunca la página. */}
            <Reveal
              className="focus-visible:outline-neon overflow-x-auto"
              role="region"
              aria-label="Qué tarifa conviene según cuántos días vengas"
              tabIndex={0}
            >
              <table className="w-full min-w-[580px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="font-body text-text-faint px-3 py-3 text-[11px] font-bold tracking-wider uppercase">
                      Si vienes…
                    </th>
                    <th className="font-body text-text-faint px-4 py-3 text-[11px] font-bold tracking-wider uppercase">
                      Te conviene
                    </th>
                    <th className="font-body text-text-faint px-4 py-3 text-[11px] font-bold tracking-wider uppercase">
                      Por qué
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.cuandoSale.filas.map((f) => (
                    <tr key={f.perfil} className="border-b border-white/6">
                      <td className="font-body text-text-body px-3 py-4 text-[14px] font-semibold">
                        {f.perfil}
                      </td>
                      <td
                        className={`font-body px-4 py-4 text-[14px] font-bold ${
                          f.destacado ? "bg-neon-lime/8 text-neon-lime" : "text-text-muted"
                        }`}
                      >
                        {f.recomendado}
                      </td>
                      <td className="font-body text-text-muted px-4 py-4 text-[13px] leading-relaxed">
                        {f.nota}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="border-neon-lime/20 bg-neon-lime/5 rounded-lg border p-5">
                <p className="font-body text-text-body text-[15px] leading-relaxed">
                  <strong className="text-neon-lime">
                    Con 4 clases a la semana sale a {numeros.porClase4} € por clase.
                  </strong>{" "}
                  Y cuando se acaben las plazas, esa misma tarifa plana costará {numeros.flat} €/mes
                  — {numeros.flat - numeros.cuota} € más cada mes, para siempre.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── ¿Es para ti? ───────────────────────────────────────────── */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus max-w-[900px]">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.paraQuien.title}
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Reveal
                delay={0.06}
                className="border-neon-mint/25 bg-bg-panel shadow-soft rounded-lg border p-6"
              >
                <h3 className="font-display text-neon-mint text-xl">{c.paraQuien.si.title}</h3>
                <ul className="mt-4 list-none space-y-3 p-0">
                  {c.paraQuien.si.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="text-neon-mint mt-0.5 text-base leading-none"
                      >
                        ✓
                      </span>
                      <span className="font-body text-text-muted text-[14px] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal
                delay={0.12}
                className="bg-bg-panel shadow-soft rounded-lg border border-white/8 p-6"
              >
                <h3 className="font-display text-text-muted text-xl">{c.paraQuien.no.title}</h3>
                <ul className="mt-4 list-none space-y-3 p-0">
                  {c.paraQuien.no.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="text-text-faint mt-0.5 text-base leading-none"
                      >
                        ·
                      </span>
                      <span className="font-body text-text-muted text-[14px] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={0.18}>
              <p className="font-body text-text-faint mt-6 text-sm">
                ¿Vas a venir una o dos veces por semana?{" "}
                <Link
                  href="/clases#apuntarme"
                  className="text-neon font-semibold no-underline hover:underline"
                >
                  Apúntate a la mensualidad normal desde {numeros.una} €/mes
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Cómo se coge la plaza ──────────────────────────────────── */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Reveal>
              <h2 className="font-display text-text-strong text-[clamp(28px,4.4vw,46px)] leading-tight">
                {c.pasos.title}
              </h2>
            </Reveal>
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {c.pasos.items.map((p, idx) => (
                <Reveal
                  key={p.n}
                  delay={idx * 0.06}
                  className="bg-bg-panel shadow-soft rounded-lg border border-white/8 p-6"
                >
                  <span className="bg-neon/10 font-display text-neon inline-flex h-9 w-9 items-center justify-center rounded-full text-lg">
                    {p.n}
                  </span>
                  <h3 className="font-display text-text-strong mt-4 text-xl">{p.title}</h3>
                  <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">
                    {p.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Objeciones ─────────────────────────────────────────────── */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="mx-auto w-full max-w-[780px] px-[clamp(20px,5vw,56px)]">
            <Reveal
              as="span"
              className="font-body text-neon block text-xs font-bold tracking-[0.18em] uppercase"
            >
              Antes de decidir
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-text-strong mt-3.5 text-[clamp(30px,5vw,56px)] leading-[0.98]">
                Todo lo que sueles preguntar
              </h2>
            </Reveal>
            <Reveal delay={0.12} className="mt-[26px]">
              <Accordion items={[...c.faqs]} />
            </Reveal>
          </div>
        </section>

        {/* ── Formulario ─────────────────────────────────────────────── */}
        <section id="reservar" className="bg-bg-panel scroll-mt-24 py-[clamp(48px,8vw,96px)]">
          <div className="container-nexus grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <Reveal
                as="span"
                className="border-neon-lime/40 bg-neon-lime/10 font-body text-neon-lime inline-block rounded-full border px-3.5 py-[7px] text-[11px] font-extrabold tracking-[0.14em] uppercase"
              >
                {kickerPlazas(spots.left)}
              </Reveal>
              <Reveal delay={0.06}>
                <h2 className="font-display text-text-strong text-[clamp(30px,4.5vw,48px)] leading-tight">
                  {c.form.title}
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="font-body text-text-muted max-w-[52ch] text-base leading-relaxed">
                  {c.form.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="bg-bg-base rounded-lg border border-white/8 p-5">
                  <p className="font-body text-text-body text-[15px] leading-relaxed">
                    <strong className="text-neon-mint">{founding.price}/mes</strong>{" "}
                    <span className="text-text-faint line-through">{founding.priceOld}</span> · las{" "}
                    {numeros.disciplinas} disciplinas de tu nivel o inferior · de lunes a viernes ·
                    cuota bloqueada mientras sigas de alta.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="font-body text-text-muted text-sm">
                  {c.form.fallback}{" "}
                  <WaLink
                    origin="founding"
                    variant="outline"
                    showGlyph={false}
                    className="min-h-11 px-4 py-2 text-sm"
                  >
                    Escríbenos por WhatsApp
                  </WaLink>
                </p>
              </Reveal>
            </div>

            {/* Sin casillas de clases: la plaza las incluye todas, así que pedir
                que las marque una a una sería fricción sin ninguna utilidad. */}
            <Reveal
              delay={0.1}
              className="bg-bg-base shadow-card rounded-xl border border-white/8 p-6 sm:p-8"
            >
              <InterestLeadForm
                origen="socio-fundador"
                fixedIntereses={[c.form.interesFijo]}
                nivel={{ ...c.form.nivel, options: [...c.form.nivel.options] }}
                submitLabel={c.form.submitLabel}
              />
            </Reveal>
          </div>
        </section>

        <JsonLd data={faqLd([...c.faqs])} />
        <JsonLd data={ofertaFundadoraLd(spots)} />
      </main>
    </>
  );
}
