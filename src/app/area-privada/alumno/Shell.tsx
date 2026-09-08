import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { SignOutButton } from "@/app/area-privada/SignOutButton";

/**
 * Cabecera del área de alumno. No comparte layout con admin/profesor a
 * propósito: el alumno no tiene módulos ni nav lateral, tiene su página y las
 * fichas de sus clases. El logo lleva al inicio del área, que es lo que espera
 * quien está dentro de una clase y quiere volver.
 */
export function AlumnoShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-text-strong/8 bg-bg-panel">
        <div className="container-nexus flex items-center justify-between py-4">
          <Link href="/area-privada/alumno" aria-label="Mi área">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            {email && (
              <span className="hidden font-body text-sm text-text-muted sm:inline">
                {email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container-nexus py-10 sm:py-12">{children}</main>
    </div>
  );
}
