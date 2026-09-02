import { describe, expect, it } from "vitest";
import { phoneSchema, studentSchema, studentNotesSchema } from "@/lib/validation/student";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const validStudent = {
  full_name: "Ana Ruiz",
  phone: "+34600000000",
  email: "ana@example.com",
  birthday: "",
  dance_role: "follower",
  nivel_id: "",
  partner_id: "",
  payment_status: "al_dia",
  is_founding_member: false,
  notes: "",
  active: true,
};

describe("phoneSchema", () => {
  it("acepta los formatos con los que se apunta la gente", () => {
    for (const phone of [
      "+34600000000",
      "600 11 22 33",
      "+34 600 00 00 00",
      "0033 6 12 34 56 78",
      "+1 (555) 123-4567",
      "+491701234567",
    ]) {
      expect(phoneSchema.safeParse(phone).success).toBe(true);
    }
  });

  it("solo rechaza lo que no es un teléfono", () => {
    for (const phone of [
      "", // vacío
      "600", // demasiado corto
      "seis cero cero", // letras
      "+34600000000 ext. 12", // letras
      "+3460000000000000000000000", // demasiado largo
    ]) {
      expect(phoneSchema.safeParse(phone).success).toBe(false);
    }
  });
});

describe("studentSchema", () => {
  it("acepta un alumno válido", () => {
    expect(studentSchema.safeParse(validStudent).success).toBe(true);
  });

  it("acepta el teléfono en formato libre", () => {
    for (const phone of ["600000000", "600 11 22 33", "+33 6 12 34 56 78"]) {
      expect(studentSchema.safeParse({ ...validStudent, phone }).success).toBe(true);
    }
  });

  it("sigue rechazando lo que no es un teléfono", () => {
    const parsed = studentSchema.safeParse({ ...validStudent, phone: "no tengo" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.phone?.[0]).toBe(
      "El teléfono solo puede tener números y símbolos",
    );
  });

  it("solo admite los roles de baile del enum", () => {
    for (const dance_role of ["leader", "follower", "both"]) {
      expect(studentSchema.safeParse({ ...validStudent, dance_role }).success).toBe(true);
    }
    const parsed = studentSchema.safeParse({ ...validStudent, dance_role: "dj" });
    expect(parsed.error?.flatten().fieldErrors.dance_role?.[0]).toBe("Elige un rol de baile");
  });

  it("solo admite los estados de cuota del enum", () => {
    expect(studentSchema.safeParse({ ...validStudent, payment_status: "pendiente" }).success).toBe(
      true,
    );
    expect(studentSchema.safeParse({ ...validStudent, payment_status: "moroso" }).success).toBe(
      false,
    );
  });

  it("trata nivel_id y partner_id como opcionales, pero UUID si vienen", () => {
    expect(studentSchema.safeParse({ ...validStudent, nivel_id: "" }).success).toBe(true);
    expect(studentSchema.safeParse({ ...validStudent, nivel_id: UUID }).success).toBe(true);
    expect(studentSchema.safeParse({ ...validStudent, partner_id: "abc" }).success).toBe(false);
  });

  it("recorta el nombre y rechaza los que quedan por debajo de 2 caracteres", () => {
    expect(studentSchema.parse({ ...validStudent, full_name: "  Ana Ruiz " }).full_name).toBe(
      "Ana Ruiz",
    );
    expect(studentSchema.safeParse({ ...validStudent, full_name: " A " }).success).toBe(false);
  });

  it("exige email: es la identidad con la que entra al área privada", () => {
    expect(studentSchema.safeParse({ ...validStudent, email: "" }).success).toBe(false);
    expect(studentSchema.safeParse({ ...validStudent, email: "no-es-email" }).success).toBe(
      false,
    );
    expect(studentSchema.parse({ ...validStudent, email: "  ANA@Example.com " }).email).toBe(
      "ana@example.com",
    );
  });

  it("acepta cumpleaños vacío, pero si viene tiene que ser una fecha pasada", () => {
    expect(studentSchema.safeParse({ ...validStudent, birthday: "" }).success).toBe(true);
    expect(studentSchema.safeParse({ ...validStudent, birthday: "1990-05-17" }).success).toBe(
      true,
    );
    expect(studentSchema.safeParse({ ...validStudent, birthday: "17/05/1990" }).success).toBe(
      false,
    );
    expect(studentSchema.safeParse({ ...validStudent, birthday: "2999-01-01" }).success).toBe(
      false,
    );
    expect(studentSchema.safeParse({ ...validStudent, birthday: "1800-01-01" }).success).toBe(
      false,
    );
  });

  it("limita las notas a 2000 caracteres", () => {
    expect(studentSchema.safeParse({ ...validStudent, notes: "x".repeat(2000) }).success).toBe(
      true,
    );
    expect(studentSchema.safeParse({ ...validStudent, notes: "x".repeat(2001) }).success).toBe(
      false,
    );
  });
});

describe("studentNotesSchema", () => {
  it("exige un student_id con forma de UUID", () => {
    expect(studentNotesSchema.safeParse({ student_id: UUID, notes: "Va muy bien" }).success).toBe(
      true,
    );
    expect(studentNotesSchema.safeParse({ student_id: "42", notes: "" }).success).toBe(false);
  });
});
