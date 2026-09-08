import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
  "@/app/area-privada/(dashboard)/admin/_components/SesionesDelMes"
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

  it("cuando están todos, no alarma y ofrece regenerar", () => {
    render(
      <SesionesDelMes
        cobertura={{
          month: "2026-09",
          cursosActivos: 15,
          cursosConSesiones: 15,
          sesiones: 64,
        }}
      />,
    );
    expect(screen.getByText(/ya tienen sus sesiones/)).toBeTruthy();
    expect(screen.getByText(/64 en total/)).toBeTruthy();
    expect(screen.queryByText(/Faltan/)).toBeNull();
  });
});
