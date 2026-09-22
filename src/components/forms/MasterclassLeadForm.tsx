"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  TURNSTILE_SITE_KEY,
  TurnstileField,
  type TurnstileStatus,
} from "@/components/forms/TurnstileField";
import { trackLead } from "@/lib/analytics";
import { submitMasterclassLead, type LeadFormState } from "@/lib/actions/leads";
import { tFormulario } from "@/i18n/textos/comun";

/**
 * Inscripción a una MASTERCLASS, al final de la ficha del evento.
 *
 * Pide lo justo para confirmar la plaza: nombre completo, teléfono y email.
 * El evento viaja en un campo oculto (`evento_slug`) y el servidor lo relee de
 * la base para sacar el título — así el lead llega a la bandeja diciendo a cuál
 * se apunta la persona sin que el visitante vea ni pueda tocar esa marca.
 */

const initial: LeadFormState = { status: "idle" };

const FIELD =
  "w-full min-h-12 rounded-sm border border-white/12 bg-bg-elevated px-4 py-3 font-body text-base text-text-strong outline-none transition-colors placeholder:text-text-muted focus:border-neon";
const LABEL = "mb-1.5 block font-body text-[13px] font-semibold text-text-body";
const ERR = "mt-1 font-body text-xs font-semibold text-neon";

function SubmitButton({ label, waiting }: { label: string; waiting: boolean }) {
  const { pending } = useFormStatus();
  const t = tFormulario.es;
  return (
    <button
      type="submit"
      disabled={pending || waiting}
      className="bg-neon font-body text-ink shadow-neon inline-flex w-full items-center justify-center gap-2 rounded-md px-7 py-[15px] text-base font-bold transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? t.enviando : waiting ? t.unMomento : label}
    </button>
  );
}

export function MasterclassLeadForm({
  eventoSlug,
  eventoTitulo,
  tituloId,
  submitLabel = "Apuntarme a la masterclass",
}: {
  eventoSlug: string;
  /** Solo para la analítica y el mensaje de éxito: el CRM lo relee del servidor. */
  eventoTitulo: string;
  /**
   * `id` del encabezado con el que la sección se etiqueta (`aria-labelledby`).
   * Lo lleva el `h2` en los DOS estados, así que la sección no se queda sin
   * nombre accesible en cuanto se envía el formulario.
   */
  tituloId?: string;
  submitLabel?: string;
}) {
  const t = tFormulario.es;
  const [state, formAction] = useActionState(submitMasterclassLead, initial);
  const [captcha, setCaptcha] = useState<TurnstileStatus>(TURNSTILE_SITE_KEY ? "pending" : "ready");

  // Conversión: un lead guardado en Supabase vale como `generate_lead` en GA4.
  useEffect(() => {
    if (state.status === "success") trackLead("masterclass", eventoSlug);
  }, [state.status, eventoSlug]);

  /*
   * El éxito NO dibuja su propia tarjeta, a diferencia de los formularios de las
   * landings. Este vive DENTRO del panel de la ficha del evento: un `bg-bg-panel`
   * con borde dentro de otro igual dejaba una caja más estrecha que el bloque que
   * sustituía, con doble marco y descolgada del ancho de la sección. Aquí el
   * mensaje ocupa la sección entera y el marco lo sigue poniendo la ficha.
   */
  if (state.status === "success") {
    return (
      <div role="status" className="py-4 text-center">
        <div className="bg-neon/10 text-neon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
          ✓
        </div>
        <h2 id={tituloId} className="font-display text-text-strong text-3xl">
          {t.recibida}
        </h2>
        <p className="font-body text-text-muted mx-auto mt-2 max-w-[48ch] text-[15px] leading-relaxed">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 id={tituloId} className="font-display text-text-strong text-3xl">
        Apúntate a la masterclass
      </h2>
      <p className="font-body text-text-muted mt-2 max-w-[60ch] text-[15px] leading-relaxed">
        Plazas limitadas. Déjanos tus datos y te escribimos para confirmarte la plaza.
      </p>

      <form action={formAction} className="mt-6 flex max-w-[640px] flex-col gap-5" noValidate>
        <input type="hidden" name="evento_slug" value={eventoSlug} />
        <input type="hidden" name="locale" value="es" />
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
          <label htmlFor="mc-nombre" className={LABEL}>
            {t.nombreCompleto}
          </label>
          <input
            id="mc-nombre"
            name="nombre"
            required
            autoComplete="name"
            className={FIELD}
            placeholder={t.nombreApellidos}
          />
          {state.errors?.nombre && <p className={ERR}>{state.errors.nombre[0]}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="mc-telefono" className={LABEL}>
              {t.telefono}
            </label>
            <input
              id="mc-telefono"
              name="telefono"
              inputMode="tel"
              autoComplete="tel"
              required
              className={FIELD}
              placeholder="600 000 000"
            />
            {state.errors?.telefono && <p className={ERR}>{state.errors.telefono[0]}</p>}
          </div>

          <div>
            <label htmlFor="mc-email" className={LABEL}>
              {t.email}
            </label>
            <input
              id="mc-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={FIELD}
              placeholder="tu@email.com"
            />
            {state.errors?.email && <p className={ERR}>{state.errors.email[0]}</p>}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
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

        {/* El slug lo valida el servidor; si falla, el error sale aquí. */}
        {state.errors?.evento_slug && <p className={ERR}>{state.errors.evento_slug[0]}</p>}

        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="border-neon/30 bg-neon/5 font-body text-neon rounded-sm border px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        )}

        <TurnstileField onStatus={setCaptcha} resetSignal={state} />
        {captcha === "error" && (
          <p role="alert" className={ERR}>
            {t.captchaError}
          </p>
        )}

        <div className="mt-1">
          <SubmitButton label={submitLabel} waiting={captcha === "pending"} />
        </div>

        <p className="font-body text-text-muted text-[12.5px] leading-snug">
          Te escribimos para confirmarte la plaza de <strong>{eventoTitulo}</strong> y decirte cómo
          se paga.
          </p>
      </form>
    </>
  );
}
