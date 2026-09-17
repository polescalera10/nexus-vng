import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { portadaModalidad } from "@/content/media";
import { altEn, descripcionModalidad, nombreModalidad } from "@/content/por-idioma";
import { enlace, tieneVersion } from "@/i18n/rutas";
import type { Locale } from "@/i18n/locales";
import { tIdioma } from "@/i18n/textos/comun";
import { tModalidades } from "@/i18n/textos/inicio";

type Modalidad = { slug: string; nombre: string; descripcion: string | null };

export function Modalidades({ modalidades, locale = "es" }: { modalidades: Modalidad[]; locale?: Locale }) {
  const t = tModalidades[locale];
  /* La home enseña SOLO las disciplinas de las que hay foto. Una tarjeta de
     degradado entre tarjetas con foto se lee como un hueco, no como una
     modalidad más. Las que faltan no desaparecen del sitio: el enlace de abajo
     lleva a /clases, donde están las diez con su ficha. */
  const conFoto = modalidades.filter((m) => portadaModalidad(m.slug));
  const sinFoto = modalidades.length - conFoto.length;

  return (
    <section className="bg-bg-panel pb-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          {t.kicker}
        </Reveal>

        <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[18px]">
          {conFoto.map((m, i) => {
            const portada = portadaModalidad(m.slug);
            const destino = `/clases/${m.slug}`;
            const soloEs = !tieneVersion(destino, locale);

            return (
              <Reveal key={m.slug} delay={(i % 3) * 0.08}>
                <Link
                  href={enlace(destino, locale)}
                  hrefLang={soloEs ? "es" : undefined}
                  className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-xl border border-white/6 bg-bg-elevated bg-[repeating-linear-gradient(135deg,rgba(48,228,236,.10)_0_14px,rgba(48,228,236,.03)_14px_28px)] text-white no-underline transition-[border-color,box-shadow] duration-300 hover:border-neon/35 hover:shadow-neon"
                >
                  {portada && (
                    <Image
                      src={portada.src}
                      alt={altEn(portada.src, portada.alt, locale)}
                      width={portada.ancho}
                      height={portada.alto}
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      /* La tarjeta es casi cuadrada y la foto es 3:4, así que
                         `object-cover` se queda con una banda del vertical. Sin
                         `object-position` esa banda cae a la altura de la
                         cintura; anclada al 22% coge las caras. */
                      className="absolute inset-0 h-full w-full object-cover object-[center_22%] transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                  {/* Velo: sobre foto hace falta más carga abajo para que el
                      nombre de la disciplina siga legible. */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 group-hover:opacity-90 ${
                      portada
                        ? "bg-[linear-gradient(180deg,rgba(10,10,10,.15)_0%,rgba(10,10,10,.35)_45%,rgba(10,10,10,.94)_100%)]"
                        : "bg-[linear-gradient(180deg,rgba(10,10,10,.05)_30%,rgba(10,10,10,.88)_100%)]"
                    }`}
                  />
                  <div className="relative z-[1] p-7">
                    <span className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-neon-mint">
                      {t.etiqueta}
                      {soloEs && <span className="ml-2 normal-case tracking-normal text-white/60">{tIdioma[locale].soloEs}</span>}
                    </span>
                    <h3 className="my-2 font-display text-[clamp(34px,4.5vw,52px)] leading-[0.95]">
                      {nombreModalidad(m.nombre, locale)}
                    </h3>
                    <p className="max-w-[36ch] font-body text-[15px] leading-snug text-white/80">
                      {descripcionModalidad(m, locale)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <Link
            href={enlace("/clases", locale)}
            className="border-neon/35 font-body text-neon hover:bg-neon/10 inline-flex min-h-12 items-center justify-center rounded-md border px-7 py-[14px] text-[15px] font-bold no-underline transition-colors"
          >
            {sinFoto > 0
              ? t.verN(modalidades.length)
              : t.verTodas}{" "}
            &rarr;
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
