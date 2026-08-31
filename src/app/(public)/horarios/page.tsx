import type { Metadata } from "next";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { HorarioSemanal } from "@/components/landing/HorarioSemanal";
import { WaLink } from "@/components/ui/WaLink";
import { levels, modalidadesFallback } from "@/content/landing";
import { modalidadesContenido } from "@/content/modalidades";
import { diasSemana, horarioRegular, sesionesRegulares } from "@/content/horario-regular";

/**
 * Disciplinas del curso regular con sus clases reales, para la sección "Qué se
 * baila cada día". Cruza el cartel (`horario-regular`) con el mapa editorial
 * (`modalidades`), que es quien sabe qué estilos del cartel pertenecen a cada
 * página de disciplina. Si una disciplina no tiene clases esta temporada, no
 * aparece.
 */
const disciplinasConHorario = modalidadesFallback
  .map((m) => {
    const estilos = modalidadesContenido[m.slug]?.estilos ?? [];
    const sesiones = sesionesRegulares.filter((s) =>
      estilos.includes(s.estilo.replace(/\s+\d+$/, "").trim()),
    );
    return {
      slug: m.slug,
      nombre: m.nombre,
      sesiones,
      profes: [...new Set(sesiones.map((s) => s.profes))],
    };
  })
  .filter((d) => d.sesiones.length > 0);

/* Datos derivados del cartel oficial (nada escrito a mano aquí). */
const primeraFranja = horarioRegular[0]?.hora ?? "";
const ultimaFranja = horarioRegular[horarioRegular.length - 1]?.hora ?? "";
const primerDia = diasSemana[0] ?? "";
const ultimoDia = diasSemana[diasSemana.length - 1] ?? "";
const totalClases = sesionesRegulares.length;

export const metadata: Metadata = {
  title: "Horarios de clases de baile en Vilanova",
  // ≤155 caracteres: por encima, el SERP la corta a mitad de frase.
  description: `Horario del curso regular 26·27 en Vilanova i la Geltrú: salsa cubana, bachata, reparto, reggaetón y heels, de lunes a viernes de ${primeraFranja} a ${ultimaFranja}.`,
  alternates: { canonical: "/horarios" },
};

export default function HorariosPage() {
  return (
    <SupportPage
      eyebrow={`Temporada 26·27 · ${primerDia} a ${ultimoDia}`}
      title="Horarios"
      intro={`${totalClases} clases a la semana, de ${primerDia.toLowerCase()} a ${ultimoDia.toLowerCase()} en franjas de tarde-noche. Busca tu día, mira qué se baila y escríbenos: te ubicamos en el grupo de tu nivel.`}
    >
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Horarios", path: "/horarios" },
          ]}
        />
      </div>
      <div className="space-y-[clamp(48px,7vw,80px)]">
        {/* Parrilla real de la temporada — misma fuente que /clases. */}
        <section className="space-y-6">
          <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">
            Parrilla de la temporada 26·27
          </h2>
          <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">
            De {primerDia.toLowerCase()} a {ultimoDia.toLowerCase()}, de {primeraFranja} a{" "}
            {ultimaFranja}, en la sala del Gimnasio Aranha de Vilanova i la Geltrú. Cada casilla es
            una clase fija cada semana, con el mismo grupo y los mismos profes.
          </p>

          <HorarioSemanal />

          <p className="font-body text-text-muted max-w-[65ch] text-[15px] leading-relaxed">
            ¿Quieres saber de qué va cada estilo antes de elegir?{" "}
            <Link href="/clases" className="text-neon font-semibold no-underline hover:underline">
              Entra en el curso regular
            </Link>{" "}
            y abre la disciplina que te llame. Allí mismo tienes{" "}
            <Link
              href="/clases#apuntarme"
              className="text-neon font-semibold no-underline hover:underline"
            >
              las tarifas y el formulario de inscripción
            </Link>{" "}
            ordenado por días, igual que esta tabla.
          </p>
        </section>

        {/* Qué se baila cada día, por disciplina.
            Dos motivos: la parrilla es una tabla y casi no deja texto que
            indexar (esta página tenía 482 palabras siendo la quinta más
            enlazada del sitio), y las fichas de disciplina solo recibían
            enlaces del menú — aquí entran desde el cuerpo y con anchor
            descriptivo. Todo sale del cartel: no hay días ni horas a mano. */}
        <section className="space-y-6">
          <h2 className="font-display text-text-strong text-[clamp(28px,4vw,44px)]">
            Qué se baila cada día
          </h2>
          <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">
            Estas son las disciplinas del curso regular y los días que tiene cada una. Entra en
            cualquiera para ver de qué va, qué se aprende y quién la imparte.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {disciplinasConHorario.map((d) => (
              <div
                key={d.slug}
                className="border-white/8 bg-bg-panel shadow-soft rounded-lg border p-5"
              >
                <h3 className="font-display text-text-strong text-2xl">
                  <Link
                    href={`/clases/${d.slug}`}
                    className="text-inherit no-underline transition-colors hover:text-neon"
                  >
                    Clases de {d.nombre.toLowerCase()}
                  </Link>
                </h3>
                <p className="font-body text-text-muted mt-2 text-[14px] leading-relaxed">
                  {d.sesiones
                    .map((s) => `${s.dia} ${s.hora}${s.nivel ? ` (${s.nivel})` : ""}`)
                    .join(" · ")}
                </p>
                <p className="font-body text-text-faint mt-2 text-[13px]">
                  Con {d.profes.join(", ")}.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Niveles + CTA */}
        <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <h2 className="font-display text-text-strong text-3xl">Grupos por nivel real</h2>
            <p className="font-body text-text-body max-w-[65ch] text-base leading-relaxed">
              Cada disciplina se organiza en grupos por nivel, para que avances a tu ritmo y nunca
              te sientas ni perdido ni frenado. En la parrilla, el número que acompaña al estilo es
              justo eso: <strong className="text-text-strong">0</strong> es desde cero absoluto,{" "}
              <strong className="text-text-strong">1</strong> iniciación y{" "}
              <strong className="text-text-strong">2</strong> intermedio. Los estilos sin número
              tienen un solo grupo abierto.
            </p>
            <ul className="space-y-3">
              {levels.map((l) => (
                <li key={l.n} className="flex items-center gap-4">
                  <span className="font-display text-neon-mint text-2xl">{l.n}</span>
                  <span className="font-body text-text-strong text-[15px] font-semibold">
                    {l.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="font-body text-text-muted max-w-[65ch] text-[15px] leading-relaxed">
              Si no sabes dónde encajas, no pasa nada: nos cuentas qué llevas bailado y te
              proponemos el grupo. Si al probar vemos que te queda corto o largo, se ajusta.
            </p>
          </div>

          <aside className="bg-bg-panel shadow-card h-fit rounded-lg border border-white/8 p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-text-strong text-2xl">Encuentra tu hueco</h2>
            <p className="font-body text-text-muted mt-2 text-[15px]">
              Dinos qué días puedes y qué te apetece bailar, y te decimos qué grupos de la parrilla
              encajan con tu agenda.
            </p>
            <WaLink origin="pagina" contextual variant="red" className="mt-4 w-full py-[15px]">
              Consultar horarios
            </WaLink>
            <p className="font-body text-text-faint mt-3 text-[13px]">
              La parrilla es la de la temporada 26·27. Si un grupo se llena o cambia de franja, te
              lo decimos al escribirnos.
            </p>
          </aside>
        </section>
      </div>
    </SupportPage>
  );
}
