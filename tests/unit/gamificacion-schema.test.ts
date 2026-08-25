import { describe, expect, it } from "vitest";
import {
  pointEventSchema,
  pointRuleSchema,
  rewardSchema,
} from "@/lib/validation/gamificacion";
import { leadConversionSchema } from "@/lib/validation/lead-conversion";
import { eventoSchema } from "@/lib/validation/evento";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

describe("pointEventSchema", () => {
  const base = {
    student_id: UUID,
    points: "10",
    concept: "Fiesta de octubre",
    source: "evento",
    rule_code: "",
    occurred_on: "2026-10-04",
  };

  it("acepta un apunte válido y convierte los puntos a número", () => {
    const parsed = pointEventSchema.parse(base);
    expect(parsed.points).toBe(10);
  });

  it("admite puntos negativos (correcciones) pero no cero", () => {
    expect(pointEventSchema.safeParse({ ...base, points: "-25" }).success).toBe(true);
    expect(pointEventSchema.safeParse({ ...base, points: "0" }).success).toBe(false);
  });

  it("replica el rango del CHECK point_events_points_range", () => {
    expect(pointEventSchema.safeParse({ ...base, points: "10000" }).success).toBe(true);
    expect(pointEventSchema.safeParse({ ...base, points: "10001" }).success).toBe(false);
  });

  it("no deja crear apuntes de tipo canje a mano", () => {
    // Los canjes los escribe el trigger `reward_redemptions_apply`: si se
    // pudieran teclear, el saldo dejaría de cuadrar con `reward_redemptions`.
    expect(pointEventSchema.safeParse({ ...base, source: "canje" }).success).toBe(false);
  });

  it("exige una fecha ISO", () => {
    expect(pointEventSchema.safeParse({ ...base, occurred_on: "4/10/2026" }).success).toBe(
      false,
    );
  });
});

describe("pointRuleSchema", () => {
  const base = {
    id: "",
    code: "asistencia_fiesta",
    label: "Asistir a una fiesta",
    points: "25",
    source: "evento",
    active: true,
  };

  it("acepta una regla válida", () => {
    expect(pointRuleSchema.safeParse(base).success).toBe(true);
  });

  it("replica el formato del CHECK point_rules_code_format", () => {
    for (const code of ["asistencia-fiesta", "asistencia fiesta", "a", "ñoño"]) {
      expect(pointRuleSchema.safeParse({ ...base, code }).success).toBe(false);
    }
  });

  it("normaliza el código a minúsculas", () => {
    expect(pointRuleSchema.parse({ ...base, code: "TRAE_AMIGO" }).code).toBe("trae_amigo");
  });
});

describe("rewardSchema", () => {
  const base = {
    id: "",
    name: "Camiseta NEXUS",
    description: "",
    cost_points: "300",
    stock: "",
    active: true,
  };

  it("distingue stock vacío (sin límite) de stock cero (agotado)", () => {
    // `z.coerce.number()` convierte "" en 0: sin el preprocess de
    // `optionalNumber`, crear un premio sin stock lo dejaba agotado al nacer.
    expect(rewardSchema.parse(base).stock).toBeUndefined();
    expect(rewardSchema.parse({ ...base, stock: "0" }).stock).toBe(0);
    expect(rewardSchema.parse({ ...base, stock: "20" }).stock).toBe(20);
  });

  it("exige un coste de al menos un punto", () => {
    expect(rewardSchema.safeParse({ ...base, cost_points: "0" }).success).toBe(false);
    expect(rewardSchema.safeParse({ ...base, cost_points: "1" }).success).toBe(true);
  });
});

describe("leadConversionSchema", () => {
  const base = {
    lead_id: UUID,
    full_name: "Ana Ruiz",
    phone: "+34600111222",
    email: "ana@example.com",
    dance_role: "both",
    course_id: "",
    role_in_course: "",
  };

  it("acepta la conversión mínima: nombre, teléfono y email", () => {
    expect(leadConversionSchema.safeParse(base).success).toBe(true);
  });

  it("exige teléfono en E.164 (lo que pide students_phone_e164)", () => {
    expect(leadConversionSchema.safeParse({ ...base, phone: "600111222" }).success).toBe(
      false,
    );
  });

  it("si se elige curso, hay que decir con qué rol entra", () => {
    const sinRol = leadConversionSchema.safeParse({ ...base, course_id: UUID });
    expect(sinRol.success).toBe(false);
    expect(sinRol.error?.flatten().fieldErrors.role_in_course?.[0]).toBe(
      "Indica si entra como leader o follower",
    );
    expect(
      leadConversionSchema.safeParse({
        ...base,
        course_id: UUID,
        role_in_course: "follower",
      }).success,
    ).toBe(true);
  });
});

describe("eventoSchema", () => {
  const base = {
    id: "",
    titulo: "Fiesta social de octubre",
    slug: "fiesta-social-de-octubre",
    tipo: "social",
    fecha: "2026-10-04T21:00",
    fecha_fin: "",
    descripcion: "",
    ubicacion: "",
    precio: "",
    capacidad: "",
    puntos: "25",
    cta_url: "",
    cover_image_url: "",
    publico: true,
  };

  it("acepta un evento válido", () => {
    expect(eventoSchema.safeParse(base).success).toBe(true);
  });

  it("distingue precio vacío (no se anuncia) de precio cero (gratis)", () => {
    expect(eventoSchema.parse(base).precio).toBeUndefined();
    expect(eventoSchema.parse({ ...base, precio: "0" }).precio).toBe(0);
    expect(eventoSchema.parse({ ...base, precio: "5" }).precio).toBe(5);
    expect(eventoSchema.parse(base).capacidad).toBeUndefined();
  });

  it("rechaza que el fin sea anterior al inicio", () => {
    const parsed = eventoSchema.safeParse({ ...base, fecha_fin: "2026-10-04T20:00" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.fecha_fin?.[0]).toBe(
      "El fin no puede ser anterior al inicio",
    );
  });

  it("solo admite enlaces http(s): un javascript: acabaría en un href público", () => {
    expect(
      eventoSchema.safeParse({ ...base, cta_url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(eventoSchema.safeParse({ ...base, cta_url: "https://nexusvng.es" }).success).toBe(
      true,
    );
  });

  it("la portada admite ruta propia o URL absoluta, nada más", () => {
    expect(
      eventoSchema.safeParse({ ...base, cover_image_url: "/images/social.png" }).success,
    ).toBe(true);
    expect(
      eventoSchema.safeParse({ ...base, cover_image_url: "javascript:alert(1)" }).success,
    ).toBe(false);
  });

  it("exige un slug con el formato del CHECK", () => {
    expect(eventoSchema.safeParse({ ...base, slug: "Fiesta Social" }).success).toBe(false);
  });
});
