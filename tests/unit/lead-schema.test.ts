import { describe, expect, it } from "vitest";
import {
  interestLeadSchema,
  leadSchema,
  masterclassLeadSchema,
} from "@/lib/validation/lead";

/** Lead válido mínimo, para mutar campo a campo en cada caso. */
const validLead = {
  nombre: "Ana Ruiz",
  telefono: "+34 600 00 00 00",
  email: "",
  modalidad_interes: "",
  origen: "clase-prueba",
  mensaje: "",
  consentimiento: "on",
  website: "",
};

describe("leadSchema", () => {
  it("acepta el mínimo real: nombre + teléfono + origen + consentimiento", () => {
    const parsed = leadSchema.safeParse(validLead);
    expect(parsed.success).toBe(true);
  });

  it("exige el consentimiento RGPD explícito", () => {
    for (const consentimiento of ["", undefined, "off", "false", true]) {
      const parsed = leadSchema.safeParse({ ...validLead, consentimiento });
      expect(parsed.success).toBe(false);
      expect(parsed.error?.flatten().fieldErrors.consentimiento?.[0]).toBe(
        "Debes aceptar el tratamiento de datos para continuar",
      );
    }
  });

  it("acepta el lead cuando la casilla de consentimiento viene marcada", () => {
    const parsed = leadSchema.safeParse({ ...validLead, consentimiento: "on" });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.consentimiento).toBe("on");
  });

  it("recorta espacios del nombre y del teléfono", () => {
    const parsed = leadSchema.parse({ ...validLead, nombre: "  Ana  " });
    expect(parsed.nombre).toBe("Ana");
  });

  it("rechaza un nombre de una sola letra", () => {
    const parsed = leadSchema.safeParse({ ...validLead, nombre: "A" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.nombre?.[0]).toBe("Dinos tu nombre");
  });

  it("acepta teléfonos con prefijo, espacios, guiones y paréntesis", () => {
    for (const telefono of ["+34600000000", "600 00 00 00", "(+34) 600-000-000"]) {
      expect(leadSchema.safeParse({ ...validLead, telefono }).success).toBe(true);
    }
  });

  it("rechaza un teléfono con letras", () => {
    const parsed = leadSchema.safeParse({ ...validLead, telefono: "llámame" });
    expect(parsed.success).toBe(false);
  });

  it("rechaza un teléfono demasiado corto", () => {
    expect(leadSchema.safeParse({ ...validLead, telefono: "600" }).success).toBe(false);
  });

  it("permite email vacío pero no un email inválido", () => {
    expect(leadSchema.safeParse({ ...validLead, email: "" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...validLead, email: "ana@nexus.es" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...validLead, email: "ana@" }).success).toBe(false);
  });

  it("solo admite los orígenes declarados", () => {
    expect(leadSchema.safeParse({ ...validLead, origen: "campana" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...validLead, origen: "tiktok" }).success).toBe(false);
  });

  it("el honeypot debe llegar vacío: un bot que lo rellena no valida", () => {
    const parsed = leadSchema.safeParse({ ...validLead, website: "http://spam.example" });
    expect(parsed.success).toBe(false);
  });

  it("corta mensajes de más de 1000 caracteres", () => {
    expect(
      leadSchema.safeParse({ ...validLead, mensaje: "x".repeat(1001) }).success,
    ).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, mensaje: "x".repeat(1000) }).success).toBe(
      true,
    );
  });
});

const validInterest = {
  nombre: "Ana Ruiz",
  telefono: "+34600000000",
  email: "ana@nexus.es",
  origen: "intensivos",
  intereses: ["Salsa cubana"],
  consentimiento: "on",
  website: "",
};

describe("interestLeadSchema", () => {
  it("acepta un lead de intensivos completo", () => {
    expect(interestLeadSchema.safeParse(validInterest).success).toBe(true);
  });

  it("exige email (a diferencia del lead genérico)", () => {
    const parsed = interestLeadSchema.safeParse({ ...validInterest, email: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.email?.[0]).toBe("Necesitamos tu email");
  });

  it("exige al menos un interés marcado", () => {
    const parsed = interestLeadSchema.safeParse({ ...validInterest, intereses: [] });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.intereses?.[0]).toBe(
      "Marca al menos una opción que te interese",
    );
  });

  it("exige el consentimiento RGPD explícito", () => {
    const parsed = interestLeadSchema.safeParse({ ...validInterest, consentimiento: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.consentimiento?.[0]).toBe(
      "Debes aceptar el tratamiento de datos para continuar",
    );
  });

  it("solo admite los orígenes de estas dos landings", () => {
    expect(
      interestLeadSchema.safeParse({ ...validInterest, origen: "curso-regular" }).success,
    ).toBe(true);
    expect(
      interestLeadSchema.safeParse({ ...validInterest, origen: "clase-prueba" }).success,
    ).toBe(false);
  });

  it("mantiene el honeypot como barrera anti-spam", () => {
    expect(
      interestLeadSchema.safeParse({ ...validInterest, website: "spam" }).success,
    ).toBe(false);
  });
});

const validMasterclass = {
  nombre: "Ana Ruiz",
  telefono: "+34600000000",
  email: "ana@nexus.es",
  evento_slug: "masterclass-bachazouk-de-0-a-1",
  consentimiento: "on",
  website: "",
};

describe("masterclassLeadSchema", () => {
  it("acepta una inscripción completa", () => {
    expect(masterclassLeadSchema.safeParse(validMasterclass).success).toBe(true);
  });

  it("exige los tres datos de contacto", () => {
    for (const campo of ["nombre", "telefono", "email"] as const) {
      expect(
        masterclassLeadSchema.safeParse({ ...validMasterclass, [campo]: "" }).success,
      ).toBe(false);
    }
  });

  it("exige el consentimiento RGPD explícito", () => {
    const parsed = masterclassLeadSchema.safeParse({ ...validMasterclass, consentimiento: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.consentimiento?.[0]).toBe(
      "Debes aceptar el tratamiento de datos para continuar",
    );
  });

  it("solo admite slugs con el formato de `eventos` (mismo CHECK que la BD)", () => {
    for (const evento_slug of ["Masterclass", "con espacio", "-empieza-mal", "doble--guion", ""]) {
      expect(masterclassLeadSchema.safeParse({ ...validMasterclass, evento_slug }).success).toBe(
        false,
      );
    }
    expect(
      masterclassLeadSchema.safeParse({ ...validMasterclass, evento_slug: "a".repeat(81) }).success,
    ).toBe(false);
  });

  it("mantiene el honeypot como barrera anti-spam", () => {
    expect(
      masterclassLeadSchema.safeParse({ ...validMasterclass, website: "spam" }).success,
    ).toBe(false);
  });
});
