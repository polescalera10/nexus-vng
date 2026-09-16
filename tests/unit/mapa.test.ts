import { describe, expect, it } from "vitest";
import { aPixel, limitarZoom, TESELA, teselasVisibles, urlTesela, ZOOM_MAX, ZOOM_MIN } from "@/lib/mapa";
import { site } from "@/lib/site";

describe("proyección del mapa", () => {
  it("el origen (0, 0) cae en el centro del mundo", () => {
    expect(aPixel(0, 0, 0)).toEqual({ x: 128, y: 128 });
    const z3 = aPixel(0, 0, 3);
    expect(z3.x).toBeCloseTo(1024);
    expect(z3.y).toBeCloseTo(1024);
  });

  it("la sala cae en la tesela correcta a zoom 16", () => {
    // Referencia calculada con la fórmula estándar de OSM (slippy map tilenames).
    const { x, y } = aPixel(site.geo.latitude, site.geo.longitude, 16);
    expect(Math.floor(x / TESELA)).toBe(33086);
    expect(Math.floor(y / TESELA)).toBe(24514);
  });
});

describe("teselas visibles", () => {
  it("cubren el visor entero sin huecos", () => {
    const { x, y } = aPixel(site.geo.latitude, site.geo.longitude, 16);
    const t = teselasVisibles(x, y, 640, 360, 16);
    const izq = Math.min(...t.map((a) => a.left));
    const arr = Math.min(...t.map((a) => a.top));
    const der = Math.max(...t.map((a) => a.left + TESELA));
    const aba = Math.max(...t.map((a) => a.top + TESELA));
    expect(izq).toBeLessThanOrEqual(0);
    expect(arr).toBeLessThanOrEqual(0);
    expect(der).toBeGreaterThanOrEqual(640);
    expect(aba).toBeGreaterThanOrEqual(360);
    expect(t.length).toBeLessThanOrEqual(12);
  });

  it("no pide filas fuera del mundo y envuelve las columnas", () => {
    const t = teselasVisibles(10, 10, 600, 600, 1);
    expect(t.every((a) => a.y >= 0 && a.y < 2)).toBe(true);
    expect(t.every((a) => a.x >= 0 && a.x < 2)).toBe(true);
  });
});

describe("utilidades", () => {
  it("la URL es de MapTiler, en alta densidad y con la clave escapada", () => {
    expect(urlTesela({ x: 1, y: 2, z: 3 }, "a b")).toBe(
      "https://api.maptiler.com/maps/streets-v2-dark/256/3/1/2@2x.png?key=a%20b",
    );
  });

  it("el zoom se queda en su rango", () => {
    expect(limitarZoom(99)).toBe(ZOOM_MAX);
    expect(limitarZoom(-5)).toBe(ZOOM_MIN);
    expect(limitarZoom(15.4)).toBe(15);
  });
});
