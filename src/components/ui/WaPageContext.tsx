"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { waContextForPath, type WaPageContext } from "@/lib/wa-page-context";

/**
 * Contexto de WhatsApp de la página actual, compartido con los CTA globales.
 *
 * No usa React Context a propósito: el sticky, la cabecera y el footer viven
 * en el layout, POR ENCIMA de la página en el árbol, así que un provider
 * puesto en la página nunca les llegaría. Con un store externo el orden del
 * árbol da igual.
 *
 * Las rutas estáticas no necesitan nada: `waContextForPath` las resuelve por
 * el pathname. Solo las páginas con nombre dinámico (modalidad, evento,
 * profe) montan `<SetWaPageContext>` para inyectar el nombre exacto.
 */
let current: WaPageContext | null = null;
const listeners = new Set<() => void>();

function set(next: WaPageContext | null) {
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
/** En el servidor nunca hay override: se renderiza el mensaje por ruta. */
const getServerSnapshot = () => null;

/** No pinta nada: solo publica el contexto de esta página mientras está montada. */
export function SetWaPageContext({ label, message }: WaPageContext) {
  useEffect(() => {
    const mine: WaPageContext = { label, message };
    set(mine);
    return () => {
      // Al navegar, el desmontaje de la página vieja puede llegar después del
      // montaje de la nueva: solo limpio si el contexto sigue siendo el mío.
      if (current === mine) set(null);
    };
  }, [label, message]);

  return null;
}

/** Mensaje que debe abrir un CTA contextual: override de la página o mapa por ruta. */
export function useWaPageContext(): WaPageContext {
  const pathname = usePathname();
  const override = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return override ?? waContextForPath(pathname);
}
