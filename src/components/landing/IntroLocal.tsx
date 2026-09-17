import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { disciplinasRegulares } from "@/content/horario-regular";
import { site } from "@/lib/site";
import { enlace } from "@/i18n/rutas";
import type { Locale } from "@/i18n/locales";
import { tIntro } from "@/i18n/textos/inicio";
import { tEstilo } from "@/i18n/textos/comun";

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
export function IntroLocal({ locale = "es" }: { locale?: Locale }) {
  const t = tIntro[locale];
  const disciplinas = disciplinasRegulares
    .map(tEstilo[locale].estilo)
    .join(", ")
    .replace(/, ([^,]*)$/, ` ${t.y} $1`);

  return (
    <section className="bg-ink py-[clamp(48px,7vw,88px)]">
      <div className="container-nexus">
        <Reveal>
          <h2 className="font-display text-text-strong max-w-[24ch] text-balance text-[clamp(28px,4.2vw,48px)] leading-[1.05]">
            {t.titulo(site.locality)}
          </h2>
          <div className="mt-5 max-w-[65ch] space-y-4">
            <p className="font-body text-text-body text-base leading-relaxed">
              {t.p1({
                nombre: site.name,
                local: site.nap.venue,
                localidad: site.locality,
                region: site.nap.addressRegion,
                disciplinas,
              })}
            </p>
            <p className="font-body text-text-body text-base leading-relaxed">
              {t.p2Antes}{" "}
              <Link href={enlace("/clases", locale)} className="text-neon font-semibold underline underline-offset-2">
                {t.verDisciplinas}
              </Link>
              ,{" "}
              <Link
                href={enlace("/horarios", locale)}
                className="text-neon font-semibold underline underline-offset-2"
              >
                {t.verHorarios}
              </Link>{" "}
              {t.p2Despues}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
