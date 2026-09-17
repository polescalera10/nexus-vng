import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/locales";
import { tMigas } from "@/i18n/textos/comun";

export type Crumb = { name: string; path: string };

/**
 * Migas de pan visibles + `BreadcrumbList` en JSON-LD.
 *
 * El último elemento es la página actual y no se enlaza. Google las usa para
 * sustituir la URL en el SERP y para entender la jerarquía
 * (/clases → /clases/salsa-cubana), que hasta ahora no se declaraba en ningún
 * sitio.
 */
export function Breadcrumbs({ items, locale = "es" }: { items: Crumb[]; locale?: Locale }) {
  const last = items.length - 1;

  return (
    <>
      <nav aria-label={tMigas[locale].aria} className="font-body text-text-muted text-[13px]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => (
            <li key={item.path} className="flex items-center gap-2">
              {i === last ? (
                <span aria-current="page" className="text-text-body">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-neon no-underline transition-colors">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-text-faint">
                    /
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}
