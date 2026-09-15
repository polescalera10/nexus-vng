"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  TURNSTILE_SITE_KEY,
  TurnstileField,
  type TurnstileStatus,
} from "@/components/forms/TurnstileField";
import { trackLead } from "@/lib/analytics";
import { submitInterestLead, type LeadFormState } from "@/lib/actions/leads";

const initial: LeadFormState = { status: "idle" };

const FIELD =
  "w-full min-h-12 rounded-sm border border-white/12 bg-bg-elevated px-4 py-3 font-body text-base text-text-strong outline-none transition-colors placeholder:text-text-muted focus:border-neon";
const LABEL = "mb-1.5 block font-body text-[13px] font-semibold text-text-body";
const ERR = "mt-1 font-body text-xs font-semibold text-neon";

export type InterestOption = {
  value: string;
  label: string;
  /** Segunda línea destacada (día y hora de la clase). */
  meta?: string;
  /** Tercera línea en gris (nivel, profesores…). */
  hint?: string;
};
export type InterestGroup = { label: string; options: InterestOption[] };

function SubmitButton({ label, waiting }: { label: string; waiting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || waiting}
      className="bg-neon font-body text-ink shadow-neon inline-flex w-full items-center justify-center gap-2 rounded-md px-7 py-[15px] text-base font-bold transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Enviando…" : waiting ? "Un momento…" : label}
    </button>
  );
}

/**
 * Formulario de captación de las landings de INTENSIVOS, CURSO REGULAR y
 * SOCIO FUNDADOR. Recoge nombre completo, email, teléfono, uno o varios
 * intereses (checkboxes, se envían como `intereses[]` y se guardan como tags
 * para marketing segmentado) y el consentimiento RGPD obligatorio. Escribe en
 * Supabase vía Server Action.
 *
 * En el curso regular cada casilla es una CLASE concreta (estilo + día + hora),
 * no un estilo genérico: así el lead llega al CRM con el grupo ya identificado.
 */
