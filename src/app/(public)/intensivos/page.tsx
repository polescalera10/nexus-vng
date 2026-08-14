import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { InterestLeadForm } from "@/components/forms/InterestLeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { site } from "@/lib/site";
import { intensivos, intensivosGrupos } from "@/content/intensivos";

export const metadata: Metadata = {
  // ≤60 caracteres contando el sufijo " · NEXUS VNG" de la plantilla del layout.
  title: "Intensivos de baile en Vilanova i la Geltrú",
  description:
    "Ocho intensivos de baile en agosto de 2026 en Vilanova i la Geltrú: salsa, bachata, reparto, heels y más. Dos semanas, un estilo cada día.",
  alternates: { canonical: "/intensivos" },
};

/** Año de la edición vigente de los intensivos (cartel de agosto). */
const ANYO = 2026;

/**
 * Península en agosto = horario de verano (CEST). Todas las sesiones caen en
 * agosto, así que el desfase es constante; si algún día hubiera intensivos de
 * invierno habría que derivarlo del mes.
 */
const OFFSET = "+02:00";

const MESES: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

/**
 * "17 agosto" + "19:30 – 21:30" → fechas ISO reales de inicio y fin.
 * Devuelve `null` si el dato no se puede interpretar: preferimos no emitir
 * schema antes que emitir una fecha inventada.
 */
function fechasSesion(fecha: string, hora: string): { start: string; end: string } | null {
  const [diaTxt = "", mesTxt = ""] = fecha.trim().split(/\s+/);
  const mes = MESES[mesTxt.toLowerCase()];
  const dia = Number(diaTxt);
  if (!mes || !Number.isFinite(dia)) return null;

  const [inicio, fin] = hora.split(/[–-]/).map((h) => h.trim());
  if (!inicio || !fin) return null;

  const dd = String(dia).padStart(2, "0");
  return {
    start: `${ANYO}-${mes}-${dd}T${inicio}:00${OFFSET}`,
    end: `${ANYO}-${mes}-${dd}T${fin}:00${OFFSET}`,
  };
}

