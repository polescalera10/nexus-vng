import { describe, expect, it } from "vitest";
import { courseLabel, matchLeadCourses, type CourseLike } from "@/lib/leads/course-match";

/**
 * El catálogo real del 30-08-2026, recortado a lo que importa aquí: dos
 * "Bachata 1" a distinta hora (el caso que obliga a cruzar por etiqueta
 * completa) y las clases cuyo slug viejo sigue vivo en `leads.intereses`.
 */
const courses: CourseLike[] = [
  { id: "bachata1-lun", name: "Bachata 1", weekday: 1, start_time: "18:30:00" },
  { id: "bachata2-lun", name: "Bachata 2", weekday: 1, start_time: "19:30:00" },
  { id: "bachatalady-lun", name: "Bachata Lady", weekday: 1, start_time: "20:30:00" },
  { id: "cialady-lun", name: "Cía Lady Bachata", weekday: 1, start_time: "21:30:00" },
  { id: "heels-mar", name: "Heels", weekday: 2, start_time: "20:30:00" },
  { id: "reparto-mie", name: "Reparto", weekday: 3, start_time: "19:30:00" },
  { id: "salsa1-mie", name: "Salsa 1", weekday: 3, start_time: "20:30:00" },
  { id: "bachata1-mie", name: "Bachata 1", weekday: 3, start_time: "21:30:00" },
  { id: "ladysalsa-vie", name: "Lady Salsa", weekday: 5, start_time: "19:30:00" },
  { id: "ciasalsa-vie", name: "Cía Salsa", weekday: 5, start_time: "21:30:00" },
];

describe("courseLabel", () => {
  it("reproduce la etiqueta que guarda el formulario público", () => {
    expect(courseLabel(courses[6]!)).toBe("Salsa 1 · Miércoles 20:30");
  });
});

describe("matchLeadCourses", () => {
  it("cruza la etiqueta completa", () => {
    const { courseIds, unmatched } = matchLeadCourses(
      ["Salsa 1 · Miércoles 20:30", "Bachata 0 · Jueves 21:30"],
      courses,
    );
    expect(courseIds).toEqual(["salsa1-mie"]);
    expect(unmatched).toEqual(["Bachata 0 · Jueves 21:30"]);
  });

  it("distingue los dos Bachata 1 por día y hora", () => {
    expect(matchLeadCourses(["Bachata 1 · Miércoles 21:30"], courses).courseIds).toEqual([
      "bachata1-mie",
    ]);
    expect(matchLeadCourses(["Bachata 1 · Lunes 18:30"], courses).courseIds).toEqual([
      "bachata1-lun",
    ]);
  });

  it("no elige por nombre cuando hay dos cursos que se llaman igual", () => {
    const { courseIds, unmatched } = matchLeadCourses(["Bachata 1"], courses);
    expect(courseIds).toEqual([]);
    expect(unmatched).toEqual(["Bachata 1"]);
  });

  it("acepta los slugs del formulario viejo si resuelven a un único curso", () => {
    const { courseIds, unmatched } = matchLeadCourses(
      ["reparto", "cia-salsa", "lady-salsa", "bachata-lady", "cia-lady-bachata"],
      courses,
    );
    expect(courseIds).toEqual([
      "reparto-mie",
      "ciasalsa-vie",
      "ladysalsa-vie",
      "bachatalady-lun",
      "cialady-lun",
    ]);
    expect(unmatched).toEqual([]);
  });

  it("casa el nombre cuyo slug es idéntico al nombre normalizado", () => {
    expect(matchLeadCourses(["heels"], courses).courseIds).toEqual(["heels-mar"]);
    expect(matchLeadCourses(["Heels"], courses).courseIds).toEqual(["heels-mar"]);
  });

  it("descarta intensivos y el 'aún no sé' sin contarlos como fallo", () => {
    const { courseIds, unmatched } = matchLeadCourses(
      ["intensivo-bachata-jue27", "Aún no sé qué clase me toca", "  "],
      courses,
    );
    expect(courseIds).toEqual([]);
    expect(unmatched).toEqual([]);
  });

  it("no repite un curso pedido dos veces y aguanta el vacío", () => {
    expect(
      matchLeadCourses(["Salsa 1 · Miércoles 20:30", "salsa 1"], courses).courseIds,
    ).toEqual(["salsa1-mie"]);
    expect(matchLeadCourses(null, courses).courseIds).toEqual([]);
    expect(matchLeadCourses(["Salsa 1"], []).unmatched).toEqual(["Salsa 1"]);
  });
});
