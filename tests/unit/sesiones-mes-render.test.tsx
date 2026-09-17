import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { generateSessionsForAllCourses } from "@/lib/actions/courses";

/**
 * El panel vive detrás de `requireRole("admin")`, así que no se puede abrir
 * en el navegador sin sesión (ver dashboard-negocio-render.test.tsx). Estos
 * tests renderizan el bloque de Novedades con las dos coberturas posibles.
 *
 * Las Server Actions se mockean: aquí se comprueba lo que ve el admin, no la
 * escritura — de eso se encargan la RLS y sessions.test.ts.
 */
vi.mock("@/lib/actions/courses", () => ({
  generateSessionsForAllCourses: vi.fn(),
}));

const { SesionesDelMes } = await import(
  "@/app/(es)/area-privada/(dashboard)/admin/_components/SesionesDelMes"
);

describe("SesionesDelMes", () => {
  it("avisa cuando ningún curso tiene sesiones", () => {
    render(
      <SesionesDelMes
        cobertura={{
          month: "2026-09",
          cursosActivos: 15,
          cursosConSesiones: 0,
          sesiones: 0,
        }}
      />,
    );

    expect(screen.getByText(/Sesiones de septiembre de 2026/)).toBeTruthy();
    expect(screen.getByText(/Ningún curso tiene todavía sesiones/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Generar septiembre de 2026/ }),
    ).toBeTruthy();
  });

  it("dice cuántos cursos faltan cuando van a medias", () => {
    render(
      <SesionesDelMes
        cobertura={{
          month: "2026-09",
          cursosActivos: 15,
          cursosConSesiones: 4,
          sesiones: 17,
        }}
      />,
    );
    expect(screen.getByText(/Faltan 11 de 15 cursos/)).toBeTruthy();
  });

  it("cuando están todos, no pinta nada (el cron ya las generó)", () => {
    const { container } = render(
      <SesionesDelMes
        cobertura={{
          month: "2026-09",
          cursosActivos: 15,
          cursosConSesiones: 15,
          sesiones: 64,
        }}
      />,
    );
    expect(container.innerHTML).toBe("");
    expect(screen.queryByText(/Faltan/)).toBeNull();
  });

  it("tras generar, si la cobertura llega completa, confirma en vez de desaparecer", async () => {
    vi.mocked(generateSessionsForAllCourses).mockResolvedValue({
      status: "success",
      message: "Sesiones generadas.",
    } as Awaited<ReturnType<typeof generateSessionsForAllCourses>>);

    const { rerender } = render(
      <SesionesDelMes
        cobertura={{ month: "2026-09", cursosActivos: 15, cursosConSesiones: 4, sesiones: 17 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Generar septiembre de 2026/ }));
    expect(await screen.findByRole("status")).toHaveProperty("textContent", "Sesiones generadas.");

    // revalidatePath devuelve la cobertura nueva al mismo componente montado.
    rerender(
      <SesionesDelMes
        cobertura={{ month: "2026-09", cursosActivos: 15, cursosConSesiones: 15, sesiones: 64 }}
      />,
    );
    expect(screen.getByText(/ya tienen sus sesiones/)).toBeTruthy();
    expect(screen.getByText(/64 en total/)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Sesiones generadas.");
    expect(screen.queryByText(/Faltan/)).toBeNull();
  });
});
