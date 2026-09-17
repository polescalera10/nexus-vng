"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Login del área privada. Dos vías:
 *   · Enlace por email (por defecto): Supabase manda un magic link que vuelve
 *     a /area-privada/callback y allí se canjea la sesión.
 *   · Contraseña: signInWithPassword de toda la vida.
 * Tras autenticar, el middleware reenvía al panel según el rol del perfil.
 */

type Mode = "enlace" | "password";
type Status = "idle" | "loading" | "sent" | "error";

export function LoginForm({
  initialError,
  redirectTo = "/area-privada",
}: {
  initialError?: boolean;
  /** Ruta a la que volver tras entrar (la pone el middleware en `?redirect=`). */
  redirectTo?: string;
}) {
  const [mode, setMode] = useState<Mode>("enlace");
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

    if (mode === "enlace") {
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
      return;
    }

    const password = String(form.get("password"));
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setMessage("Email o contraseña incorrectos.");
      return;
    }

    // Navegación DURA a propósito. La sesión vive en una cookie que solo el
    // servidor puede leer en la siguiente petición: con router.replace() el
    // destino es la misma URL en la que ya estamos (no navega) y el usuario
    // se queda mirando "Entrando…" con la sesión ya creada.
    window.location.assign(redirectTo);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setMessage("");
  }

  const field =
    "w-full scheme-dark rounded-sm border border-text-strong/15 bg-bg-elevated px-4 py-3 font-body text-base text-text-strong outline-none focus:border-accent";

  const tab = (active: boolean) =>
    `min-h-11 flex-1 rounded-sm font-body text-[13px] font-semibold transition-colors ${
      active ? "bg-accent/12 text-accent" : "text-text-muted hover:bg-text-strong/8"
    }`;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Forma de acceso"
        className="mb-5 flex gap-1 rounded-sm border border-text-strong/10 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "enlace"}
          onClick={() => switchMode("enlace")}
          className={tab(mode === "enlace")}
        >
          Enlace por email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          onClick={() => switchMode("password")}
          className={tab(mode === "password")}
        >
          Contraseña
        </button>
      </div>

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

        {mode === "password" && (
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-body text-[13px] font-semibold text-text-body"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={field}
            />
          </div>
        )}

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
          {status === "loading"
            ? "Enviando…"
            : mode === "enlace"
              ? "Enviarme el enlace"
              : "Entrar"}
        </button>
      </form>
    </div>
  );
}
