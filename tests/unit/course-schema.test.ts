import { describe, expect, it } from "vitest";
import { courseSchema } from "@/lib/validation/course";

const UUID_A = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const UUID_B = "9c858901-8a57-4791-81fe-4c455b099bc9";

/** Curso mínimo válido, con los valores tal y como llegan del FormData. */
const base = {
  name: "Bachata 2",
  modalidad_id: UUID_A,
  nivel_id: "",
  weekday: "1",
  start_time: "19:30",
  duration_min: "60",
  capacity_leaders: "0",
  capacity_followers: "0",
  cycle_type: "curso",
  start_date: "",
  end_date: "",
  active: true,
};

describe("courseSchema · profes titulares", () => {
  it("acepta dos profes en la misma clase (Martina y Davide dan Bachata 2)", () => {
    const parsed = courseSchema.parse({ ...base, teacher_ids: [UUID_A, UUID_B] });
    expect(parsed.teacher_ids).toEqual([UUID_A, UUID_B]);
  });

  it("sin profes marcados, el curso queda sin asignar", () => {
    expect(courseSchema.parse({ ...base, teacher_ids: [] }).teacher_ids).toEqual([]);
  });

  it("omitir el campo equivale a no asignar ninguno", () => {
    expect(courseSchema.parse(base).teacher_ids).toEqual([]);
  });

  it("rechaza un id que no es uuid", () => {
    const res = courseSchema.safeParse({ ...base, teacher_ids: [UUID_A, "sin-asignar"] });
    expect(res.success).toBe(false);
  });
});
