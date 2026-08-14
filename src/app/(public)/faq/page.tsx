import type { Metadata } from "next";
import Link from "next/link";
import { SupportPage } from "@/components/layout/SupportPage";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { WaLink } from "@/components/ui/WaLink";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";
import { faqGrupos, faqTodas } from "@/content/faq-completa";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Nivel, ritmo, precios, horarios, bailar en pareja y ambiente: las dudas que más nos llegan antes de la primera clase de baile en Vilanova i la Geltrú.",
  alternates: { canonical: "/faq" },
};

/**
 * Aquí NO se usa `<Accordion>` a propósito. Ese componente monta la respuesta
 * solo al abrir (AnimatePresence), así que las respuestas no existen en el HTML
 * servido: la página tenía 124 palabras visibles con 7 preguntas dentro. Con
 * `<details>` nativo el texto completo va en el HTML (indexable y buscable con
 * Ctrl+F), sigue plegado por defecto y no cuesta ni un byte de JavaScript.
 */
export default function FaqPage() {
  return (
    <SupportPage
      eyebrow="Antes de escribir"
      title="Preguntas frecuentes"
      intro={`Las ${faqTodas.length} dudas que más nos llegan por WhatsApp, agrupadas por tema. Si te queda alguna, escríbenos y te la resolvemos en el momento.`}
    >
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Preguntas frecuentes", path: "/faq" },
          ]}
        />
      </div>
      <div className="mx-auto max-w-[780px] space-y-[clamp(40px,6vw,64px)]">
        {/* Índice: en una página larga, poder saltar al tema ahorra scroll. */}
        <nav aria-label="Temas de las preguntas frecuentes">
          <ul className="flex flex-wrap gap-2">
            {faqGrupos.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="bg-bg-panel font-body text-text-body hover:border-neon/40 hover:text-text-strong inline-flex min-h-[44px] items-center rounded-md border border-white/8 px-4 text-sm no-underline transition-colors"
                >
                  {g.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {faqGrupos.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <h2 className="font-display text-text-strong text-[clamp(24px,3.2vw,34px)]">
              {g.titulo}
            </h2>

            <div className="mt-4">
              {g.items.map((item) => (
                <details key={item.q} className="group border-b border-white/10">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <h3 className="font-body text-text-strong m-0 text-[clamp(16px,1.6vw,18px)] font-semibold">
                      {item.q}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="font-body text-neon flex-none text-[28px] leading-none transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="font-body text-text-muted pb-[18px] text-base leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>

            {g.link && (
              <p className="font-body text-text-muted mt-4 text-[15px]">
                <Link
                  href={g.link.href}
                  className="text-neon font-semibold no-underline hover:underline"
                >
                  {g.link.label} →
                </Link>
              </p>
            )}
          </section>
        ))}

        <div className="flex flex-col items-center gap-3">
          <WaLink origin="pagina" contextual variant="red" className="px-7 py-[15px]">
            Tengo otra duda
          </WaLink>
          <p className="font-body text-text-faint text-center text-[13px]">
            Si prefieres dejar tus datos y que te escribamos nosotros, tienes el formulario en{" "}
            <Link href="/contacto" className="text-text-muted no-underline hover:underline">
              contacto
            </Link>
            .
          </p>
        </div>
      </div>
      <JsonLd data={faqLd(faqTodas)} />
    </SupportPage>
  );
}
