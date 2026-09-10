import { describe, expect, it } from "vitest";
import { numerarRanking } from "@/lib/queries/ranking";

const fila = (id: string, balance: number, avatar: string | null = null) => ({
  student_id: id,
  full_name: `Alumna ${id}`,
  avatar_path: avatar,
  balance,
});

const sinFotos = () => null;

describe("numerarRanking", () => {
  it("numera del 1 en adelante cuando no hay empates", () => {
    const rows = numerarRanking([fila("a", 30), fila("b", 20), fila("c", 10)], "b", sinFotos);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3]);
  });

  it("los empates comparten puesto y el siguiente salta", () => {
    const rows = numerarRanking(
      [fila("a", 100), fila("b", 100), fila("c", 90), fila("d", 90), fila("e", 10)],
      "z",
      sinFotos,
    );
    expect(rows.map((r) => r.position)).toEqual([1, 1, 3, 3, 5]);
  });

  it("marca al alumno que mira y solo a él", () => {
    const rows = numerarRanking([fila("a", 30), fila("b", 20)], "b", sinFotos);
    expect(rows.map((r) => r.isMe)).toEqual([false, true]);
  });

  it("un saldo de cero no rompe la numeración", () => {
    const rows = numerarRanking([fila("a", 0), fila("b", 0)], "a", sinFotos);
    expect(rows.map((r) => r.position)).toEqual([1, 1]);
  });

  it("resuelve la foto solo de quien tiene ruta", () => {
    const rows = numerarRanking(
      [fila("a", 30, "a/foto.jpg"), fila("b", 20)],
      "a",
      (path) => `https://firmada/${path}`,
    );
    expect(rows[0]?.avatarUrl).toBe("https://firmada/a/foto.jpg");
    expect(rows[1]?.avatarUrl).toBeNull();
  });

  it("una ruta que no se puede firmar cae a null en vez de romper la fila", () => {
    const rows = numerarRanking([fila("a", 30, "a/foto.jpg")], "a", () => null);
    expect(rows[0]?.avatarUrl).toBeNull();
    expect(rows[0]?.fullName).toBe("Alumna a");
  });

  it("una lista vacía devuelve una lista vacía", () => {
    expect(numerarRanking([], "a", sinFotos)).toEqual([]);
  });
});
