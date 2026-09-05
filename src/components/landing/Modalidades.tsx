import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { portadaModalidad } from "@/content/media";

type Modalidad = { slug: string; nombre: string; descripcion: string | null };

export function Modalidades({ modalidades }: { modalidades: Modalidad[] }) {
  return (
    <section className="bg-bg-panel pb-[clamp(64px,9vw,120px)]">
      <div className="container-nexus">
        <Reveal as="span" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-neon">
          Qué se baila
        </Reveal>

        <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[18px]">
          {modalidades.map((m, i) => {
            /* Solo hay foto de las disciplinas que se grabaron en los
               intensivos. Las demás conservan el degradado de marca: mejor una
               tarjeta sin foto que la foto de otra clase. */
            const portada = portadaModalidad(m.slug);

            return (
              <Reveal key={m.slug} delay={(i % 3) * 0.08}>
                <Link
                  href={`/clases/${m.slug}`}
                  className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-xl border border-white/6 bg-bg-elevated bg-[repeating-linear-gradient(135deg,rgba(48,228,236,.10)_0_14px,rgba(48,228,236,.03)_14px_28px)] text-white no-underline transition-[border-color,box-shadow] duration-300 hover:border-neon/35 hover:shadow-neon"
                >
                  {portada && (
                    <Image
                      src={portada.src}
                      alt={portada.alt}
                      width={portada.ancho}
                      height={portada.alto}
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
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
                      Modalidad
                    </span>
                    <h3 className="my-2 font-display text-[clamp(34px,4.5vw,52px)] leading-[0.95]">
                      {m.nombre}
                    </h3>
                    <p className="max-w-[36ch] font-body text-[15px] leading-snug text-white/80">
                      {m.descripcion}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
