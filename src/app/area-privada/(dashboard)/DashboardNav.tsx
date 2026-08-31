"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavIconName =
  | "home"
  | "negocio"
  | "leads"
  | "intensivos"
  | "students"
  | "courses"
  | "teachers"
  | "whatsapp"
  | "today"
  | "eventos"
  | "puntos";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  /** Etiqueta corta para la barra de pestañas móvil (cabe menos texto). */
  short?: string;
  /** true en las rutas raíz del panel para no quedar siempre activas. */
  exact?: boolean;
};

/* Iconos inline (24px, stroke) — sin dependencias externas. */
function NavIcon({ name }: { name: NavIconName }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    home: (
      <path d="M4 11.5 12 4l8 7.5M6 10.5V20h12v-9.5M10 20v-5h4v5" />
    ),
    leads: (
      <>
        <path d="M4 13.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5M4 13.5 6.5 5h11L20 13.5M4 13.5h5l1 2h4l1-2h5" />
      </>
    ),
    intensivos: <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" />,
    negocio: (
      <>
        <path d="M4 20h16M7 20v-6M12 20V8M17 20v-9" />
        <path d="m5 9 5-4 4 3 5-5" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 5.5a3 3 0 0 1 0 5.6M17.5 14.4c1.7.6 2.7 2.2 3 4.6" />
      </>
    ),
    courses: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
      </>
    ),
    teachers: (
      <>
        <circle cx="12" cy="7.5" r="3.2" />
        <path d="M5.5 20c.7-3.6 3.3-5.6 6.5-5.6s5.8 2 6.5 5.6" />
      </>
    ),
    whatsapp: (
      <path d="M12 4a8 8 0 0 0-6.9 12l-1 3.9 4-1A8 8 0 1 0 12 4Zm-3 5.5c.3 2.5 2.9 5.1 5.5 5.4l1.3-1.2 2 1.1c-.5 1.4-1.6 2-3 1.8-3.4-.5-6.9-4-7.4-7.4-.2-1.4.4-2.5 1.8-3l1.1 2-1.3 1.3Z" />
    ),
    today: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 9.5h16M8.5 3v4M15.5 3v4M9 14.5l2 2 4-4" />
      </>
    ),
    eventos: (
      <>
        <path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5v-7Z" />
        <path d="m9.5 12 1.8 1.8L15 10" />
      </>
    ),
    puntos: (
      <>
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 flex-none"
    >
      {paths[name]}
    </svg>
  );
}

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Navegación lateral (escritorio, md+). */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del panel" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-sm px-3.5 py-2.5 font-body text-sm font-semibold transition-colors ${
              active
                ? "bg-accent/10 text-accent"
                : "text-text-body hover:bg-text-strong/8"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Barra de pestañas inferior (móvil) — pensada para usar con el pulgar.
 *
 * El panel de admin tiene nueve secciones y nueve pestañas no caben a 320px
 * sin bajar de los 44px de objetivo táctil que exige el proyecto. Se enseñan
 * las cuatro primeras y el resto vive detrás de "Más", que despliega una
 * rejilla por encima de la barra. Con cuatro ítems o menos (el caso del rol
 * profesor) no aparece nada extra.
 */
const MAX_TABS = 4;

export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [masAbierto, setMasAbierto] = useState(false);

  const caben = items.length <= MAX_TABS + 1;
  const visibles = caben ? items : items.slice(0, MAX_TABS);
  const ocultos = caben ? [] : items.slice(MAX_TABS);

  // Al navegar, el menú desplegado tiene que cerrarse solo.
  useEffect(() => {
    setMasAbierto(false);
  }, [pathname]);

  const hayOcultoActivo = ocultos.some((item) => isActive(pathname, item));

  const tabClass = (active: boolean) =>
    `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 font-body text-[11px] font-semibold ${
      active ? "text-accent" : "text-text-muted"
    }`;

  return (
    <>
      {masAbierto && (
        <>
          {/* Capa para cerrar tocando fuera; el propio menú va por encima. */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMasAbierto(false)}
            className="fixed inset-0 z-40 bg-ink/60 md:hidden"
          />
          <div className="fixed inset-x-0 bottom-14 z-40 border-t border-text-strong/10 bg-bg-panel pb-[env(safe-area-inset-bottom)] md:hidden">
            <ul className="grid grid-cols-3 gap-1 p-2">
              {ocultos.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-sm px-1 text-center font-body text-[11px] font-semibold ${
                        active ? "bg-accent/10 text-accent" : "text-text-body"
                      }`}
                    >
                      <NavIcon name={item.icon} />
                      <span className="max-w-full truncate">
                        {item.short ?? item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      <nav
        aria-label="Navegación del panel"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-text-strong/10 bg-bg-panel pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex">
          {visibles.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={tabClass(active)}
              >
                <NavIcon name={item.icon} />
                <span className="max-w-full truncate">{item.short ?? item.label}</span>
              </Link>
            );
          })}

          {ocultos.length > 0 && (
            <button
              type="button"
              aria-expanded={masAbierto}
              onClick={() => setMasAbierto((v) => !v)}
              className={tabClass(masAbierto || hayOcultoActivo)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="size-5 flex-none"
              >
                <circle cx="5" cy="12" r="1.4" />
                <circle cx="12" cy="12" r="1.4" />
                <circle cx="19" cy="12" r="1.4" />
              </svg>
              <span>Más</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
