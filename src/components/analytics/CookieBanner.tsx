"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearConsent, readConsent, writeConsent, type ConsentValue } from "@/lib/analytics";
import type { Locale } from "@/i18n/locales";
import { tCookies } from "@/i18n/textos/comun";

/**
 * Un solo estilo para los dos botones: la guía de cookies de la AEPD pide que
 * rechazar sea tan visible como aceptar, y un botón relleno en neón junto a
 * otro solo con borde empuja a aceptar. Por eso no hay variante "principal".
 */
const BTN =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-neon/60 px-5 py-2.5 font-body text-sm font-bold text-text-strong transition-colors hover:bg-neon/10 sm:flex-none";

/**
 * Banner de consentimiento de cookies (LSSI-CE art. 22.2 + RGPD).
 *
 * Reglas que cumple: no se instala nada de análisis hasta aceptar (los
 * `default` de Consent Mode van en `Analytics`), aceptar y rechazar tienen la
 * el mismo estilo (ver BTN), y la decisión es revocable desde /cookies.
 *
 * Solo se pinta tras montar en cliente: en el HTML servido no hay banner, así
 * no hay desajuste de hidratación con la decisión guardada en localStorage.
 */
export function CookieBanner({ locale = "es" }: { locale?: Locale }) {
  const t = tCookies[locale];
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
      aria-label={t.dialogo}
      className="fixed inset-x-0 bottom-0 z-[70] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3"
    >
      {/* Compacto en móvil: en la primera visita tapaba el botón de WhatsApp del
          hero, que es la conversión principal de la web (auditoría 09-10-2026). */}
      <div className="border-white/12 bg-bg-panel shadow-card mx-auto flex max-w-3xl flex-col gap-2.5 rounded-lg border p-3.5 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <p className="font-body text-text-body flex-1 text-[13px] leading-snug sm:text-sm sm:leading-relaxed">
          {t.texto}{" "}
          {/* aria-label: "Más información" a secas no dice a dónde lleva —
              Lighthouse lo marca como enlace sin texto descriptivo (SEO 92,
              15-08-2026). El texto visible no cambia. */}
          <Link
            href="/cookies"
            aria-label={t.masInfoAria}
            hrefLang={locale === "ca" ? "es" : undefined}
            className="text-neon font-semibold underline underline-offset-2"
          >
            {t.masInfo}
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => decide("denied")} className={BTN}>
            {t.rechazar}
          </button>
          <button type="button" onClick={() => decide("granted")} className={BTN}>
            {t.aceptar}
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
