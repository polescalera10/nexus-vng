import { describe, expect, it } from "vitest";
import { parseVideoUrl } from "@/lib/video";
import { diarioSchema } from "@/lib/validation/diario";

/**
 * Lista blanca de los vídeos del diario de clase (migración 0043).
 *
 * Cada caso "malo" de aquí acabaría en un iframe hacia un dominio que nadie
 * ha revisado, cargado en la página de un alumno identificado. Es el mismo
 * riesgo que cubre `safeImageSrc` en security.test.ts, pero con un iframe.
 */

const SESSION = "11111111-1111-4111-8111-111111111111";

describe("parseVideoUrl · YouTube", () => {
  it("acepta las formas normales y siempre sale por nocookie", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    ]) {
      const parsed = parseVideoUrl(url);
      expect(parsed, url).not.toBeNull();
      expect(parsed?.provider).toBe("youtube");
      expect(parsed?.embedUrl).toBe(
        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
      );
    }
  });

  it("normaliza y tira los parámetros de tracking al guardar", () => {
    const parsed = parseVideoUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abc123&utm_source=wa&t=42",
    );
    expect(parsed?.watchUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("rechaza un id que no tiene los 11 caracteres", () => {
    expect(parseVideoUrl("https://youtu.be/corto")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/watch?v=demasiado-largo-de-mas")).toBeNull();
  });
});

describe("parseVideoUrl · Vimeo", () => {
  it("conserva el hash de los vídeos unlisted (sin él no se ven)", () => {
    const parsed = parseVideoUrl("https://vimeo.com/123456789/abc123def4");
    expect(parsed?.provider).toBe("vimeo");
    expect(parsed?.embedUrl).toBe(
      "https://player.vimeo.com/video/123456789?h=abc123def4&dnt=1",
    );
    expect(parsed?.watchUrl).toBe("https://vimeo.com/123456789/abc123def4");
  });

  it("acepta la url del player y pide do-not-track", () => {
    const parsed = parseVideoUrl("https://player.vimeo.com/video/123456789?h=abc123def4");
    expect(parsed?.embedUrl).toContain("dnt=1");
  });

  it("acepta un vídeo público sin hash", () => {
    expect(parseVideoUrl("https://vimeo.com/123456789")?.embedUrl).toBe(
      "https://player.vimeo.com/video/123456789?dnt=1",
    );
  });
});

describe("parseVideoUrl · Google Drive", () => {
  it("convierte /view en /preview", () => {
    const parsed = parseVideoUrl(
      "https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9i0J/view?usp=sharing",
    );
    expect(parsed?.provider).toBe("drive");
    expect(parsed?.embedUrl).toBe(
      "https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9i0J/preview",
    );
  });
});

describe("parseVideoUrl · lo que NO entra", () => {
  it("rechaza cualquier host fuera de la lista", () => {
    for (const url of [
      "https://evil.com/video.mp4",
      "https://vimeo.com.evil.com/123456789",
      "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
      "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    ]) {
      expect(parseVideoUrl(url), url).toBeNull();
    }
  });

  it("rechaza http, javascript: y data:", () => {
    expect(parseVideoUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("javascript:alert(1)")).toBeNull();
    expect(parseVideoUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rechaza vacíos y basura", () => {
    expect(parseVideoUrl("")).toBeNull();
    expect(parseVideoUrl(null)).toBeNull();
    expect(parseVideoUrl("no soy una url")).toBeNull();
  });
});

describe("diarioSchema", () => {
  it("acepta un diario con resumen y vídeo", () => {
    const res = diarioSchema.safeParse({
      sessionId: SESSION,
      resumen: "Enchufla doble y dile que no.",
      videos: [{ url: "https://youtu.be/dQw4w9WgXcQ", titulo: "La secuencia" }],
    });
    expect(res.success).toBe(true);
  });

  it("acepta resumen vacío: es como se borra la nota", () => {
    const res = diarioSchema.safeParse({ sessionId: SESSION, resumen: "" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.videos).toEqual([]);
  });

  it("rechaza un enlace de un origen no permitido", () => {
    const res = diarioSchema.safeParse({
      sessionId: SESSION,
      resumen: "Algo",
      videos: [{ url: "https://evil.com/v.mp4" }],
    });
    expect(res.success).toBe(false);
  });

  it("rechaza más de 10 vídeos por sesión", () => {
    const res = diarioSchema.safeParse({
      sessionId: SESSION,
      resumen: "Algo",
      videos: Array.from({ length: 11 }, () => ({
        url: "https://youtu.be/dQw4w9WgXcQ",
      })),
    });
    expect(res.success).toBe(false);
  });

  it("rechaza una sesión que no es uuid", () => {
    expect(diarioSchema.safeParse({ sessionId: "42", resumen: "x" }).success).toBe(false);
  });
});
