import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { disciplinasRegulares } from "@/content/horario-regular";
import { site } from "@/lib/site";

/**
 * Intro local, justo debajo del hero.
 *
 * Desde el 14-08-2026 el `h1` del hero ya incluye "Escuela de baile en
 * Vilanova i la Geltrú" (va en el kicker, dentro del propio h1), así que este
 * `h2` no repite esa frase: cubre la variante por disciplina, que es como
 * busca la mayoría ("clases de salsa", "bachata en Vilanova"). De paso
 * responde en dos frases lo que un visitante nuevo necesita saber antes de
 * seguir bajando: qué es, dónde está y qué se baila.
 *
 * Las disciplinas salen del cartel real (`horario-regular.ts`), así que si
 * cambia la parrilla esta sección no se queda mintiendo.
 */
export function IntroLocal() {
  const disciplinas = disciplinasRegulares.join(", ").replace(/, ([^,]*)$/, " y $1");

  return (
    <section className="bg-ink py-[clamp(48px,7vw,88px)]">
      <div className="container-nexus">
        <Reveal>
          <h2 className="font-display text-text-strong max-w-[24ch] text-balance text-[clamp(28px,4.2vw,48px)] leading-[1.05]">
            Clases de salsa cubana y bachata en {site.locality}
          </h2>
          <div className="mt-5 max-w-[65ch] space-y-4">
            <p className="font-body text-text-body text-base leading-relaxed">
              {site.name} es la escuela de baile del {site.nap.venue}, en{" "}
              {site.locality} ({site.nap.addressRegion}). Clases de {disciplinas} en
              grupos por nivel real, de lunes a viernes, desde cero absoluto hasta avanzado.
            </p>
            <p className="font-body text-text-body text-base leading-relaxed">
              Se puede empezar sin pareja, sin experiencia y sin saber qué estilo te pega:{" "}
              <Link href="/clases" className="text-neon font-semibold underline underline-offset-2">
                mira las disciplinas
              </Link>
              ,{" "}
              <Link
                href="/horarios"
                className="text-neon font-semibold underline underline-offset-2"
              >
                consulta los horarios
              </Link>{" "}
              o escríbenos y te decimos qué grupo te encaja.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
