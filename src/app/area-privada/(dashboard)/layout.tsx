import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/Logo";
import { SignOutButton } from "@/app/area-privada/SignOutButton";
import { SidebarNav, TabBar, type NavItem } from "./DashboardNav";

/**
 * Shell del área interna (admin + profesor).
 * Escritorio: sidebar fija. Móvil: barra de pestañas inferior para el pulgar.
 * El guardado fino de cada ruta lo hace requireRole en cada página;
 * aquí solo se resuelve el rol para pintar la navegación correcta.
 */

const NAV: Record<"admin" | "profesor", NavItem[]> = {
  admin: [
    { href: "/area-privada/admin", label: "Novedades", icon: "home", short: "Inicio", exact: true },
    { href: "/area-privada/admin/leads", label: "Leads", icon: "leads" },
    {
      href: "/area-privada/admin/intensivos",
      label: "Intensivos",
      icon: "intensivos",
      short: "Intens.",
    },
    { href: "/area-privada/admin/alumnos", label: "Alumnos", icon: "students" },
    { href: "/area-privada/admin/cursos", label: "Cursos", icon: "courses" },
    {
      href: "/area-privada/admin/profesores",
      label: "Profesores",
      icon: "teachers",
      short: "Profes",
    },
    { href: "/area-privada/admin/eventos", label: "Eventos", icon: "eventos" },
    {
      href: "/area-privada/admin/gamificacion",
      label: "Gamificación",
      icon: "puntos",
      short: "Puntos",
    },
    { href: "/area-privada/admin/whatsapp", label: "WhatsApp", icon: "whatsapp", short: "WA" },
  ],
  profesor: [
    { href: "/area-privada/profesor", label: "Hoy", icon: "today", exact: true },
    { href: "/area-privada/profesor/cursos", label: "Mis cursos", icon: "courses" },
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/area-privada");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "alumno";
  if (role === "alumno") redirect("/area-privada/alumno");

  const items = NAV[role];

  return (
    <div className="min-h-dvh">
      {/* Sidebar de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-text-strong/8 bg-bg-panel md:flex">
        <div className="px-6 pt-6 pb-8">
          <Logo size={22} />
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav items={items} />
        </div>
        <div className="border-t border-text-strong/8 px-6 py-5">
          <p className="mb-3 truncate font-body text-xs text-text-muted">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Cabecera móvil */}
      <header className="flex items-center justify-between border-b border-text-strong/8 bg-bg-panel px-5 py-3.5 md:hidden">
        <Logo size={20} />
        <SignOutButton />
      </header>

      {/* Contenido — hueco inferior en móvil para la barra de pestañas */}
      <main className="px-5 pt-8 pb-24 md:ml-64 md:px-10 md:pt-10 md:pb-16">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      <TabBar items={items} />
    </div>
  );
}
