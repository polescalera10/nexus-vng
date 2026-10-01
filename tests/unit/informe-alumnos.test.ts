import { describe, expect, it } from "vitest";
import {
  activosEntre,
  diasEntre,
  diasHastaCumple,
  hitosCruzados,
  horaMadrid,
  movimientosRanking,
  pct,
  puestos,
  riesgoDeBaja,
  segmentoDeUso,
  semanasActivas,
  sumarDias,
  variacion,
  ventanaDia,
} from "@/lib/informe-alumnos/calc";
import type { InformeAlumnos } from "@/lib/informe-alumnos/datos";
import { asunto, esc, renderHtml, renderTexto } from "@/lib/informe-alumnos/render";

/**
 * Informe diario del área de alumnos (`/api/cron/informe-alumnos`).
 * Aquí van las reglas que deciden qué sale en el correo: si una cambia, el
 * correo de Pol dice otra cosa, así que cada caso límite tiene su test.
 */

describe("fechas de Madrid", () => {
  it("suma y resta días cruzando meses y años", () => {
    expect(sumarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(sumarDias("2026-01-01", -1)).toBe("2025-12-31");
    expect(diasEntre("2026-09-25", "2026-10-01")).toBe(6);
  });

  it("el día resumido empieza a medianoche de Madrid, no de UTC", () => {
    // Verano (UTC+2) e invierno (UTC+1).
    expect(ventanaDia("2026-09-30")).toEqual({
      desde: "2026-09-29T22:00:00.000Z",
      hasta: "2026-09-30T22:00:00.000Z",
    });
    expect(ventanaDia("2026-12-01").desde).toBe("2026-11-30T23:00:00.000Z");
  });

  it("las 07:00 UTC son las 9 en verano y las 08:00 UTC en invierno", () => {
    // Por eso pg_cron dispara a las dos horas y la ruta filtra.
    expect(horaMadrid(new Date("2026-10-01T07:00:00Z"))).toBe(9);
    expect(horaMadrid(new Date("2026-10-01T08:00:00Z"))).toBe(10);
    expect(horaMadrid(new Date("2026-11-02T08:00:00Z"))).toBe(9);
    expect(horaMadrid(new Date("2026-11-02T07:00:00Z"))).toBe(8);
  });
});

describe("uso regular", () => {
  const fecha = "2026-10-28";

  it("cuenta las semanas con alguna visita de las 4 últimas", () => {
    expect(semanasActivas(["2026-10-28", "2026-10-27"], fecha)).toBe(1);
    expect(semanasActivas(["2026-10-28", "2026-10-21", "2026-10-14"], fecha)).toBe(3);
    // El día 28 antes de `fecha` ya cae fuera de la ventana.
    expect(semanasActivas(["2026-09-30"], fecha)).toBe(0);
  });

  it("habitual: 3 de 4 semanas", () => {
    expect(
      segmentoDeUso({ dias28: ["2026-10-27", "2026-10-20", "2026-10-10"], ultimoDia: "2026-10-27", ultimoLogin: null, fecha }),
    ).toBe("habitual");
  });

  it("ocasional: entró en los últimos 14 días, pero no tres semanas", () => {
    expect(
      segmentoDeUso({ dias28: ["2026-10-15"], ultimoDia: "2026-10-15", ultimoLogin: null, fecha }),
    ).toBe("ocasional");
  });

  it("dormido: más de 14 días sin entrar", () => {
    expect(
      segmentoDeUso({ dias28: ["2026-10-14"], ultimoDia: "2026-10-14", ultimoLogin: null, fecha }),
    ).toBe("dormido");
  });

  it("dormido también si solo consta el login de Auth (antes del registro de visitas)", () => {
    expect(
      segmentoDeUso({ dias28: [], ultimoDia: null, ultimoLogin: "2026-09-11T12:19:24Z", fecha }),
    ).toBe("dormido");
  });

  it("nunca: tiene acceso y no ha entrado", () => {
    expect(segmentoDeUso({ dias28: [], ultimoDia: null, ultimoLogin: null, fecha })).toBe("nunca");
  });

  it("cuenta alumnos distintos en un rango", () => {
    const filas = [
      { student_id: "a", day: "2026-10-27" },
      { student_id: "a", day: "2026-10-28" },
      { student_id: "b", day: "2026-10-20" },
    ];
    expect(activosEntre(filas, "2026-10-22", "2026-10-28")).toBe(1);
    expect(activosEntre(filas, "2026-10-01", "2026-10-28")).toBe(2);
  });
});

describe("puntos", () => {
  const hitos = [
    { label: "Bronce", points: 50 },
    { label: "Plata", points: 100 },
  ];

  it("detecta los hitos que se cruzan, incluido llegar justo", () => {
    expect(hitosCruzados(40, 100, hitos).map((h) => h.label)).toEqual(["Bronce", "Plata"]);
    expect(hitosCruzados(50, 60, hitos)).toEqual([]);
    expect(hitosCruzados(60, 40, hitos)).toEqual([]);
  });

  it("ranking de competición: los empates comparten puesto", () => {
    const p = puestos(new Map([["a", 30], ["b", 50], ["c", 30], ["d", 0]]));
    expect(Object.fromEntries(p)).toEqual({ b: 1, a: 2, c: 2 });
  });

  it("marca quién sube y quién entra en el ranking", () => {
    const antes = new Map([["a", 50], ["b", 40], ["c", 0]]);
    const ahora = new Map([["a", 50], ["b", 60], ["c", 10]]);
    expect(movimientosRanking(antes, ahora)).toEqual([
      { id: "b", antes: 2, ahora: 1 },
      { id: "a", antes: 1, ahora: 2 },
      { id: "c", antes: null, ahora: 3 },
    ]);
  });
});

describe("riesgo de baja", () => {
  const s = (fecha: string, presente: boolean, listaPasada = true) => ({ fecha, presente, listaPasada });

  it("dos faltas seguidas después de haber venido", () => {
    expect(riesgoDeBaja([s("2026-09-15", true), s("2026-09-22", false), s("2026-09-29", false)])).toEqual({
      faltasSeguidas: 2,
      ultimaAsistencia: "2026-09-15",
    });
  });

  it("una sola falta no es riesgo", () => {
    expect(riesgoDeBaja([s("2026-09-22", true), s("2026-09-29", false)])).toBeNull();
  });

  it("las sesiones sin lista no cuentan como falta", () => {
    expect(
      riesgoDeBaja([s("2026-09-15", true), s("2026-09-22", false, false), s("2026-09-29", false)]),
    ).toBeNull();
  });

  it("quien no ha venido nunca no está dejándolo", () => {
    expect(riesgoDeBaja([s("2026-09-22", false), s("2026-09-29", false)])).toBeNull();
  });
});

describe("cumpleaños", () => {
  it("hoy, dentro de la ventana y fuera", () => {
    expect(diasHastaCumple("1990-10-02", "2026-10-02", 7)).toBe(0);
    expect(diasHastaCumple("1990-10-08", "2026-10-02", 7)).toBe(6);
    expect(diasHastaCumple("1990-10-20", "2026-10-02", 7)).toBeNull();
  });

  it("cruza el fin de año", () => {
    expect(diasHastaCumple("1985-01-02", "2026-12-30", 7)).toBe(3);
  });

  it("el 29 de febrero se celebra el 28 en año no bisiesto", () => {
    expect(diasHastaCumple("2000-02-29", "2027-02-25", 7)).toBe(3);
    expect(diasHastaCumple("2000-02-29", "2028-02-25", 7)).toBe(4);
  });
});

describe("formato", () => {
  it("variación y porcentaje", () => {
    expect(variacion(5, 3)).toBe("+2");
    expect(variacion(3, 5)).toBe("−2");
    expect(variacion(3, 3)).toBe("igual");
    expect(variacion(3, null)).toBe("—");
    expect(pct(1, 3)).toBe("33 %");
    expect(pct(0, 0)).toBe("—");
  });
});

const base: InformeAlumnos = {
  fecha: "2026-10-05",
  envio: "2026-10-06",
  kpis: { entraron: 1, nuevos: 1, camposRellenados: 2, puntos: 10 },
  avisos: ["1 alumno entró por primera vez."],
  visitas: [
    { nombre: "<img src=x onerror=alert(1)>", primera: "20:01", ultima: "20:15", paginas: 4, secciones: ["Inicio", "Perfil"], nuevo: true },
  ],
  cambios: [{ nombre: "Ana López", cambios: ["foto", "cumpleaños"], perfilCompletado: true }],
  puntos: [{ nombre: "Ana López", puntos: 10, concepto: "Perfil completado", saldo: 10 }],
  hitos: [],
  ranking: [{ puesto: 1, nombre: "Ana López", saldo: 10, movimiento: "nuevo" }],
  segmentos: { habitual: [], ocasional: ["Ana López"], dormido: [], nunca: ["Luis"] },
  sinAcceso: 70,
  embudo: [{ etapa: "Alumnos activos", alumnos: 73, pct: "100 %" }],
  enlacesSinUsar: [],
  riesgo: [],
  videos: [],
  sinResumen: [],
  canjes: [],
  cumples: [],
  semana: null,
};

describe("correo", () => {
  it("escapa lo que viene de la BD", () => {
    const html = renderHtml(base);
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(esc(`"a" & 'b'`)).toBe("&quot;a&quot; &amp; &#39;b&#39;");
  });

  it("estilos en línea: ni <style> ni clases", () => {
    const html = renderHtml(base);
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/\sclass=/);
  });

  it("pinta los estados vacíos en vez de tablas vacías", () => {
    const html = renderHtml({ ...base, visitas: [], riesgo: [], canjes: [] });
    expect(html).toContain("Nadie entró ayer.");
    expect(html).toContain("Nadie encadena dos faltas.");
    expect(html).toContain("No hay premios pendientes.");
  });

  it("la sección semanal solo sale si hay datos de semana (lunes)", () => {
    expect(renderHtml(base)).not.toContain("La semana");
    const lunes = renderHtml({ ...base, semana: { activos7: 5, activos7Antes: 3, activos28: 8, conAcceso: 20 } });
    expect(lunes).toContain("La semana");
    expect(lunes).toContain("3 (+2)");
  });

  it("asunto con lo esencial del día", () => {
    expect(asunto(base)).toBe("Área de alumnos · 05/10 · 1 entrada, 1 nuevo, +10 pts");
    expect(asunto({ ...base, kpis: { entraron: 0, nuevos: 0, camposRellenados: 0, puntos: 0 } })).toBe(
      "Área de alumnos · 05/10 · 0 entradas",
    );
  });

  it("versión en texto plano", () => {
    const txt = renderTexto(base);
    expect(txt).toContain("lunes 05/10");
    expect(txt).toContain("(nuevo)");
    expect(txt).toContain("Nunca han entrado (1): Luis");
  });
});
