import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/(es)/area-privada/LoginForm";

const signInWithOtp = vi.hoisted(() => vi.fn());
const signInWithPassword = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithOtp, signInWithPassword } }),
}));

beforeEach(() => {
  signInWithOtp.mockReset().mockResolvedValue({ error: null });
  signInWithPassword.mockReset();
});

/**
 * El login del área privada es SOLO por enlace. La pestaña de contraseña se
 * retiró el 22-09-2026: nadie tenía contraseña y confundía a los alumnos.
 */
describe("LoginForm", () => {
  it("no ofrece ninguna vía con contraseña", () => {
    render(<LoginForm />);
    expect(screen.queryByRole("tab", { name: "Contraseña" })).toBeNull();
    expect(screen.queryByLabelText("Contraseña")).toBeNull();
    expect(screen.getByRole("button", { name: "Enviarme el enlace" })).toBeInTheDocument();
  });

  it("pide el enlace sin crear cuentas nuevas", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "alumna@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviarme el enlace" }));

    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledTimes(1));
    const [args] = signInWithOtp.mock.calls[0]!;
    expect(args.email).toBe("alumna@example.com");
    expect(args.options.shouldCreateUser).toBe(false);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  /**
   * El middleware guarda en `?redirect=` la página privada que se pidió sin
   * sesión y la página la pasa aquí: si no viajara al callback, el alumno
   * acabaría siempre en la portada del panel.
   */
  it("lleva al callback la página que se había pedido", async () => {
    render(<LoginForm redirectTo="/area-privada/admin/leads" />);
    await userEvent.type(screen.getByLabelText("Email"), "admin@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviarme el enlace" }));

    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledTimes(1));
    const destino = new URL(signInWithOtp.mock.calls[0]![0].options.emailRedirectTo);
    expect(destino.pathname).toBe("/area-privada/callback");
    expect(destino.searchParams.get("next")).toBe("/area-privada/admin/leads");
  });

  it("avisa cuando el email no es de ninguna cuenta", async () => {
    signInWithOtp.mockResolvedValue({ error: { message: "Signups not allowed for otp" } });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "nadie@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviarme el enlace" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No hemos podido enviar el enlace",
    );
  });

  it("con un enlace caducado lo dice al abrir", () => {
    render(<LoginForm initialError />);
    expect(screen.getByRole("alert")).toHaveTextContent("Ese enlace ya no vale");
  });
});
