import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { SignOutButton } from "@/app/area-privada/SignOutButton";
import {
  SidebarNav,
  TabBar,
  type NavItem,
} from "@/app/area-privada/(dashboard)/DashboardNav";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell del área del alumno.
 *
 * Antes era una cabecera con el logo y poco más: el alumno tenía una sola
 * página. Con Ranking y Perfil ya son tres destinos, así que pasa al mismo
 * patrón que admin y profesor — barra lateral en escritorio, pestañas abajo en
 * móvil — y reutiliza sus componentes en vez de tener una navegación propia
 * que habría que arreglar dos veces.
 *
 * No comparte layout con `(dashboard)` a pesar de compartir la navegación:
 * aquel redirige al alumno fuera en cuanto detecta su rol, que es justo lo que
 * queremos que siga haciendo.
 */

const NAV: NavItem[] = [
  { href: "/area-privada/alumno", label: "Inicio", icon: "home", exact: true },
  { href: "/area-privada/alumno/ranking", label: "Ranking", icon: "puntos" },
  { href: "/area-privada/alumno/perfil", label: "Perfil", icon: "perfil" },
];

export default async function AlumnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/area-privada");

  return (
    <div className="min-h-dvh">
      {/* Barra lateral de escritorio: navegación arriba, sesión abajo. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-text-strong/8 bg-bg-panel md:flex">
        <div className="px-6 pt-6 pb-8">
          <Link href="/area-privada/alumno" aria-label="Mi área">
            <Logo size={22} />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav items={NAV} />
        </div>
        <div className="border-t border-text-strong/8 px-6 py-5">
          <p className="mb-3 truncate font-body text-xs text-text-muted">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Cabecera móvil: el cierre de sesión no cabe en la barra de pestañas. */}
      <header className="flex items-center justify-between border-b border-text-strong/8 bg-bg-panel px-5 py-3.5 md:hidden">
        <Link href="/area-privada/alumno" aria-label="Mi área">
          <Logo size={20} />
        </Link>
        <SignOutButton />
      </header>

      {/* `pb-24` deja hueco a la barra de pestañas, que va fija al fondo. */}
      <main className="px-5 pt-8 pb-24 md:ml-64 md:px-10 md:pt-10 md:pb-16">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      <TabBar items={NAV} />
    </div>
  );
}
