"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WaLink } from "@/components/ui/WaLink";
import type { NavLink } from "@/components/layout/nav-items";

const PANEL_ID = "mobile-nav-panel";

/** Icono hamburguesa / cerrar: tres barras que se cruzan al abrir. */
function MenuIcon({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-[2px] w-6 rounded-full bg-current transition-all duration-300";
  return (
    <span aria-hidden="true" className="relative block h-4 w-6">
      <span className={`${bar} ${open ? "top-[7px] rotate-45" : "top-0"}`} />
      <span className={`${bar} top-[7px] ${open ? "opacity-0" : "opacity-100"}`} />
      <span className={`${bar} ${open ? "top-[7px] -rotate-45" : "top-[14px]"}`} />
    </span>
  );
}

/**
 * Menú de navegación para móvil (<md), donde la nav de escritorio está oculta.
 *
 * Botón hamburguesa de 44×44 (objetivo táctil mínimo) + panel a pantalla
 * completa con los enlaces del sitio y el CTA de WhatsApp. Accesible:
 * `aria-expanded`/`aria-controls`, cierre con Escape devolviendo el foco al
 * botón, foco atrapado dentro del panel y bloqueo del scroll de fondo.
 *
 * El panel se monta en `document.body` con un portal, no dentro de la
 * cabecera. Motivo (bug del 24-08-2026): `SiteHeader` lleva `backdrop-blur`,
 * y `backdrop-filter` convierte al elemento en bloque contenedor de sus
 * descendientes `position: fixed`. El `inset-0` del panel se resolvía contra
 * la cabecera en vez de contra el viewport, así que en las páginas de soporte
 * el menú abría con 128 px de alto (~1/6 de la pantalla) y los enlaces
 * quedaban recortados. Con el portal el panel cuelga de `<body>` y ningún
 * `transform`/`filter`/`backdrop-filter` que se añada por encima puede
 * volver a encogerlo.
 */
export function MobileNav({ items }: { items: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  // El portal solo existe en cliente: en SSR no hay `document.body`.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Al navegar, el panel se cierra solo (sin robar el foco: la página cambia).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Al cruzar a escritorio el panel deja de pintarse (md:hidden): si siguiera
  // "abierto" el bloqueo de scroll del body se quedaría pegado.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    onChange();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // El fondo no debe poder desplazarse mientras el panel está abierto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foco al primer elemento interactivo del panel.
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      // Trampa de foco: el tabulador circula dentro del panel.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        data-testid="mobile-nav-toggle"
        className="hover:text-neon relative z-[70] -mr-2 flex size-11 items-center justify-center rounded-sm text-white transition-colors"
      >
        <MenuIcon open={open} />
      </button>

      {/* La apertura se anima en CSS (`panel-in`). El cierre es inmediato: con
          Framer había además un fundido de salida de 240 ms, pero mantener el
          panel montado para animarlo al cerrar obliga a una máquina de estados
          que no compensa por 240 ms de fundido. */}
      {open &&
        mounted &&
        createPortal(
          <div
            id={PANEL_ID}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            data-testid="mobile-nav-panel"
            className="panel-in bg-ink/98 fixed inset-0 z-[65] flex flex-col overflow-y-auto pt-24 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden"
          >
            <nav className="container-nexus flex flex-col">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`font-display flex min-h-14 items-center border-b border-white/8 text-2xl tracking-[0.01em] uppercase no-underline transition-colors ${
                      active ? "text-neon" : "hover:text-neon text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="container-nexus mt-auto pt-10">
              <WaLink origin="nav" contextual variant="red" className="w-full px-6 py-4 text-base">
                Reserva tu clase de prueba
              </WaLink>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
