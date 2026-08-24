import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_SITE } from "@/components/layout/nav-items";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

beforeEach(() => {
  pathname.current = "/";
  document.body.style.overflow = "";
});

/**
 * El menú móvil es la única vía de navegación por debajo de md: si el panel no
 * abre, o no se puede cerrar, la web queda sin navegación en el 70% del tráfico.
 */
describe("MobileNav", () => {
  it("arranca cerrado, con el disparador anunciado como colapsado", () => {
    render(<MobileNav items={NAV_SITE} />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre el panel con todos los enlaces del sitio", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveAttribute("aria-modal", "true");
    for (const item of NAV_SITE) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.href);
    }
  });

  it("monta el panel en <body>, fuera de la cabecera", async () => {
    // El panel es `fixed inset-0`, y `backdrop-filter`/`filter`/`transform` en
    // un ancestro lo convertirían en bloque contenedor: el menú abriría con la
    // altura de la cabecera (bug del 24-08-2026: 128 px, ~1/6 de la pantalla).
    // El portal a <body> es lo que garantiza que `inset-0` sea el viewport.
    const user = userEvent.setup();
    const { container } = render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const panel = await screen.findByRole("dialog");
    expect(panel.parentElement).toBe(document.body);
    expect(container.contains(panel)).toBe(false);
  });

  it("el panel se declara a pantalla completa y desplazable", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const panel = await screen.findByRole("dialog");
    // `fixed inset-0` = viewport entero; `overflow-y-auto` = si algún día no
    // caben todos los enlaces, se llega a ellos desplazando.
    expect(panel.className).toContain("fixed");
    expect(panel.className).toContain("inset-0");
    expect(panel.className).toContain("overflow-y-auto");
  });

  it("incluye el CTA de WhatsApp dentro del panel", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const cta = await screen.findByRole("link", { name: /clase de prueba/i });
    expect(cta.getAttribute("href")).toContain("https://wa.me/");
  });

  it("refleja el estado abierto en aria-expanded y en la etiqueta", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    const toggle = await screen.findByRole("button", { name: "Cerrar menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("cierra al volver a pulsar el disparador", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("cierra con Escape y devuelve el foco al disparador", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    await user.click(toggle);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
  });

  it("bloquea el scroll del fondo mientras está abierto y lo restaura al cerrar", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await waitFor(() => expect(document.body.style.overflow).toBe("hidden"));

    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
  });

  it("lleva el foco al primer enlace al abrir", async () => {
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: NAV_SITE[0]!.label })).toHaveFocus(),
    );
  });

  it("marca como página actual el enlace de la ruta activa", async () => {
    pathname.current = "/clases/bachata";
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByRole("link", { name: "Clases" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "FAQ" })).not.toHaveAttribute("aria-current");
  });

  it("no marca /clases como activa cuando la ruta solo comparte prefijo de texto", async () => {
    pathname.current = "/clases-particulares";
    const user = userEvent.setup();
    render(<MobileNav items={NAV_SITE} />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByRole("link", { name: "Clases" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
