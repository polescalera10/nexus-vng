import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { RedemptionListItem } from "@/lib/queries/gamificacion";

/**
 * Sección de notificaciones de Novedades. El panel está detrás de
 * `requireRole("admin")` y no se puede abrir sin sesión, así que se renderiza
 * el componente con datos (ver dashboard-negocio-render.test.tsx).
 */
vi.mock("@/lib/actions/gamificacion", () => ({
  resolveRedemption: vi.fn(),
}));

const { Notificaciones } = await import(
  "@/app/area-privada/(dashboard)/admin/_components/Notificaciones"
);

const canje = (over: Partial<RedemptionListItem> = {}): RedemptionListItem =>
  ({
    id: "11111111-1111-4111-8111-111111111111",
    student_id: "22222222-2222-4222-8222-222222222222",
    reward_id: "33333333-3333-4333-8333-333333333333",
    cost_points: 150,
    status: "solicitado",
    notes: null,
    requested_at: new Date().toISOString(),
    resolved_at: null,
    resolved_by: null,
    studentName: "Laura Galindo",
    rewardName: "Clase particular de 30 min",
    ...over,
  }) as RedemptionListItem;

describe("Notificaciones", () => {
  it("sin nada pendiente explica qué aparecerá aquí", () => {
    render(<Notificaciones canjes={[]} />);
    expect(screen.getByText(/Nada pendiente/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Entregado" })).toBeNull();
  });

  it("dice quién ha pedido qué, con los puntos y el cuándo", () => {
    render(<Notificaciones canjes={[canje()]} />);

    expect(screen.getByText(/Laura Galindo/)).toBeTruthy();
    expect(screen.getByText(/Clase particular de 30 min/)).toBeTruthy();
    expect(screen.getByText(/150 puntos/)).toBeTruthy();
  });

  it("se resuelve desde aquí, sin ir a Gamificación", () => {
    render(<Notificaciones canjes={[canje()]} />);
    expect(screen.getByRole("button", { name: "Entregado" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
  });

  it("lleva la cuenta en el título", () => {
    render(<Notificaciones canjes={[canje(), canje({ id: "otro" })]} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  /** Un premio borrado no debe dejar la notificación ilegible. */
  it("aguanta que el alumno o el premio ya no existan", () => {
    render(
      <Notificaciones canjes={[canje({ studentName: null, rewardName: null })]} />,
    );
    expect(screen.getByText(/Alumno eliminado/)).toBeTruthy();
    expect(screen.getByText(/un premio eliminado/)).toBeTruthy();
  });
});
