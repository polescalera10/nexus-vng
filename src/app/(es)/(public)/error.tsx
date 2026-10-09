"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { buildWaLinkFromText } from "@/lib/whatsapp";

/**
 * Error boundary de la web pública.
 *
 * El caso que más se ve en Vercel es `Failed to find Server Action`: alguien
 * tiene un formulario abierto, se despliega una versión nueva y al enviarlo el
 * id de la acción ya no existe. Sin este fichero el visitante veía la pantalla
 * de error genérica de Next y el lead se perdía sin rastro (3 veces entre
 * agosto y octubre de 2026, siempre en /contacto).
 *
 * Por eso la salida es doble: recargar (trae la versión nueva y el formulario
 * vuelve a funcionar) o escribir por WhatsApp, que no depende del despliegue.
 * Se recarga la página entera en vez de llamar a `reset()`: `reset` vuelve a
 * renderizar con el mismo bundle y el id de la acción seguiría sin existir.
 */
const MENSAJE_WA =
  "¡Hola! Intenté escribiros desde la web de NEXUS VNG y me dio un error. Os escribo por aquí 🙂";

export default function PublicError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
    trackEvent("error_pagina", {
      error_tipo: /server action/i.test(error.message) ? "server_action" : "otro",
      error_digest: error.digest,
    });
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="bg-ink flex min-h-[70dvh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="container-nexus flex max-w-[600px] flex-col items-center">
          <span className="border-neon-mint/30 bg-neon-mint/5 font-body text-neon-mint mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
            Algo ha fallado
          </span>
          <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-[0.95] tracking-[0.01em] text-white">
            No hemos podido completar esta acción
          </h1>
          <p className="font-body text-text-body mt-5 max-w-[48ch] text-base leading-relaxed">
            Puede que la web se haya actualizado mientras la tenías abierta. Recarga la página
            y vuelve a intentarlo, o escríbenos directamente por WhatsApp.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={buildWaLinkFromText(MENSAJE_WA)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("pagina", "error")}
              className="bg-neon text-ink shadow-neon font-body inline-flex min-h-11 items-center justify-center rounded-md px-8 py-3.5 text-sm font-bold"
            >
              Escríbenos por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-text-strong font-body inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/10"
            >
              Recargar la página
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
