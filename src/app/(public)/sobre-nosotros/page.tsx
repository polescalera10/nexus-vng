import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { WaLink } from "@/components/ui/WaLink";
import {
  diasSemana,
  disciplinasRegulares,
  gruposCompania,
  horarioRegular,
  sesionesRegulares,
} from "@/content/horario-regular";
import { mediaSobreNosotros } from "@/content/media";
import { precios } from "@/content/precios";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "La escuela de baile del gimnasio Aranha en Vilanova i la Geltrú: diez disciplinas, grupos por nivel real y una comunidad que sigue fuera de clase.",
  alternates: { canonical: "/sobre-nosotros" },
};

/* Cifras derivadas del cartel oficial — ninguna escrita a mano. */
const primerDia = (diasSemana[0] ?? "").toLowerCase();
const ultimoDia = (diasSemana[diasSemana.length - 1] ?? "").toLowerCase();
const primeraFranja = horarioRegular[0]?.hora ?? "";
const ultimaFranja = horarioRegular[horarioRegular.length - 1]?.hora ?? "";
const totalClases = sesionesRegulares.length;

export default function SobreNosotrosPage() {
  return (
    <SupportPage
      eyebrow="Quiénes somos"
      title="Más que una escuela, una comunidad"
      intro="Dentro del gimnasio Aranha de Vilanova i la Geltrú, con marca propia y un público distinto: calidez, pertenencia y baile."
    >
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Sobre nosotros", path: "/sobre-nosotros" },
          ]}
        />
      </div>
      <div className="max-w-[68ch] space-y-[clamp(36px,5vw,52px)]">
        <section className="space-y-4">
          <h2 className="font-display text-text-strong text-[clamp(26px,3.6vw,38px)]">
            Dónde nace NEXUS VNG
          </h2>
          <p className="font-body text-text-body text-base leading-relaxed">
            NEXUS VNG nace dentro del gimnasio Aranha, en Vilanova i la Geltrú. Misma casa, otra
            energía: donde el gimnasio entrena cuerpos, la escuela junta personas. Compartimos
            techo, pero no público ni forma de trabajar — de ahí que la escuela tenga nombre, marca
            y horario propios.
          </p>
          {/* Foto real de la sala. Ver content/media.ts: todo el material sale
              de grabaciones de clases de la escuela. */}
          <figure className="bg-bg-elevated overflow-hidden rounded-lg border border-white/8">
            <Image
              src={mediaSobreNosotros.sala.src}
              alt={mediaSobreNosotros.sala.alt}
              width={mediaSobreNosotros.sala.ancho}
              height={mediaSobreNosotros.sala.alto}
              sizes="(max-width: 768px) 100vw, 68ch"
              className="aspect-[16/10] w-full object-cover"
            />
          </figure>
          <p className="font-body text-text-body text-base leading-relaxed">
            Nacer dentro de un gimnasio también marca el carácter de la escuela: aquí se viene a
            entrenar algo, con constancia y progresión, no a pasar una tarde suelta. Solo que lo
            que se entrena, además del cuerpo, es la soltura y la gente con la que la practicas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-text-strong text-[clamp(26px,3.6vw,38px)]">
            Qué se baila aquí
          </h2>
          <p className="font-body text-text-body text-base leading-relaxed">
            La temporada 26·27 son {totalClases} clases a la semana, de {primerDia} a {ultimoDia},
            entre las {primeraFranja} y las {ultimaFranja}. En total,{" "}
            {disciplinasRegulares.length} disciplinas regulares:
          </p>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-2">
            {disciplinasRegulares.map((d) => (
              <li
                key={d}
                className="bg-bg-panel font-body text-text-strong rounded-sm border border-white/8 px-4 py-3 text-[15px] font-semibold"
              >
                {d}
              </li>
            ))}
          </ul>
          <p className="font-body text-text-body text-base leading-relaxed">
            Salsa cubana y bachata son la columna vertebral de la escuela —son las que más grupos
            y más niveles abiertos tienen— y alrededor crecen el estilo urbano y el trabajo de
            estilo individual. Entre ellas hay{" "}
            {gruposCompania.length} grupos de compañía para quien quiera llevar el baile al
            escenario: se entra por audición, pero cuentan como una clase más de la semana.
          </p>
          <p className="font-body text-text-muted text-[15px] leading-relaxed">
            <Link href="/clases" className="text-neon font-semibold no-underline hover:underline">
              Ver todas las disciplinas
            </Link>{" "}
            ·{" "}
            <Link href="/horarios" className="text-neon font-semibold no-underline hover:underline">
              Ver la parrilla de la temporada
            </Link>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-text-strong text-[clamp(26px,3.6vw,38px)]">
            Cómo damos clase
          </h2>
          <p className="font-body text-text-body text-base leading-relaxed">
            Grupos por nivel real, desde cero absoluto hasta avanzado. En la parrilla, el número que
            acompaña al estilo es el nivel del grupo: 0 es no haber bailado nunca, 1 iniciación, 2
            intermedio. No mezclamos a quien lleva años con quien viene por primera vez, porque esa
            mezcla es justo lo que hace que la gente lo deje.
          </p>
          <p className="font-body text-text-body text-base leading-relaxed">
            Cada grupo tiene su clase fija cada semana, con las mismas caras. Se rota entre parejas,
            así que no hace falta venir acompañado —la mayoría viene sola— y se corrige de forma
            individual: peso, postura, tiempo. Varias clases se imparten con dos profesores a la
            vez para que en el trabajo en pareja haya corrección por los dos lados.
          </p>
          <p className="font-body text-text-body text-base leading-relaxed">
            Somos una escuela para adultos: hay gente de los 18 a los 60 y pico. El único requisito
            es tener ganas. Y si al probar vemos que el grupo se te queda corto o largo, se ajusta.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-text-strong text-[clamp(26px,3.6vw,38px)]">
            La comunidad
          </h2>
          <p className="font-body text-text-body text-base leading-relaxed">
            Creemos que una escuela de baile no se mide por sus coreografías, sino por lo que pasa
            alrededor: la gente que llega sola y sale con planes, los grupos que se convierten en
            cuadrilla, las fiestas donde todo lo aprendido cobra sentido. Por eso cuidamos el
            ambiente tanto como la técnica.
          </p>
          <figure className="bg-bg-elevated overflow-hidden rounded-lg border border-white/8">
            <Image
              src={mediaSobreNosotros.clase.src}
              alt={mediaSobreNosotros.clase.alt}
              width={mediaSobreNosotros.clase.ancho}
              height={mediaSobreNosotros.clase.alto}
              sizes="(max-width: 768px) 100vw, 68ch"
              className="aspect-[16/10] w-full object-cover"
            />
          </figure>
          <p className="font-body text-text-body text-base leading-relaxed">
            Se queda gente charlando al acabar y hay salidas informales fuera de horario. No es
            entrar, bailar y salir. Es un grupo normal, centrado en pasarlo bien, donde nadie te va
            a incomodar y donde ser nuevo en Vilanova es de lo más habitual.
          </p>
          <p className="font-body text-text-muted text-[15px] leading-relaxed">
            <Link href="/eventos" className="text-neon font-semibold no-underline hover:underline">
              Ver los próximos eventos y fiestas
            </Link>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-text-strong text-[clamp(26px,3.6vw,38px)]">
            Cómo empezar
          </h2>
          <p className="font-body text-text-body text-base leading-relaxed">
            Sin letra pequeña y sin permanencia. Un estilo son {precios.base} €/{precios.periodo},
            cada estilo adicional suma {precios.estiloExtra} € y la tarifa plana con todas las
            disciplinas es de {precios.flat} €/{precios.periodo}. Antes de decidir nada, tienes una
            clase de prueba para ver el nivel del grupo y el ambiente de la sala.
          </p>
          <p className="font-body text-text-body text-base leading-relaxed">
            Si quieres comprobar todo lo de arriba, no hace falta que nos creas: ven a probar y velo
            por ti mismo.
          </p>
          <WaLink origin="pagina" contextual variant="red" className="mt-2 px-7 py-[15px]">
            Reservar clase de prueba
          </WaLink>
        </section>
      </div>
    </SupportPage>
  );
}
