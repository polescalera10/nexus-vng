"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  TURNSTILE_SITE_KEY,
  TurnstileField,
  type TurnstileStatus,
} from "@/components/forms/TurnstileField";
import { trackLead } from "@/lib/analytics";
import { submitLead, type LeadFormState } from "@/lib/actions/leads";
import type { leadOrigenes } from "@/lib/validation/lead";
import type { Locale } from "@/i18n/locales";
import { tFormulario } from "@/i18n/textos/comun";

type Textos = (typeof tFormulario)["es"];

const initial: LeadFormState = { status: "idle" };

// text-base (16px): por debajo de 16px Safari iOS hace zoom automático al
// enfocar el campo. min-h-12 asegura un objetivo táctil cómodo con el pulgar.
const FIELD =
  "w-full min-h-12 rounded-sm border border-white/12 bg-bg-elevated px-4 py-3 font-body text-base text-text-strong outline-none transition-colors placeholder:text-text-muted focus:border-neon";
const LABEL = "mb-1.5 block font-body text-[13px] font-semibold text-text-body";
const ERR = "mt-1 font-body text-xs font-semibold text-neon";

function SubmitButton({ waiting, t }: { waiting: boolean; t: Textos }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || waiting}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-neon px-7 py-[15px] font-body text-base font-bold text-ink shadow-neon transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? t.enviando : waiting ? t.unMomento : t.enviar}
    </button>
  );
}

/**
 * Formulario de captación de leads (clase de prueba / founding / contacto).
 * Escribe en Supabase y dispara el webhook n8n vía Server Action.
 */
export function LeadForm({
  origen,
  withModalidad = false,
  withMensaje = true,
  hiddenModalidad,
  locale = "es",
}: {
  locale?: Locale;
  origen: (typeof leadOrigenes)[number];
  withModalidad?: boolean;
  withMensaje?: boolean;
  /** Valor fijo de `modalidad_interes` enviado oculto (p. ej. trazabilidad de landing de campaña). No combinar con `withModalidad`. */
  hiddenModalidad?: string;
}) {
  const t = tFormulario[locale];
  const [state, formAction] = useActionState(submitLead, initial);
  const [captcha, setCaptcha] = useState<TurnstileStatus>(TURNSTILE_SITE_KEY ? "pending" : "ready");

  // Conversión: un lead guardado en Supabase vale como `generate_lead` en GA4.
  useEffect(() => {
    if (state.status === "success") trackLead(origen, hiddenModalidad);
  }, [state.status, origen, hiddenModalidad]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-neon/25 bg-bg-panel p-8 text-center shadow-card"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon/10 text-2xl text-neon">
          ✓
        </div>
        <p className="font-display text-2xl text-text-strong">{t.enviado}</p>
        <p className="mt-2 font-body text-[15px] text-text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="origen" value={origen} />
      <input type="hidden" name="locale" value={locale} />
      {hiddenModalidad && <input type="hidden" name="modalidad_interes" value={hiddenModalidad} />}
      {/* Honeypot anti-spam: oculto a usuarios, visible a bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="lf-nombre" className={LABEL}>
          {t.nombre}
        </label>
        <input id="lf-nombre" name="nombre" required className={FIELD} placeholder={t.tuNombre} />
        {state.errors?.nombre && <p className={ERR}>{state.errors.nombre[0]}</p>}
      </div>

      <div>
        <label htmlFor="lf-telefono" className={LABEL}>
          {t.telefono}
        </label>
        <input
          id="lf-telefono"
          name="telefono"
          inputMode="tel"
          required
          className={FIELD}
          placeholder="600 000 000"
        />
        {state.errors?.telefono && <p className={ERR}>{state.errors.telefono[0]}</p>}
      </div>

      <div>
        <label htmlFor="lf-email" className={LABEL}>
          {t.email} <span className="font-normal text-text-faint">{t.opcional}</span>
        </label>
        <input id="lf-email" name="email" type="email" className={FIELD} placeholder="tu@email.com" />
        {state.errors?.email && <p className={ERR}>{state.errors.email[0]}</p>}
      </div>

      {withModalidad && (
        <div>
          <label htmlFor="lf-modalidad" className={LABEL}>
            {t.modalidad} <span className="font-normal text-text-faint">{t.opcional}</span>
          </label>
          <input
            id="lf-modalidad"
            name="modalidad_interes"
            className={FIELD}
            placeholder={t.modalidadPlaceholder}
          />
        </div>
      )}

      {withMensaje && (
        <div>
          <label htmlFor="lf-mensaje" className={LABEL}>
            {t.mensaje} <span className="font-normal text-text-faint">{t.opcional}</span>
          </label>
          <textarea
            id="lf-mensaje"
            name="mensaje"
            rows={4}
            className={`${FIELD} resize-y`}
            placeholder={t.mensajePlaceholder}
          />
          {state.errors?.mensaje && <p className={ERR}>{state.errors.mensaje[0]}</p>}
        </div>
      )}

      {/* Consentimiento RGPD (art. 13): obligatorio, nunca premarcado. */}
      {/* min-h-11 (44px): objetivo táctil aunque el texto quepa en dos líneas. */}
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
        <input
          type="checkbox"
          name="consentimiento"
          value="on"
          required
          className="accent-neon mt-0.5 h-4 w-4 shrink-0"
        />
        <span className="font-body text-text-muted text-[13px] leading-snug">
          {t.consentimiento.antes}{" "}
          <a
            href="/privacidad"
            hrefLang={locale === "ca" ? "es" : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon font-semibold underline"
          >
            {t.consentimiento.enlace}
          </a>{" "}
          {t.consentimiento.despues}
        </span>
      </label>
      {state.errors?.consentimiento && <p className={ERR}>{state.errors.consentimiento[0]}</p>}

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-sm border border-neon/30 bg-neon/5 px-4 py-3 font-body text-sm text-neon">
          {state.message}
        </p>
      )}

      <TurnstileField onStatus={setCaptcha} resetSignal={state} locale={locale} />
      {captcha === "error" && (
        <p role="alert" className={ERR}>
          {t.captchaError}
        </p>
      )}

      <div className="mt-1">
        <SubmitButton waiting={captcha === "pending"} t={t} />
      </div>
    </form>
  );
}
