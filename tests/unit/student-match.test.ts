import { describe, expect, it } from "vitest";
import {
  matchLeadsToStudents,
  nombresCompatibles,
  type StudentLike,
} from "@/lib/leads/student-match";

/**
 * Casos sacados de la base real el 23-09-2026, con las 8 inscripciones de la
 * primera masterclass: 5 de las 8 personas ya eran alumnas, y solo 2 tenían el
 * nombre escrito exactamente igual en las dos tablas.
 */

const alumnos: StudentLike[] = [
  {
    id: "a-sara",
    full_name: "Sara Romero Lembarki",
    phone: "+34608489742",
    email: "sararihh@gmail.com",
  },
  // Sin acentos en la ficha, con acentos en el lead.
  { id: "a-carme", full_name: "Carme Sangres Masip", phone: null, email: "tretzeagost@gmail.com" },
  // En la ficha solo el nombre de pila.
  { id: "a-manuel", full_name: "Manuel", phone: "637703306", email: "manuel31394@gmail.com" },
  // En la ficha falta el segundo apellido.
  { id: "a-noelia", full_name: "Noelia Barroso", phone: "722263862", email: null },
  // Pareja que comparte móvil Y email (pasa de verdad en esta base).
  { id: "a-fran", full_name: "Fran", phone: "600111222", email: "pareja@example.com" },
  { id: "a-majo", full_name: "Maria Jose", phone: "600111222", email: "pareja@example.com" },
];

const lead = (id: string, nombre: string, telefono: string | null, email: string | null) => ({
  id,
  nombre,
  telefono,
  email,
});

describe("nombresCompatibles", () => {
  it("acepta el nombre incompleto en una de las dos tablas", () => {
    expect(nombresCompatibles("Noelia Barroso guijo", "Noelia Barroso")).toBe(true);
    expect(nombresCompatibles("Manuel", "Manuel Martin")).toBe(true);
    expect(nombresCompatibles("Carme Sangrés Masip", "Carme Sangres Masip")).toBe(true);
  });

  it("no acepta dos personas distintas", () => {
    expect(nombresCompatibles("Fran", "Maria Jose")).toBe(false);
    expect(nombresCompatibles("Barroso Noelia", "Noelia Barroso")).toBe(false);
    expect(nombresCompatibles("Ana", "")).toBe(false);
  });
});

describe("matchLeadsToStudents", () => {
  it("reconoce a la alumna aunque el nombre esté escrito distinto", () => {
    const leads = [
      lead("l-sara", "Sara Romero Lembarki", "608489742", "sararihh@gmail.com"),
      lead("l-carme", "Carme Sangrés Masip", "620262914", "tretzeagost@gmail.com"),
      lead("l-manuel", "Manuel Martin", "637703306", "manuel31394@gmail.com"),
      lead("l-noelia", "Noelia Barroso guijo", "722263862", "noeliia.bg95@gmail.com"),
    ];
    const m = matchLeadsToStudents(leads, alumnos);
    expect(m.get("l-sara")?.id).toBe("a-sara");
    expect(m.get("l-carme")?.id).toBe("a-carme");
    expect(m.get("l-manuel")?.id).toBe("a-manuel");
    expect(m.get("l-noelia")?.id).toBe("a-noelia");
  });

  it("casa el teléfono con y sin prefijo", () => {
    const m = matchLeadsToStudents(
      [lead("l", "Sara Romero Lembarki", "+34 608 48 97 42", null)],
      alumnos,
    );
    expect(m.get("l")?.id).toBe("a-sara");
  });

  it("no confunde a una pareja que comparte móvil y email", () => {
    const m = matchLeadsToStudents(
      [lead("l", "Maria Jose", "600111222", "pareja@example.com")],
      alumnos,
    );
    expect(m.get("l")?.id).toBe("a-majo");
  });

  it("con dos alumnos posibles no elige: lo mira una persona", () => {
    const m = matchLeadsToStudents(
      [lead("l", "Fran", "600111222", "pareja@example.com")],
      [...alumnos, { id: "a-fran2", full_name: "Fran", phone: "600111222", email: null }],
    );
    expect(m.has("l")).toBe(false);
  });

  it("quien no está en la escuela no casa con nadie", () => {
    const leads = [
      lead("l1", "Jose Pareja Campillo", "+34 679 84 56 00", "joseepk88@gmail.com"),
      lead("l2", "Nerea Miralles", "+34607208202", "mirferne@gmail.com"),
    ];
    expect(matchLeadsToStudents(leads, alumnos).size).toBe(0);
  });

  it("un lead sin nombre no casa con nadie", () => {
    expect(matchLeadsToStudents([lead("l", "  ", "608489742", null)], alumnos).size).toBe(0);
  });
});
