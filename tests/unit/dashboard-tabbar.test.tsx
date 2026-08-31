import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabBar, type NavItem } from "@/app/area-privada/(dashboard)/DashboardNav";

const pathname = vi.hoisted(() => ({ current: "/area-privada/admin" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

beforeEach(() => {
  pathname.current = "/area-privada/admin";
});

/** Las diez secciones reales del panel de admin (espejo de layout.tsx). */
const ADMIN: NavItem[] = [
  { href: "/area-privada/admin", label: "Novedades", icon: "home", short: "Inicio", exact: true },
  { href: "/area-privada/admin/dashboard", label: "Dashboard", icon: "negocio", short: "Datos" },
  { href: "/area-privada/admin/leads", label: "Leads", icon: "leads" },
  { href: "/area-privada/admin/alumnos", label: "Alumnos", icon: "students" },
  { href: "/area-privada/admin/cursos", label: "Cursos", icon: "courses" },
  { href: "/area-privada/admin/profesores", label: "Profesores", icon: "teachers", short: "Profes" },
  { href: "/area-privada/admin/eventos", label: "Eventos", icon: "eventos" },
  { href: "/area-privada/admin/intensivos", label: "Intensivos", icon: "intensivos", short: "Intens." },
  { href: "/area-privada/admin/gamificacion", label: "Gamificación", icon: "puntos", short: "Puntos" },
  { href: "/area-privada/admin/whatsapp", label: "WhatsApp", icon: "whatsapp", short: "WA" },
];

const PROFESOR: NavItem[] = [
  { href: "/area-privada/profesor", label: "Hoy", icon: "today", exact: true },
  { href: "/area-privada/profesor/cursos", label: "Mis cursos", icon: "courses" },
];

/**
 * La barra de pestañas es la única navegación del panel por debajo de 768px.
 * Con diez secciones no caben diez pestañas a 320px sin bajar de los 44px de
 * objetivo táctil, así que las que sobran viven detrás de "Más" — y si ese
 * botón no funciona, la mitad del panel deja de existir en móvil.
 */
describe("TabBar del panel", () => {
  it("con pocos ítems los enseña todos y no saca el botón Más", () => {
    render(<TabBar items={PROFESOR} />);
    expect(screen.getByRole("link", { name: /Hoy/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mis cursos/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Más/ })).not.toBeInTheDocument();
  });

  it("con las diez secciones deja cuatro pestañas y esconde el resto", () => {
    render(<TabBar items={ADMIN} />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /Más/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("link", { name: /WA/ })).not.toBeInTheDocument();
    // Dashboard va en las visibles: es la vista de negocio, no una sección más.
    expect(screen.getByRole("link", { name: /Datos/ })).toBeInTheDocument();
  });

  it("Más despliega las secciones restantes y todas son alcanzables", async () => {
    const user = userEvent.setup();
    render(<TabBar items={ADMIN} />);

    await user.click(screen.getByRole("button", { name: /Más/ }));

    for (const label of ["Cursos", "Profes", "Eventos", "Intens.", "Puntos", "WA"]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
    }
    // Ningún enlace del panel se queda sin ruta que abrir.
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const item of ADMIN) expect(hrefs).toContain(item.href);
  });

  it("se cierra volviendo a pulsar Más", async () => {
    const user = userEvent.setup();
    render(<TabBar items={ADMIN} />);
    const mas = screen.getByRole("button", { name: /Más/ });

    await user.click(mas);
    expect(mas).toHaveAttribute("aria-expanded", "true");

    await user.click(mas);
    expect(mas).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /WA/ })).not.toBeInTheDocument();
  });

  it("marca como activa la pestaña de la ruta actual", () => {
    pathname.current = "/area-privada/admin/leads";
    render(<TabBar items={ADMIN} />);
    expect(screen.getByRole("link", { name: /Leads/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // "Novedades" es `exact`: no debe quedarse activa en las rutas hijas.
    expect(screen.getByRole("link", { name: /Inicio/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("resalta Más cuando la sección abierta es una de las escondidas", () => {
    pathname.current = "/area-privada/admin/gamificacion/premios";
    render(<TabBar items={ADMIN} />);
    // Sin esta señal, el usuario no tiene forma de saber dónde está.
    expect(screen.getByRole("button", { name: /Más/ }).className).toContain(
      "text-accent",
    );
  });
});
