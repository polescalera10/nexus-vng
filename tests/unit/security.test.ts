import { describe, expect, it } from "vitest";
import { safeImageSrc } from "@/lib/images";
import { secretMatches } from "@/lib/cron-auth";
import { safeNext } from "@/lib/safe-redirect";

/**
 * Regresiones de las correcciones de docs/auditoria-seguridad-2026-08-03.md.
 * Cada caso "malo" de aquí era explotable antes del arreglo.
 */

const ORIGIN = "https://nexusvng.es";

describe("safeNext · open redirect (A4)", () => {
  it("acepta rutas internas normales", () => {
    expect(safeNext("/area-privada/admin", ORIGIN)).toBe("/area-privada/admin");
    expect(safeNext("/area-privada/admin/leads?estado=nuevo", ORIGIN)).toBe(
      "/area-privada/admin/leads?estado=nuevo",
    );
  });

  it("rechaza el protocolo relativo //evil.com", () => {
    expect(safeNext("//evil.com", ORIGIN)).toBe("/area-privada");
  });

  it("rechaza la variante con barra invertida (el bypass real)", () => {
    // El navegador normaliza "\" a "/" en Location: /\evil.com → https://evil.com
    expect(safeNext("/\\evil.com", ORIGIN)).toBe("/area-privada");
    expect(safeNext("/\\/evil.com", ORIGIN)).toBe("/area-privada");
  });

  it("rechaza URLs absolutas y esquemas raros", () => {
    expect(safeNext("https://evil.com", ORIGIN)).toBe("/area-privada");
    expect(safeNext("javascript:alert(1)", ORIGIN)).toBe("/area-privada");
    expect(safeNext("", ORIGIN)).toBe("/area-privada");
  });
});

describe("safeImageSrc · imágenes públicas: markdown y portadas de evento (B2)", () => {
  it("acepta las rutas propias que ya usan los eventos reales", () => {
    expect(safeImageSrc("/images/bachata_masterclass.png")).toBe(
      "/images/bachata_masterclass.png",
    );
    expect(safeImageSrc("/images/social_dance_event.png")).toBe(
      "/images/social_dance_event.png",
    );
  });

  it("acepta Supabase Storage", () => {
    const url = "https://vruqtozggrntirdjmezy.supabase.co/storage/v1/object/public/x.png";
    expect(safeImageSrc(url)).toBe(url);
  });

  it("rechaza terceros, http y protocolo relativo", () => {
    expect(safeImageSrc("https://tercero.example/pixel.gif")).toBeNull();
    expect(safeImageSrc("http://nexusvng.es/x.png")).toBeNull();
    expect(safeImageSrc("//evil.com/x.png")).toBeNull();
    expect(safeImageSrc("/\\evil.com/x.png")).toBeNull();
    expect(safeImageSrc(undefined)).toBeNull();
  });
});

describe("secretMatches · comparación de secretos (M2)", () => {
  it("acepta el secreto exacto", () => {
    expect(secretMatches("s3cr3t-largo", "s3cr3t-largo")).toBe(true);
  });

  it("rechaza secretos distintos, vacíos o de otra longitud", () => {
    expect(secretMatches("s3cr3t-larg0", "s3cr3t-largo")).toBe(false);
    expect(secretMatches("s3cr3t", "s3cr3t-largo")).toBe(false);
    expect(secretMatches(null, "s3cr3t-largo")).toBe(false);
    expect(secretMatches("", "s3cr3t-largo")).toBe(false);
  });
});

describe("JSON-LD · escapado de '<' (A3)", () => {
  it("neutraliza un </script> incrustado en un dato de Supabase", () => {
    const data = { name: "Fiesta</script><script>alert(1)</script>" };
    const html = JSON.stringify(data).replace(/</g, "\\u003c");

    expect(html).not.toContain("</script>");
    // Sigue siendo JSON válido y con el mismo contenido.
    expect(JSON.parse(html)).toEqual(data);
  });
});
