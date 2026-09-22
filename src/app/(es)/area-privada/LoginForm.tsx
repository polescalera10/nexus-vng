"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Login del área privada: SOLO enlace por email. Supabase manda un magic link
 * que vuelve a /area-privada/callback y allí se canjea la sesión; el
 * middleware reenvía después al panel según el rol del perfil.
 *
 * No hay acceso por contraseña a propósito (22-09-2026): nadie tiene una
 * (las cuentas se crean desde el panel y entran por enlace), así que la
 * pestaña solo generaba confusión. Si algún día se recupera, va también el
 * flujo de "he olvidado la contraseña", que tampoco existía.
 */

type Status = "idle" | "loading" | "sent" | "error";

export function LoginForm({
  initialError,
  redirectTo = "/area-privada",
}: {
  initialError?: boolean;
  /** Ruta a la que volver tras entrar (la pone el middleware en `?redirect=`). */
  redirectTo?: string;
}) {
  const [status, setStatus] = useState<Status>(initialError ? "error" : "idle");
  const [message, setMessage] = useState(
    initialError ? "Ese enlace ya no vale. Pide uno nuevo." : "",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const supabase = createClient();

    // `next` va SIEMPRE, aunque valga el valor por defecto: la plantilla del
    // correo concatena `&token_hash=…` a esta URL y necesita que ya lleve
    // query. Ver docs/email-templates/README.md.
    const callback = new URL("/area-privada/callback", window.location.origin);
    callback.searchParams.set("next", redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback.toString(),
        // Nadie se crea una cuenta pidiendo un enlace: solo entran los
        // usuarios que ya existen en Supabase Auth.
        shouldCreateUser: false,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(
        "No hemos podido enviar el enlace. Revisa que el email sea el de tu cuenta.",
      );
      return;
    }

    setStatus("sent");
    setMessage(
      `Te hemos enviado un enlace a ${email}. Ábrelo en este mismo dispositivo.`,
    );
  }

  const field =
    "w-full scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-4 py-3 font-body text-base text-text-strong outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-body text-[13px] font-semibold text-text-body"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={field}
        />
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-2.5 font-body text-sm text-danger"
        >
          {message}
        </p>
      )}

      {status === "sent" && (
        <p
          role="status"
          className="rounded-sm border border-accent/30 bg-accent/10 px-4 py-2.5 font-body text-sm text-accent"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-md bg-accent px-7 py-[15px] font-body text-base font-bold text-ink shadow-neon transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {status === "loading" ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}
