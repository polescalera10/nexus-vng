import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "./LoginForm";

/**
 * Login del área privada. El middleware ya redirige a un usuario autenticado
 * a su panel por rol, así que aquí solo se renderiza el formulario.
 * `?error=enlace` llega desde /area-privada/callback cuando el magic link
 * está caducado o ya usado.
 */
export default async function AreaPrivadaLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // El middleware guarda en `?redirect=` la ruta privada que se intentó abrir
  // sin sesión. Solo se acepta como ruta interna: un `//evil.com` también
  // empieza por "/" y el navegador lo trataría como dominio externo.
  const raw = Array.isArray(sp.redirect) ? sp.redirect[0] : sp.redirect;
  const redirectTo =
    raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/area-privada";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <Logo size={28} />
        </div>
        <div className="rounded-xl border border-text-strong/8 bg-bg-panel p-8 shadow-card">
          <h1 className="font-display text-3xl text-text-strong">Área privada</h1>
          <p className="mb-6 mt-1 font-body text-sm text-text-muted">
            Accede con tu cuenta de alumno, profesor o admin.
          </p>
          <LoginForm initialError={sp.error === "enlace"} redirectTo={redirectTo} />
        </div>
        <p className="mt-6 text-center font-body text-sm text-text-muted">
          <Link href="/" className="text-accent no-underline hover:underline">
            ← Volver a la web
          </Link>
        </p>
      </div>
    </div>
  );
}
