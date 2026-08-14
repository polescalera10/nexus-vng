import type { Metadata } from "next";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { HorarioSemanal } from "@/components/landing/HorarioSemanal";
import { WaLink } from "@/components/ui/WaLink";
import { levels } from "@/content/landing";
import { diasSemana, horarioRegular, sesionesRegulares } from "@/content/horario-regular";

/* Datos derivados del cartel oficial (nada escrito a mano aquí). */
const primeraFranja = horarioRegular[0]?.hora ?? "";
const ultimaFranja = horarioRegular[horarioRegular.length - 1]?.hora ?? "";
const primerDia = diasSemana[0] ?? "";
const ultimoDia = diasSemana[diasSemana.length - 1] ?? "";
const totalClases = sesionesRegulares.length;

export const metadata: Metadata = {
  title: "Horarios de clases de baile en Vilanova",
  description: `Horario del curso regular 26·27 de NEXUS VNG en Vilanova i la Geltrú: salsa cubana, bachata, reparto, reggaetón y heels, de lunes a viernes de ${primeraFranja} a ${ultimaFranja}.`,
  alternates: { canonical: "/horarios" },
};

export default function HorariosPage() {
  return (
    <SupportPage
      eyebrow={`Temporada 26·27 · ${primerDia} a ${ultimoDia}`}
      title="Horarios"
      intro={`${totalClases} clases a la semana, de ${primerDia.toLowerCase()} a ${ultimoDia.toLowerCase()} en franjas de tarde-noche. Busca tu día, mira qué se baila y escríbenos: te ubicamos en el grupo de tu nivel.`}
    >
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
