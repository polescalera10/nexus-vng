"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearConsent, readConsent, writeConsent, type ConsentValue } from "@/lib/analytics";

const BTN =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-5 py-3 font-body text-sm font-bold transition-transform duration-200 active:translate-y-0 sm:flex-none";

/**
 * Banner de consentimiento de cookies (LSSI-CE art. 22.2 + RGPD).
 *
 * Reglas que cumple: no se instala nada de análisis hasta aceptar (los
 * `default` de Consent Mode van en `Analytics`), aceptar y rechazar tienen la
 * misma prominencia visual, y la decisión es revocable desde /cookies.
 *
 * Solo se pinta tras montar en cliente: en el HTML servido no hay banner, así
 * no hay desajuste de hidratación con la decisión guardada en localStorage.
 */
export function CookieBanner() {
  const [decision, setDecision] = useState<ConsentValue | null | "loading">("loading");

  useEffect(() => setDecision(readConsent()), []);

  if (decision !== null) return null;

  const decide = (value: ConsentValue) => {
    writeConsent(value);
    setDecision(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de cookies"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="border-white/12 bg-bg-panel shadow-card mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:gap-5">
        <p className="font-body text-text-body flex-1 text-[13px] leading-relaxed sm:text-sm">
          Usamos cookies de análisis (Google Analytics) para entender qué partes de la web
          funcionan y mejorarlas. Solo se activan si las aceptas.{" "}
          {/* aria-label: "Más información" a secas no dice a dónde lleva —
              Lighthouse lo marca como enlace sin texto descriptivo (SEO 92,
              15-08-2026). El texto visible no cambia. */}
          <Link
            href="/cookies"
            aria-label="Más información sobre la política de cookies"
            className="text-neon font-semibold underline underline-offset-2"
          >
            Más información
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => decide("denied")} className={`${BTN} border-white/20 text-text-strong border hover:bg-white/5`}>
            Rechazar
          </button>
          <button type="button" onClick={() => decide("granted")} className={`${BTN} bg-neon text-ink shadow-neon hover:-translate-y-0.5`}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Control de revocación para la página /cookies: borra la decisión guardada y
 * recarga para que el banner vuelva a preguntar.
 */
export function CookieSettingsButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => {
        clearConsent();
        window.location.reload();
      }}
      className="border-white/20 text-text-strong font-body inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-3 text-sm font-bold transition-colors hover:bg-white/5"
    >
      Cambiar mi decisión sobre cookies
    </button>
  );
}
