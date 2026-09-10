import { describe, expect, it } from "vitest";
import { avatarPathSchema, perfilAlumnoSchema } from "@/lib/validation/perfil";

const valido = {
  full_name: "Ana Ruiz Gil",
  phone: "600 11 22 33",
  birthday: "1995-04-12",
  dance_role: "follower" as const,
  show_in_leaderboard: true,
};

describe("perfilAlumnoSchema", () => {
  it("acepta un perfil completo", () => {
    expect(perfilAlumnoSchema.safeParse(valido).success).toBe(true);
  });

  it("el cumpleaños puede quedarse vacío", () => {
    expect(perfilAlumnoSchema.safeParse({ ...valido, birthday: "" }).success).toBe(true);
  });

  it("rechaza una fecha futura", () => {
    expect(
      perfilAlumnoSchema.safeParse({ ...valido, birthday: "2099-01-01" }).success,
    ).toBe(false);
  });

  it("rechaza un nombre de una sola letra", () => {
    expect(perfilAlumnoSchema.safeParse({ ...valido, full_name: "A" }).success).toBe(false);
  });

  /**
   * El esquema es la lista blanca del lado de la app y tiene que cuadrar con el
   * guard de Postgres (0044b). Si algún día alguien añade aquí un campo que el
   * alumno no debería tocar, este test no lo pilla — pero sí pilla lo contrario:
   * que un campo prohibido se cuele desde el formulario.
   */
  it("ignora los campos que el alumno no puede tocar", () => {
    const parsed = perfilAlumnoSchema.safeParse({
      ...valido,
      payment_status: "al_dia",
      is_founding_member: true,
      notes: "me pongo un sobresaliente",
      active: true,
      profile_id: "00000000-0000-0000-0000-000000000000",
    });
    expect(parsed.success).toBe(true);
    expect(Object.keys(parsed.success ? parsed.data : {}).sort()).toEqual([
      "birthday",
      "dance_role",
      "full_name",
      "phone",
      "show_in_leaderboard",
    ]);
  });
});

describe("avatarPathSchema", () => {
  const id = "8bcd48b8-50ad-4e53-9b30-a71b811e8da7";

  it("acepta <uuid>/<fichero>", () => {
    expect(avatarPathSchema.safeParse(`${id}/foto.jpg`).success).toBe(true);
  });

  it("rechaza salir de la carpeta", () => {
    expect(avatarPathSchema.safeParse(`${id}/../otro/foto.jpg`).success).toBe(false);
    expect(avatarPathSchema.safeParse("../../foto.jpg").success).toBe(false);
  });

  it("rechaza una ruta sin carpeta", () => {
    expect(avatarPathSchema.safeParse("foto.jpg").success).toBe(false);
  });

  it("rechaza subcarpetas de más", () => {
    expect(avatarPathSchema.safeParse(`${id}/sub/foto.jpg`).success).toBe(false);
  });

  it("rechaza una carpeta que no es un uuid", () => {
    expect(avatarPathSchema.safeParse("admin/foto.jpg").success).toBe(false);
  });
});