/** Lugar común a todas las sesiones (NAP único de lib/site). */
const lugar = {
  "@type": "Place",
  name: `${site.name} · ${site.nap.venue}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.nap.streetAddress || undefined,
    addressLocality: site.nap.addressLocality,
    addressRegion: site.nap.addressRegion,
    postalCode: site.nap.postalCode,
    addressCountry: site.nap.addressCountry,
  },
};

/**
 * Un `Event` por sesión con su `startDate` real. Son ocho fechas concretas y
 * hasta ahora no se declaraba ninguna. Sin precio: los intensivos no tienen
 * tarifa publicada y no se inventa.
 */
function intensivosLd() {
  return {
    "@context": "https://schema.org",
    "@graph": intensivos.flatMap((semana) =>
      semana.sesiones.flatMap((s) => {
        const fechas = fechasSesion(s.fecha, s.hora);
        if (!fechas) return [];
        return [
          {
            "@type": "Event",
            name: `Intensivo de ${s.estilo}${s.nivel ? ` · ${s.nivel}` : ""} en Vilanova i la Geltrú`,
            description: s.desc,
            startDate: fechas.start,
            endDate: fechas.end,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            inLanguage: "es-ES",
            url: `${site.url}/intensivos`,
            location: lugar,
            organizer: { "@type": "DanceSchool", name: site.name, url: site.url },
          },
        ];
      }),
    ),
  };
}

const beneficios = [
  {
    n: "01",
    title: "Aprende rápido, de una sentada",
    text: "Dos horas por sesión centradas en un solo estilo. Concentras el aprendizaje y sales bailando de verdad, no con la teoría a medias.",
    accent: "text-neon",
  },
  {
    n: "02",
    title: "Prueba antes de decidir",
    text: "¿No sabes qué estilo es para ti? Cada día uno distinto. Descúbrelos sin comprometerte a un curso entero.",
    accent: "text-neon-mint",
  },
  {
    n: "03",
    title: "Sin verano perdido",
    text: "Agosto no tiene por qué ser un parón. Muévete, conoce gente y llega a septiembre con el cuerpo activado y una comunidad nueva.",
    accent: "text-neon-lime",
  },
];

export default function IntensivosPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/6 bg-bg-panel pb-[clamp(48px,8vw,88px)] pt-[clamp(48px,8vw,80px)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(48,228,236,.12),transparent_70%)]" />
          <div className="container-nexus relative z-[1]">
            <Breadcrumbs
              items={[
                { name: "Inicio", path: "/" },
                { name: "Intensivos", path: "/intensivos" },
              ]}
            />
            <Reveal
              as="span"
              className="mt-5 block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon-mint"
            >
              Nexus VNG · Vilanova i la Geltrú
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-3 max-w-[19ch] text-balance font-display text-[clamp(38px,6.5vw,76px)] leading-[0.94]">
                Intensivos de baile <span className="text-gradient-nexus">agosto 2026</span> en
                Vilanova i la Geltrú
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-[54ch] font-body text-[clamp(16px,1.6vw,20px)] leading-relaxed text-white/80">
                Dos semanas, ocho estilos, un intensivo cada día de 19:30 a 21:30. Ven a por el que
                te llama —o a por todos— y aprovecha agosto para desbloquear tu baile.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#reservar"
                  className="inline-flex items-center justify-center rounded-md bg-neon px-7 py-[15px] font-body text-base font-bold text-ink shadow-neon transition-transform duration-200 hover:-translate-y-0.5 no-underline"
                >
                  Reservar mi plaza
                </a>
                <span className="font-body text-sm text-white/60">
                  Plazas limitadas por aforo de sala.
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Por qué */}
        <section className="bg-bg-base py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus">
            <Reveal>
              <h2 className="max-w-[22ch] font-display text-[clamp(28px,4vw,44px)] leading-tight text-text-strong">
                Un intensivo hace en dos horas lo que otros meses no logran
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {beneficios.map((b, idx) => (
                <Reveal
                  key={b.n}
                  delay={idx * 0.06}
                  className="rounded-lg border border-white/8 bg-bg-panel p-6 shadow-soft"
                >
                  <div className={`font-display text-2xl font-bold ${b.accent}`}>{b.n}</div>
                  <h3 className="mt-3 font-display text-xl text-text-strong">{b.title}</h3>
                  <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">
                    {b.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Sesiones por semana */}
        <section className="bg-bg-panel py-[clamp(48px,8vw,88px)]">
          <div className="container-nexus space-y-12">
            <Reveal>
              <h2 className="font-display text-[clamp(28px,4vw,44px)] text-text-strong">
                El calendario, día a día
              </h2>
              <p className="mt-3 max-w-[60ch] font-body text-base text-text-muted">
                Cada sesión es independiente: apúntate a las que te interesen. Todas de 19:30 a
                21:30.
              </p>
            </Reveal>

            {intensivos.map((semana) => (
              <div key={semana.label} className="space-y-6">
                <Reveal className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/8 pb-3">
                  <h3 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-neon">
                    {semana.label}
                  </h3>
                  <span className="font-body text-sm text-text-muted">{semana.rango}</span>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2">
                  {semana.sesiones.map((s, idx) => (
                    <Reveal
                      key={s.value}
                      delay={idx * 0.05}
                      className="flex gap-4 rounded-lg border border-white/8 bg-bg-base p-5 shadow-soft transition-colors hover:border-neon/30"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-sm bg-bg-elevated px-2 py-2 text-center">
                        <span className="font-body text-[11px] font-bold uppercase tracking-wide text-neon-mint">
                          {s.dia.split(" ")[0]}
                        </span>
                        <span className="font-display text-2xl leading-none text-text-strong">
                          {s.dia.split(" ")[1]}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-xl text-text-strong">{s.estilo}</h4>
                          {s.nivel && (
                            <span className="rounded-full border border-neon/40 px-2 py-0.5 font-body text-[11px] font-bold text-neon">
                              {s.nivel}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-body text-[13px] text-text-muted">
                          {s.profes} · {s.hora}
                        </p>
                        <p className="mt-2 font-body text-[14px] leading-relaxed text-text-body">
                          {s.desc}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulario */}
        <section id="reservar" className="scroll-mt-24 bg-bg-base py-[clamp(48px,8vw,96px)]">
          <div className="container-nexus grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <Reveal>
                <h2 className="font-display text-[clamp(30px,4.5vw,48px)] leading-tight text-text-strong">
                  Reserva tu plaza en los intensivos
                </h2>
              </Reveal>
              <Reveal delay={0.06}>
                <p className="max-w-[52ch] font-body text-base leading-relaxed text-text-muted">
                  Marca los intensivos que te interesen y déjanos tus datos. Te confirmamos plaza y
                  te contamos todo lo que necesitas. Las plazas son limitadas por el aforo de la
                  sala.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="font-body text-sm text-text-muted">
                  ¿Prefieres preguntar antes?{" "}
                  <WaLink origin="pagina" contextual variant="outline" showGlyph={false} className="px-4 py-2 text-sm">
                    Escríbenos por WhatsApp
                  </WaLink>
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="rounded-xl border border-white/8 bg-bg-panel p-6 shadow-card sm:p-8">
              <InterestLeadForm
                origen="intensivos"
                groups={intensivosGrupos}
                submitLabel="Reservar mi plaza"
              />
            </Reveal>
          </div>
        </section>

        <JsonLd data={intensivosLd()} />
      </main>
    </>
  );
}
