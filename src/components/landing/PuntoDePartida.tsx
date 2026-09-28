import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/**
 * "¿Con cuál te identificas?" — puente entre la home y las páginas que
 * responden a la duda concreta del visitante.
 *
 * Hasta el 28-09-2026 enlazaba a seis landings de campaña (`/l/[icp]/[dolor]`),
 * que están en `noindex` desde el 14-08. La home es la página que Google
 * rastrea más a menudo (cada pocos días; las fichas, cada dos semanas o más),
 * así que esos seis enlaces eran el mejor sitio del dominio para descubrir
 * páginas nuevas y se estaban gastando en URLs que nunca van a indexarse.
 * Ahora apuntan a páginas de entrada y guías del blog que responden a la misma
 * duda. Las `/l/` siguen vivas para campañas; no dependen de este bloque.
 *
 * Regla: cada destino tiene que ser indexable y estar en el sitemap. Lo
 * comprueba `tests/unit/punto-de-partida.test.ts`, que también falla si un
 * slug cambia y el enlace se queda en un 404.
 */
export const CASOS = [
  {
    label: "Nunca he bailado y creo que no tengo ritmo",
    href: "/aprender-a-bailar-desde-cero",
  },
  {
    label: "Quiero apuntarme, pero iría solo/a",
    href: "/clases-de-baile-sin-pareja",
  },
  {
    label: "No sé si empezar por salsa o por bachata",
    href: "/blog/salsa-cubana-o-bachata-cual-empezar",
  },
  {
    label: "Quiero bailar con tacones, pero no sé andar con ellos",
    href: "/clases-de-baile-en-tacones",
  },
  {
    label: "Odio el gimnasio y necesito moverme de otra forma",
    href: "/blog/beneficios-de-bailar-para-adultos",
  },
  {
    label: "Creo que se me ha pasado la edad",
    href: "/blog/empezar-a-bailar-a-partir-de-los-40",
  },
  {
    label: "Vivo en Sant Pere de Ribes",
    href: "/clases-de-baile-sant-pere-de-ribes",
  },
  {
    label: "Vivo en Sitges",
    href: "/clases-de-baile-sitges",
  },
] as const;

export function PuntoDePartida() {
  return (
    <section className="bg-ink py-[clamp(56px,9vw,110px)]">
      <div className="container-nexus">
        <Reveal>
          <span className="font-body text-neon-mint/80 text-[11px] font-bold tracking-[0.16em] uppercase">
            Por dónde empezar
          </span>
          <h2 className="font-display text-text-strong mt-3.5 max-w-[20ch] text-balance text-[clamp(34px,5.5vw,66px)] leading-[0.98]">
            ¿Con cuál te identificas?
          </h2>
          <p className="font-body text-text-muted mt-4 max-w-[58ch] text-base leading-relaxed">
            Casi todo el mundo llega con la misma duda de fondo. Elige la tuya y te contamos cómo lo
            resolvemos.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {CASOS.map((caso) => (
            <li key={caso.href}>
              <Link
                href={caso.href}
                className="group border-white/8 bg-bg-panel hover:border-neon/40 flex min-h-14 items-center justify-between gap-4 rounded-lg border px-5 py-4 no-underline transition-colors"
              >
                <span className="font-body text-text-body group-hover:text-text-strong text-[15px] leading-snug transition-colors">
                  {caso.label}
                </span>
                <span
                  aria-hidden="true"
                  className="text-neon shrink-0 text-lg transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
