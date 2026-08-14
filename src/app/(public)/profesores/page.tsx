import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Reveal } from "@/components/ui/Reveal";
import { WaLink } from "@/components/ui/WaLink";
import { clasesDe, modalidadesDe, profesores } from "@/content/profesores";

export const metadata: Metadata = {
  title: "Profesores de baile en Vilanova i la Geltrú",
  description:
    "Quién te va a dar clase en NEXUS VNG: qué baila cada profesor, qué días y con qué nivel. Elige con quién quieres empezar y reserva tu clase de prueba.",
  alternates: { canonical: "/profesores" },
  // Al compartir esta página sale la foto del equipo, no la imagen genérica.
  openGraph: {
    title: "Profesores de baile en Vilanova i la Geltrú",
    images: [
      {
        url: "/images/equipo-nexus.png",
        width: 921,
        height: 568,
        alt: "El equipo de profesores de NEXUS VNG",
      },
    ],
  },
};

/*
  Nombres, fotos y disciplinas del equipo viven en content/profesores.ts; las
  clases y las disciplinas se derivan del cartel de horarios.

  Decisión de layout (01-08-2026, a petición de Pol): la página no es un
  organigrama, es una ayuda a decidir. El alumno no llega preguntando "¿quiénes
  sois?" sino "¿con quién voy a bailar yo, qué día y si valgo para su grupo?".
  Por eso el equipo se presenta en bandas alternas a ancho completo —una por
  persona, con su horario real y un WhatsApp que ya lleva su nombre escrito— en
  vez de en una rejilla de tarjetas iguales, que obliga a comparar caras sin
  darte ningún dato para elegir.

  TODO: bio real de cada profesor. Hasta que Pol la pase, la ficha individual
  muestra solo lo verificable — nada de trayectorias ni titulaciones inventadas.
*/

/** Lo que puede esperar cualquier alumno, sea cual sea el grupo que elija. */
const PROMESAS = [
  {
    titulo: "Vengas con quien vengas, no vienes solo",
    texto:
      "Se rota con todo el grupo. No hace falta traer pareja — de hecho es la única forma real de aprender a guiar y a seguir con gente distinta.",
  },
  {
    titulo: "Tu grupo es de tu nivel, no de la media",
    texto:
      "Cada disciplina se abre desde cero absoluto, iniciación e intermedio. Si al probar el grupo se te queda corto o largo, se cambia: preferimos moverte a que te aburras.",
  },
  {
    titulo: "Alguien te corrige a ti, no a la sala",
    texto:
      "Se explica, se practica y se pasa por las parejas mirando peso, postura y tiempo. Varias clases van con dos profesores precisamente para que en el trabajo en pareja haya corrección por los dos lados.",
  },
];

