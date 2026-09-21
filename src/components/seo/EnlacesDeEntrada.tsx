import Link from "next/link";
import { paginasQueEnlazanA, type PaginaSeo } from "@/content/paginas-seo";

const TARJETA =
  "group flex h-full flex-col rounded-lg border border-white/8 bg-bg-panel p-5 text-inherit no-underline shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-neon/30 hover:shadow-card";

/**
 * Enlace de VUELTA hacia las páginas de entrada SEO.
 *
 * Las páginas de `content/paginas-seo/` enlazan hacia las fichas y las guías
 * (`enlaces`). Esto pinta el camino inverso, derivado de esos mismos datos:
 * la lista no se mantiene a mano en dos sitios y ninguna página de entrada
 * puede quedar huérfana, que es exactamente lo que hundió a las landings
 * `/l/` (0 enlaces internos, auditoría del 14-08-2026).
 *
 * Sin páginas que enlacen a `href`, no pinta nada.
 */
export function EnlacesDeEntrada({
  href,
  titulo,
  /** Páginas a excluir (p. ej. la propia página, si también es de entrada). */
  excluir = [],
}: {
  href: string;
  titulo: string;
  excluir?: string[];
}) {
  const paginas: PaginaSeo[] = paginasQueEnlazanA(href).filter((p) => !excluir.includes(p.slug));
  if (paginas.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="font-display text-3xl text-text-strong">{titulo}</h2>
      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 p-0">
        {paginas.map((p) => (
          <li key={p.slug}>
            <Link href={`/${p.slug}`} className={TARJETA}>
              <h3 className="font-display text-xl text-text-strong transition-colors group-hover:text-neon">
                {p.h1}
              </h3>
              <p className="mt-2 font-body text-[14px] leading-relaxed text-text-muted">{p.lead}</p>
              <span className="mt-4 inline-block font-body text-[13px] font-bold text-neon group-hover:underline">
                Ver &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
