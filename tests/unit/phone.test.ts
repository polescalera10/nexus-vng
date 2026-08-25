import { describe, expect, it } from "vitest";
import { normalizePhone, toE164 } from "@/lib/phone";

/**
 * El puente entre el teléfono de texto libre de un lead y el E.164 que exige
 * `students.phone`. Si esto falla, convertir un lead en alumno revienta contra
 * el CHECK de la BD y el mensaje de error no dice nada útil.
 */
describe("normalizePhone", () => {
  it("asume España en los números de nueve dígitos", () => {
    expect(normalizePhone("600111222")).toBe("34600111222");
    expect(normalizePhone("600 11 12 22")).toBe("34600111222");
  });

  it("recorta el 00 internacional", () => {
    expect(normalizePhone("0034600111222")).toBe("34600111222");
  });

  it("conserva el prefijo cuando ya viene", () => {
    expect(normalizePhone("+34 600 111 222")).toBe("34600111222");
    expect(normalizePhone("+49 170 1234567")).toBe("491701234567");
  });

  it("descarta lo que no puede ser un teléfono", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("1".repeat(16))).toBeNull();
  });
});

describe("toE164", () => {
  it("devuelve el formato que exige students_phone_e164", () => {
    expect(toE164("600111222")).toBe("+34600111222");
    expect(toE164("+34 600 111 222")).toBe("+34600111222");
  });

  it("devuelve null si el número no es convertible", () => {
    expect(toE164("no soy un teléfono")).toBeNull();
  });
});