export function InterestLeadForm({
  origen,
  groups,
  fixedIntereses,
  nivel,
  submitLabel = "Reservar mi plaza",
  interesesLabel = "¿Qué te interesa? Marca todo lo que quieras",
  interesesHelp,
}: {
  origen: "intensivos" | "curso-regular" | "socio-fundador";
  /** Casillas múltiples. Se omite cuando la oferta ya lo incluye todo. */
  groups?: InterestGroup[];
  /**
   * Intereses fijos que viajan ocultos (p. ej. "Plaza fundadora · todas las
   * disciplinas"). Permiten cumplir el mínimo de un interés sin pedir nada.
   */
  fixedIntereses?: string[];
  /** Bloque opcional de nivel: una sola respuesta, sin marcar por defecto. */
  nivel?: { legend: string; help?: string; options: InterestOption[] };
  submitLabel?: string;
  /** Texto del `legend` del bloque de casillas. */
  interesesLabel?: string;
  /** Ayuda opcional bajo el `legend` (p. ej. cómo elegir el nivel). */
  interesesHelp?: string;
}) {
  const [state, formAction] = useActionState(submitInterestLead, initial);
  const [captcha, setCaptcha] = useState<TurnstileStatus>(TURNSTILE_SITE_KEY ? "pending" : "ready");

  // Conversión: un lead guardado en Supabase vale como `generate_lead` en GA4.
  useEffect(() => {
    if (state.status === "success") trackLead(origen);
  }, [state.status, origen]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-neon/25 bg-bg-panel shadow-card rounded-lg border p-8 text-center"
      >
        <div className="bg-neon/10 text-neon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
          ✓
        </div>
        <p className="font-display text-text-strong text-2xl">¡Solicitud recibida!</p>
        <p className="font-body text-text-muted mt-2 text-[15px]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="origen" value={origen} />
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
        <label htmlFor="il-nombre" className={LABEL}>
          Nombre completo
        </label>
        <input
          id="il-nombre"
          name="nombre"
          required
          className={FIELD}
          placeholder="Nombre y apellidos"
        />
        {state.errors?.nombre && <p className={ERR}>{state.errors.nombre[0]}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="il-email" className={LABEL}>
            Email
          </label>
          <input
            id="il-email"
            name="email"
            type="email"
            required
            className={FIELD}
            placeholder="tu@email.com"
          />
          {state.errors?.email && <p className={ERR}>{state.errors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="il-telefono" className={LABEL}>
            Teléfono
          </label>
          <input
            id="il-telefono"
            name="telefono"
            inputMode="tel"
            required
            className={FIELD}
            placeholder="600 000 000"
          />
          {state.errors?.telefono && <p className={ERR}>{state.errors.telefono[0]}</p>}
        </div>
      </div>

      {/* Intereses implícitos de la oferta (no se preguntan, pero sí se guardan). */}
      {fixedIntereses?.map((value) => (
        <input key={value} type="hidden" name="intereses" value={value} />
      ))}

      {nivel && (
        <fieldset>
          <legend className={LABEL}>{nivel.legend}</legend>
          {nivel.help && (
            <p className="font-body text-text-muted mb-3 text-[13px] leading-snug">{nivel.help}</p>
          )}
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-2">
            {nivel.options.map((opt) => (
              <label
                key={opt.value}
                className="bg-bg-elevated hover:border-neon/40 has-[:checked]:border-neon has-[:checked]:bg-neon/5 flex min-h-12 cursor-pointer items-start gap-3 rounded-sm border border-white/10 px-3 py-2.5 transition-colors"
              >
                <input
                  type="radio"
                  name="intereses"
                  value={opt.value}
                  className="accent-neon mt-0.5 h-4 w-4 shrink-0"
                />
                <span className="font-body text-text-strong text-[14px] leading-tight">
                  <span className="font-semibold">{opt.label}</span>
                  {opt.hint && (
                    <span className="text-text-muted mt-0.5 block text-[12px] font-normal">
                      {opt.hint}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {groups && (
        <fieldset>
          <legend className={LABEL}>{interesesLabel}</legend>
          {interesesHelp && (
            <p className="font-body text-text-muted mb-3 text-[13px] leading-snug">
              {interesesHelp}
            </p>
          )}
          <div className="mt-1 space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="font-body text-neon-mint mb-2 text-[12px] font-bold tracking-[0.14em] uppercase">
                  {group.label}
                </p>
                {/* minmax(min(200px,100%),1fr): a 320px la tarjeta no desborda. */}
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-2">
                  {group.options.map((opt) => (
                    <label
                      key={opt.value}
                      className="bg-bg-elevated hover:border-neon/40 has-[:checked]:border-neon has-[:checked]:bg-neon/5 flex min-h-12 cursor-pointer items-start gap-3 rounded-sm border border-white/10 px-3 py-2.5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="intereses"
                        value={opt.value}
                        className="accent-neon mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span className="font-body text-text-strong text-[14px] leading-tight">
                        <span className="font-semibold">{opt.label}</span>
                        {opt.meta && (
                          <span className="text-text-body mt-0.5 block text-[12.5px] font-normal">
                            {opt.meta}
                          </span>
                        )}
                        {opt.hint && (
                          <span className="text-text-muted mt-0.5 block text-[12px] font-normal">
                            {opt.hint}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {state.errors?.intereses && <p className={ERR}>{state.errors.intereses[0]}</p>}
        </fieldset>
      )}

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="consentimiento"
          value="on"
          required
          className="accent-neon mt-0.5 h-4 w-4 shrink-0"
        />
        <span className="font-body text-text-muted text-[13px] leading-snug">
          He leído y acepto la{" "}
          <a
            href="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon font-semibold underline"
          >
            política de privacidad
          </a>{" "}
          y el tratamiento de mis datos para gestionar mi solicitud y recibir información de NEXUS
          VNG.
        </span>
      </label>
      {state.errors?.consentimiento && <p className={ERR}>{state.errors.consentimiento[0]}</p>}

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
          No hemos podido cargar la verificación anti-spam (a veces la bloquea un bloqueador de
          anuncios). Desactívalo para esta web o escríbenos por WhatsApp.
        </p>
      )}

      <div className="mt-1">
        <SubmitButton label={submitLabel} waiting={captcha === "pending"} />
      </div>
    </form>
  );
}