export default function ProfesoresPage() {
  return (
    <SupportPage
      eyebrow="Quién te acompaña"
      title="Los profesores con los que vas a bailar"
      intro="Cinco personas, ocho disciplinas y grupos por nivel real. Mira quién da qué, qué día lo da, y escribe directamente a quien te encaje."
    >
      <div className="space-y-[clamp(64px,10vw,120px)]">
        {/* Bandas alternas, una por profesor: la foto manda y al lado va lo que
            el alumno necesita para decidir — qué baila, cuándo y cómo escribirle. */}
        <ul className="m-0 list-none space-y-[clamp(56px,8vw,104px)] p-0">
          {profesores.map((p, i) => {
            const disciplinas = modalidadesDe(p.nombre);
            const clases = clasesDe(p.nombre);
            const fotoPrimero = i % 2 === 0;

            return (
              <li key={p.slug}>
                {/* La columna de la foto mide siempre 0.85fr y la de texto 1fr:
                    al alternar el orden hay que invertir también las medidas,
                    o las bandas pares saldrían con la foto más ancha que las
                    impares y el ritmo de la página se rompe. */}
                <article
                  className={`grid items-center gap-[clamp(24px,4vw,56px)] ${
                    fotoPrimero
                      ? "md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
                      : "md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
                  }`}
                >
                  <Reveal
                    className={`bg-bg-elevated overflow-hidden rounded-xl ${
                      fotoPrimero ? "" : "md:order-2"
                    }`}
                  >
                    <Link href={`/profesores/${p.slug}`} className="group block">
                      <Image
                        src={p.foto}
                        alt={p.fotoAlt}
                        width={p.ancho}
                        height={p.alto}
                        sizes="(max-width: 768px) 100vw, 42vw"
                        className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    </Link>
                  </Reveal>

                  <Reveal delay={0.08} className="space-y-5">
                    <div>
                      <h2 className="font-display text-text-strong text-[clamp(34px,5.5vw,60px)] leading-[0.95]">
                        <Link
                          href={`/profesores/${p.slug}`}
                          className="hover:text-neon text-inherit no-underline transition-colors"
                        >
                          {p.nombre}
                        </Link>
                      </h2>
                      <p className="font-body text-text-body mt-2 max-w-[42ch] text-[clamp(16px,1.5vw,19px)] leading-relaxed">
                        {p.claim}
                      </p>
                    </div>

                    {clases.length > 0 && (
                      <div>
                        <h3 className="font-body text-text-muted text-[13px] font-bold">
                          Cuándo da clase
                        </h3>
                        <ul className="mt-2.5 flex list-none flex-wrap gap-2 p-0">
                          {clases.map((clase) => (
                            <li
                              key={clase.value}
                              className="border-white/12 bg-bg-panel font-body text-text-body rounded-full border px-3.5 py-2 text-[13px]"
                            >
                              <span className="text-text-strong font-semibold">{clase.estilo}</span>
                              <span className="text-text-faint"> · </span>
                              {clase.dia} {clase.hora}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <WaLink
                        origin="profesor"
                        extra={p.nombre}
                        variant="red"
                        className="min-h-12 px-6 py-[14px] text-[15px]"
                      >
                        Probar una clase con {p.nombre}
                      </WaLink>
                      <Link
                        href={`/profesores/${p.slug}`}
                        className="font-body text-text-muted hover:text-neon inline-flex min-h-12 items-center text-[14px] font-semibold no-underline transition-colors"
                      >
                        Ver su ficha completa →
                      </Link>
                    </div>

                    {/* text-muted, no text-faint: sobre el negro de marca,
                        text-faint se queda en ~1,9:1 de contraste — muy por
                        debajo del 4,5:1 que exige un texto de lectura. */}
                    {disciplinas.length > 0 && (
                      <p className="font-body text-text-muted text-[13px] leading-relaxed">
                        Imparte{" "}
                        {disciplinas.map((d, j) => (
                          <span key={d.slug}>
                            {j > 0 && ", "}
                            <Link
                              href={`/clases/${d.slug}`}
                              className="text-text-body hover:text-neon underline underline-offset-2 transition-colors"
                            >
                              {d.nombre}
                            </Link>
                          </span>
                        ))}
                        .
                      </p>
                    )}
                  </Reveal>
                </article>
              </li>
            );
          })}
        </ul>

        {/* Lo común a todos: va después del equipo, porque primero se elige
            persona y luego se confirma que la clase encaja. */}
        <section className="border-t border-white/8 pt-[clamp(40px,6vw,72px)]">
          <Reveal>
            <h2 className="font-display text-text-strong max-w-[22ch] text-balance text-[clamp(28px,4.2vw,48px)] leading-[1.05]">
              Da igual con cuál empieces
            </h2>
            <p className="font-body text-text-muted mt-4 max-w-[62ch] text-base leading-relaxed">
              Cambian los estilos y los días, no la forma de dar clase. Esto es lo que te vas a
              encontrar en cualquiera de los grupos.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-3">
            {PROMESAS.map((promesa, i) => (
              <Reveal key={promesa.titulo} delay={0.06 * i} className="space-y-2.5">
                <h3 className="font-display text-text-strong text-2xl leading-tight">
                  {promesa.titulo}
                </h3>
                <p className="font-body text-text-body text-[15px] leading-relaxed">
                  {promesa.texto}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-10">
            <p className="font-body text-text-muted max-w-[62ch] text-[15px] leading-relaxed">
              El nombre del profe de cada grupo está en la parrilla de la temporada, junto al estilo
              y la franja horaria, así que sabes con quién vas a bailar antes de escribirnos.{" "}
              <Link
                href="/horarios"
                className="text-neon font-semibold no-underline hover:underline"
              >
                Ver el horario completo →
              </Link>
            </p>
          </Reveal>
        </section>

        {/* Cierre: el equipo entero, y una última salida para quien no lo tenga claro. */}
        <section className="border-white/8 bg-bg-panel shadow-card overflow-hidden rounded-xl border">
          <Image
            src="/images/equipo-nexus.png"
            alt="El equipo de profesores de NEXUS VNG"
            width={921}
            height={568}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="h-auto w-full object-contain"
          />
          <div className="border-t border-white/8 p-[clamp(24px,4vw,40px)]">
            <h2 className="font-display text-text-strong text-[clamp(24px,3.4vw,36px)] leading-tight">
              ¿No sabes con quién empezar?
            </h2>
            <p className="font-body text-text-muted mt-3 max-w-[58ch] text-[15px] leading-relaxed">
              Es lo más normal del mundo. Dinos qué días puedes y si has bailado antes, y te
              proponemos el grupo y el profe que mejor te encajan.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <WaLink origin="pagina" contextual variant="red" className="min-h-12 px-7 py-[15px]">
                Que nos encarguemos nosotros
              </WaLink>
              <Link
                href="/clases"
                className="font-body text-text-muted hover:text-neon inline-flex min-h-12 items-center text-[14px] font-semibold no-underline transition-colors"
              >
                Mirar primero las disciplinas →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SupportPage>
  );
}
