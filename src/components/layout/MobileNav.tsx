"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
 */
export function MobileNav({ items }: { items: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Al navegar, el panel se cierra solo (sin robar el foco: la página cambia).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        className="relative z-[70] -mr-2 flex size-11 items-center justify-center rounded-sm text-white transition-colors hover:text-neon"
      >
        <MenuIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            id={PANEL_ID}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            data-testid="mobile-nav-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed inset-0 z-[65] flex flex-col overflow-y-auto bg-ink/98 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-lg"
          >
            <nav className="container-nexus flex flex-col">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-14 items-center border-b border-white/8 font-display text-2xl uppercase tracking-[0.01em] no-underline transition-colors ${
                      active ? "text-neon" : "text-white hover:text-neon"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
