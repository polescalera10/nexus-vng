import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Fila de sesión del admin: cambiar la fecha y borrar.
 *
 * Borrar arrastra `attendance`, `session_notes` y `session_videos` por ON
 * DELETE CASCADE (0043a), así que el borrado en dos pasos es la única red que
 * hay. Estos tests fijan ese comportamiento: sin confirmar, no se borra.
 */

const deleteSession = vi.fn();
const updateSessionDate = vi.fn();

vi.mock("@/lib/actions/courses", () => ({
  assignSubstitute: vi.fn(),
  deleteSession: (...a: unknown[]) => deleteSession(...a),
  generateSessions: vi.fn(),
  updateSessionDate: (...a: unknown[]) => updateSessionDate(...a),
  updateSessionStatus: vi.fn(),
}));

const { SessionList } = await import(
  "@/app/area-privada/(dashboard)/admin/cursos/[id]/SessionList"
);

const SESSION = {
  id: "11111111-1111-4111-8111-111111111111",
  session_date: "2026-09-07",
  status: "programada" as const,
  substitute_teacher_id: null,
  substituteName: null,
};

const renderFila = () =>
  render(<SessionList sessions={[SESSION]} substitutes={[]} />);

beforeEach(() => {
  deleteSession.mockReset();
  updateSessionDate.mockReset();
});

describe("cambiar la fecha", () => {
  it("la fecha es pulsable y abre el selector", async () => {
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: /7 sept 2026/ }));

    const input = screen.getByLabelText("Nueva fecha de la sesión");
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("2026-09-07");
  });

  it("no deja guardar si no has cambiado nada", async () => {
    const user = userEvent.setup();
    renderFila();
    await user.click(screen.getByRole("button", { name: /7 sept 2026/ }));

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("guarda la fecha nueva", async () => {
    updateSessionDate.mockResolvedValue({ status: "success" });
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: /7 sept 2026/ }));
    const input = screen.getByLabelText("Nueva fecha de la sesión");
    await user.clear(input);
    await user.type(input, "2026-09-10");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(updateSessionDate).toHaveBeenCalledWith(SESSION.id, "2026-09-10"),
    );
  });

  it("enseña el choque de fechas sin dejar un error de Postgres en pantalla", async () => {
    updateSessionDate.mockResolvedValue({
      status: "error",
      message: "Ya hay una sesión de este curso ese día.",
    });
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: /7 sept 2026/ }));
    const input = screen.getByLabelText("Nueva fecha de la sesión");
    await user.clear(input);
    await user.type(input, "2026-09-14");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText("Ya hay una sesión de este curso ese día."),
    ).toBeTruthy();
  });
});

describe("borrar", () => {
  it("una sesión vacía se borra al primer clic, sin fricción", async () => {
    deleteSession.mockResolvedValue({ status: "success" });
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: "Borrar" }));

    await waitFor(() => expect(deleteSession).toHaveBeenCalledWith(SESSION.id, false));
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });

  it("con lista o diario pide confirmación y dice qué se pierde", async () => {
    deleteSession.mockResolvedValueOnce({
      status: "error",
      usage: { asistencia: 12, diario: true },
      message:
        "Esta sesión tiene datos: se perdería la lista de 12 alumnos y el diario con sus vídeos. Confirma para borrarla.",
    });
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: "Borrar" }));

    expect(await screen.findByText(/se perdería la lista de 12 alumnos/)).toBeTruthy();
    // El primer clic NO ha borrado: la action se negó.
    expect(deleteSession).toHaveBeenCalledWith(SESSION.id, false);
    expect(screen.getByRole("button", { name: "Sí, borrar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "No" })).toBeTruthy();
  });

  it("el segundo clic sí fuerza el borrado", async () => {
    deleteSession
      .mockResolvedValueOnce({
        status: "error",
        usage: { asistencia: 3, diario: false },
        message: "Esta sesión tiene datos: se perdería la lista de 3 alumnos.",
      })
      .mockResolvedValueOnce({ status: "success" });

    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: "Borrar" }));
    await user.click(await screen.findByRole("button", { name: "Sí, borrar" }));

    await waitFor(() => expect(deleteSession).toHaveBeenLastCalledWith(SESSION.id, true));
  });

  it("con No se echa atrás y no vuelve a llamar", async () => {
    deleteSession.mockResolvedValueOnce({
      status: "error",
      usage: { asistencia: 3, diario: false },
      message: "Esta sesión tiene datos.",
    });
    const user = userEvent.setup();
    renderFila();

    await user.click(screen.getByRole("button", { name: "Borrar" }));
    await user.click(await screen.findByRole("button", { name: "No" }));

    expect(screen.queryByRole("button", { name: "Sí, borrar" })).toBeNull();
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });
});
