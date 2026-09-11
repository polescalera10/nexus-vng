import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Onboarding } from "@/app/area-privada/alumno/Onboarding";

const router = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
const marcar = vi.hoisted(() => vi.fn(async () => ({ ok: true })));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/actions/perfil", () => ({ marcarOnboardingVisto: marcar }));

beforeEach(() => {
  router.refresh.mockClear();
  router.push.mockClear();
  marcar.mockClear();
  document.body.style.overflow = "";
});

/**
 * La bienvenida sale una sola vez por alumno. Si se cierra sin marcarse como
 * vista, vuelve en cada visita y se convierte en un estorbo; si se marca sin
 * enseñarse, el alumno se queda sin saber qué hay en su área.
 */
describe("Onboarding", () => {
  it("explica las tres secciones", () => {
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    const dialogo = screen.getByRole("dialog");
    for (const seccion of ["Inicio", "Ranking", "Perfil"]) {
      expect(screen.getByText(seccion)).toBeInTheDocument();
    }
    expect(dialogo).toHaveAttribute("aria-modal", "true");
  });

  it("dice qué falta y cuántos puntos da", () => {
    render(
      <Onboarding
        nombre="Ana"
        pendientes={["apellidos", "foto"]}
        puntosPremio={10}
      />,
    );
    expect(screen.getByText(/Completa tu perfil y suma 10 puntos/)).toBeInTheDocument();
    expect(screen.getByText(/tus apellidos y tu foto/)).toBeInTheDocument();
  });

  it("con el perfil ya completo no pide nada y ofrece un solo botón", () => {
    render(<Onboarding nombre="Ana" pendientes={[]} puntosPremio={10} />);
    expect(screen.getByText("Tu perfil ya está completo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entendido" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Completar mi perfil" }),
    ).not.toBeInTheDocument();
  });

  it("el aspa cierra y la marca como vista", async () => {
    const user = userEvent.setup();
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    await user.click(screen.getByRole("button", { name: "Cerrar la bienvenida" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(marcar).toHaveBeenCalledTimes(1);
  });

  it("solo hay un cerrar anunciado: el fondo no duplica el aspa", () => {
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    expect(screen.getAllByRole("button", { name: "Cerrar la bienvenida" })).toHaveLength(
      1,
    );
  });

  it('"Completar mi perfil" la marca como vista y lleva al perfil', async () => {
    const user = userEvent.setup();
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    await user.click(screen.getByRole("button", { name: "Completar mi perfil" }));

    await waitFor(() => expect(marcar).toHaveBeenCalledTimes(1));
    expect(router.push).toHaveBeenCalledWith("/area-privada/alumno/perfil");
  });

  it("Escape también la cierra y la marca: no vuelve mañana", async () => {
    const user = userEvent.setup();
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(marcar).toHaveBeenCalledTimes(1);
  });

  it("devuelve el scroll del fondo al cerrarse", async () => {
    const user = userEvent.setup();
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Cerrar la bienvenida" }));
    await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
  });

  it("el botón vive fuera del cuerpo que hace scroll, para no quedar bajo el pliegue", () => {
    render(<Onboarding nombre="Ana" pendientes={["foto"]} puntosPremio={10} />);
    const boton = screen.getByRole("button", { name: "Completar mi perfil" });
    const scroller = boton.closest(".overflow-y-auto");
    expect(scroller).toBeNull();
  });
});
