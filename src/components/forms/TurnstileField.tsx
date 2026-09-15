"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_ACTION, TURNSTILE_RESPONSE_FIELD } from "@/lib/turnstile-shared";

/**
 * Widget de Cloudflare Turnstile para los formularios de lead.
 *
 * Sin `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no pinta nada y el formulario funciona
 * como siempre (la verificación del servidor también se apaga, ver
 * `lib/turnstile.ts`).
 *
 * · `appearance: interaction-only`: la mayoría de visitantes no ven nada; el
 *   reto solo aparece si Cloudflare tiene dudas.
 * · Render EXPLÍCITO en un efecto, no el `class="cf-turnstile"` implícito: ese
 *   solo se pinta al cargar el script, así que al llegar a otro formulario
 *   navegando dentro de la web se quedaría vacío.
 * · Cada token vale para un envío. `resetSignal` cambia con cada respuesta de
 *   la Server Action y fuerza uno nuevo (si no, el segundo intento tras un
 *   error de validación llegaría con un token ya gastado).
 * · El script solo se pide en páginas con formulario, no en toda la web.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export type TurnstileStatus = "pending" | "ready" | "error";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        // Se permite reintentar en el siguiente montaje (p. ej. otra página).
        scriptPromise = null;
        script.remove();
        reject(new Error("No se pudo cargar Turnstile"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function TurnstileField({
  onStatus,
  resetSignal,
}: {
  onStatus: (status: TurnstileStatus) => void;
  resetSignal: unknown;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: TURNSTILE_ACTION,
          "response-field-name": TURNSTILE_RESPONSE_FIELD,
          appearance: "interaction-only",
          theme: "dark",
          language: "es",
          "refresh-expired": "auto",
          callback: () => onStatusRef.current("ready"),
          "expired-callback": () => onStatusRef.current("pending"),
          "error-callback": () => onStatusRef.current("error"),
        });
      })
      .catch(() => {
        if (!cancelled) onStatusRef.current("error");
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  const isFirstSignal = useRef(true);
  useEffect(() => {
    if (isFirstSignal.current) {
      isFirstSignal.current = false;
      return;
    }
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onStatusRef.current("pending");
    }
  }, [resetSignal]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={container} />;
}
