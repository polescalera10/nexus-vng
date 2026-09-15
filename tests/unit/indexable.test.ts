import { describe, expect, it } from "vitest";
import { listadoIndexable, robotsListado } from "@/lib/indexable";

describe("listados vacíos fuera del índice", () => {
  it("sin elementos no se indexa pero sigue enlazando", () => {
    expect(listadoIndexable(0)).toBe(false);
    expect(robotsListado(0)).toEqual({ index: false, follow: true });
  });

  it("con un solo elemento vuelve a ser indexable sin robots propio", () => {
    expect(listadoIndexable(1)).toBe(true);
    expect(robotsListado(1)).toBeUndefined();
    expect(robotsListado(12)).toBeUndefined();
  });
});
