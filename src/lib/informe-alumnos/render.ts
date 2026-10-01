import { SEGMENTO_DEFINICION, SEGMENTO_LABELS, variacion, type Segmento } from "./calc";
import type { InformeAlumnos } from "./datos";

/**
 * Maqueta del informe diario del área de alumnos.
 *
 * Mismas reglas y misma paleta que el informe semanal de SEO
 * (`scripts/reporte-semanal.py`), para que los dos correos parezcan de la
 * misma casa:
 *   · estilos SIEMPRE en línea (Gmail borra el <style> del <head>);
 *   · maquetación con <table>, nada de flex ni grid (Outlook);
 *   · 640 px de ancho y fuentes del sistema;
 *   · fondo claro: el negro de marca solo en la cabecera.
 *
 * Todo texto que venga de la BD (nombres, conceptos, títulos de vídeo) pasa
 * por `esc()`: un alumno que se llame `<img onerror=…>` no debe ejecutar nada
 * en el Gmail de Pol.
 */

const MARCA = "#0a0a0a";
const CIAN = "#30e4ec";
const BIEN = "#0a7f6b";
const MAL = "#c0392b";
const AVISO = "#8a5a00";
const GRIS = "#6b7280";
const BORDE = "#e5e7eb";
const TINTA = "#111827";
const FUENTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function esc(x: unknown): string {
  return String(x)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fechaLarga(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  const [, m, dd] = fecha.split("-");
  return `${DIAS[d.getUTCDay()]} ${dd}/${m}`;
}

function kpi(valor: string | number, etiqueta: string): string {
  return (
    `<td width="25%" style="padding:14px 8px;text-align:center;border:1px solid ${BORDE};` +
    `border-radius:8px;background:#fafafa">` +
    `<div style="font:700 26px ${FUENTE};color:${TINTA};line-height:1.1">${esc(valor)}</div>` +
    `<div style="font:500 11px ${FUENTE};color:${GRIS};text-transform:uppercase;` +
    `letter-spacing:.06em;margin-top:6px">${esc(etiqueta)}</div></td>`
  );
}

function h2(texto: string, nota?: string): string {
  const sub = nota
    ? `<div style="font:400 12px ${FUENTE};color:${GRIS};margin-top:3px">${esc(nota)}</div>`
    : "";
  return (
    `<div style="margin:32px 0 10px;padding-bottom:6px;border-bottom:2px solid ${BORDE}">` +
    `<h2 style="font:700 17px ${FUENTE};color:${TINTA};margin:0">${esc(texto)}</h2>${sub}</div>`
  );
}

function vacio(texto: string): string {
  return `<p style="font:400 14px ${FUENTE};color:${GRIS};margin:0">${esc(texto)}</p>`;
}

type Celda = string | number | { texto: string | number; color?: string; negrita?: boolean };

function colorMovimiento(texto: string): string {
  if (texto.startsWith("sube") || texto === "nuevo" || texto.startsWith("+")) return BIEN;
  if (texto.startsWith("baja") || texto.startsWith("−")) return MAL;
  return GRIS;
}

/** Tabla con la primera columna a la izquierda y el resto alineado según `der`. */
function tabla(cabecera: string[], filas: Celda[][], der: number[] = []): string {
  const align = (i: number) => (der.includes(i) ? "right" : "left");
  const th = cabecera
    .map(
      (c, i) =>
        `<th align="${align(i)}" style="font:600 11px ${FUENTE};color:${GRIS};` +
        `text-transform:uppercase;letter-spacing:.05em;padding:8px 10px;` +
        `border-bottom:1px solid ${BORDE}">${esc(c)}</th>`,
    )
    .join("");
  const cuerpo = filas
    .map((fila, n) => {
      const fondo = n % 2 === 0 ? "#ffffff" : "#fafafa";
      const tds = fila
        .map((celda, i) => {
          const c = typeof celda === "object" ? celda : { texto: celda };
          const peso = c.negrita ?? i === 0 ? "600" : "400";
          return (
            `<td align="${align(i)}" valign="top" style="font:${peso} 13px ${FUENTE};` +
            `color:${c.color ?? TINTA};padding:9px 10px;border-bottom:1px solid #f1f1f1;` +
            `line-height:1.45">${esc(c.texto)}</td>`
          );
        })
        .join("");
      return `<tr style="background:${fondo}">${tds}</tr>`;
    })
    .join("");
  return (
    `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" ` +
    `style="border-collapse:collapse;border:1px solid ${BORDE};border-radius:8px">` +
    `<tr>${th}</tr>${cuerpo}</table>`
  );
}

function lista(items: string[], icono: string, color: string): string {
  return items
    .map(
      (x) =>
        `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" ` +
        `style="margin-bottom:8px"><tr>` +
        `<td width="22" valign="top" style="font:700 14px ${FUENTE};color:${color};` +
        `padding-top:1px">${icono}</td>` +
        `<td style="font:400 14px ${FUENTE};color:${TINTA};line-height:1.55">${esc(x)}</td>` +
        `</tr></table>`,
    )
    .join("");
}

function etiqueta(texto: string): string {
  return (
    `<span style="display:inline-block;font:700 10px ${FUENTE};color:${BIEN};` +
    `background:#e6f6f2;border-radius:4px;padding:2px 6px;margin-left:6px;` +
    `text-transform:uppercase;letter-spacing:.05em">${esc(texto)}</span>`
  );
}

const SEGMENTOS: Segmento[] = ["habitual", "ocasional", "dormido", "nunca"];

function bloqueSegmentos(i: InformeAlumnos): string {
  const filas = SEGMENTOS.map((s) => [
    { texto: SEGMENTO_LABELS[s], negrita: true },
    { texto: i.segmentos[s].length, negrita: true },
    { texto: i.segmentos[s].length ? i.segmentos[s].join(", ") : "—", color: "#374151" },
  ]);
  const nota =
    `<p style="font:400 12px ${FUENTE};color:${GRIS};line-height:1.6;margin:10px 0 0">` +
    SEGMENTOS.map((s) => `<strong>${esc(SEGMENTO_LABELS[s])}</strong>: ${esc(SEGMENTO_DEFINICION[s])}.`).join(" ") +
    (i.sinAcceso > 0
      ? ` Además hay <strong>${i.sinAcceso}</strong> ${i.sinAcceso === 1 ? "alumno activo" : "alumnos activos"} sin acceso creado.`
      : "") +
    `</p>`;
  return tabla(["Grupo", "Alumnos", "Quiénes"], filas, [1]) + nota;
}

/** HTML con el `<!DOCTYPE>`, listo para mandar. */
export function renderHtml(i: InformeAlumnos): string {
  const k = i.kpis;
  const kpis = [
    kpi(k.entraron, "Entraron"),
    kpi(k.nuevos, "Primera vez"),
    kpi(k.camposRellenados, "Campos rellenados"),
    kpi(k.puntos, "Puntos dados"),
  ].join('<td width="8"></td>');

  const avisos = i.avisos.length
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" ` +
      `style="margin:24px 0 0;border-left:3px solid ${CIAN};background:#f0fdfa;border-radius:6px">` +
      `<tr><td style="padding:14px 16px 6px">${lista(i.avisos, "•", BIEN)}</td></tr></table>`
    : "";

  const s: string[] = [avisos];

  // Quién entró
  s.push(h2("Quién entró ayer", "Hora de la primera y la última página que abrió."));
  s.push(
    i.visitas.length
      ? tabla(
          ["Alumno", "Horas", "Páginas", "Qué miró"],
          i.visitas.map((v) => [
            { texto: v.nombre, negrita: true },
            v.primera === v.ultima ? v.primera : `${v.primera} – ${v.ultima}`,
            v.paginas,
            v.secciones.join(", "),
          ]),
          [2],
        )
      : vacio("Nadie entró ayer."),
  );
  // Etiqueta "primera vez": se añade aparte para no escapar el HTML del sello.
  if (i.visitas.some((v) => v.nuevo)) {
    s.push(
      `<p style="font:400 12px ${FUENTE};color:${GRIS};margin:8px 0 0">Primera vez: ` +
        i.visitas
          .filter((v) => v.nuevo)
          .map((v) => esc(v.nombre) + etiqueta("nuevo"))
          .join(", ") +
        `</p>`,
    );
  }

  // Perfiles
  s.push(h2("Qué rellenaron en su perfil"));
  s.push(
    i.cambios.length
      ? tabla(
          ["Alumno", "Cambios"],
          i.cambios.map((c) => [
            { texto: c.nombre, negrita: true },
            {
              texto:
                (c.cambios.length ? c.cambios.join(", ") : "—") +
                (c.perfilCompletado ? " · perfil completo" : ""),
              color: c.perfilCompletado ? BIEN : TINTA,
            },
          ]),
        )
      : vacio("Nadie tocó su perfil ayer."),
  );

  // Puntos
  s.push(h2("Puntos", "Movimientos de ayer y saldo con el que acabó el día."));
  s.push(
    i.puntos.length
      ? tabla(
          ["Alumno", "Puntos", "Concepto", "Saldo"],
          i.puntos.map((p) => [
            { texto: p.nombre, negrita: true },
            { texto: p.puntos >= 0 ? `+${p.puntos}` : `−${Math.abs(p.puntos)}`, color: p.puntos >= 0 ? BIEN : MAL, negrita: true },
            p.concepto,
            p.saldo,
          ]),
          [1, 3],
        )
      : vacio("Ayer no hubo movimientos de puntos."),
  );
  if (i.hitos.length) {
    s.push(`<div style="height:10px"></div>`);
    s.push(lista(i.hitos.map((h) => `${h.nombre} alcanzó el hito ${h.hito}.`), "★", AVISO));
  }
  if (i.ranking.length) {
    s.push(`<div style="font:600 13px ${FUENTE};color:${TINTA};margin:18px 0 8px">Top 5 del ranking</div>`);
    s.push(
      tabla(
        ["#", "Alumno", "Puntos", "Desde ayer"],
        i.ranking.map((r) => [
          r.puesto,
          { texto: r.nombre, negrita: true },
          r.saldo,
          { texto: r.movimiento, color: colorMovimiento(r.movimiento) },
        ]),
        [2, 3],
      ),
    );
  }

  // Uso regular
  s.push(h2("Quién usa el área", "Alumnos activos con acceso, según sus visitas de las últimas 4 semanas."));
  s.push(bloqueSegmentos(i));

  // Semana (lunes)
  if (i.semana) {
    const w = i.semana;
    s.push(h2("La semana"));
    s.push(
      tabla(
        ["Indicador", "Valor", "Semana anterior"],
        [
          ["Alumnos que entraron en 7 días", w.activos7, { texto: `${w.activos7Antes} (${variacion(w.activos7, w.activos7Antes)})`, color: colorMovimiento(variacion(w.activos7, w.activos7Antes)) }],
          ["Alumnos que entraron en 28 días", w.activos28, "—"],
          ["Vuelven cada semana (7 días / 28 días)", w.activos28 ? `${Math.round((w.activos7 / w.activos28) * 100)} %` : "—", "—"],
          ["Alumnos con acceso", w.conAcceso, "—"],
        ],
        [1, 2],
      ),
    );
  }

  // Embudo
  s.push(h2("Activación", "Porcentaje sobre los alumnos activos."));
  s.push(tabla(["Etapa", "Alumnos", "%"], i.embudo.map((e) => [e.etapa, e.alumnos, e.pct]), [1, 2]));

  // Enlaces sin usar
  if (i.enlacesSinUsar.length) {
    s.push(h2("Pidieron el enlace y no entraron", "Si se repite con la misma persona, revisa su email o su carpeta de spam."));
    s.push(tabla(["Quién", "Lo pidió a las"], i.enlacesSinUsar.map((e) => [e.nombre, e.pedido]), [1]));
  }

  // Riesgo
  s.push(h2("Riesgo de baja", "Faltan a sus últimas clases con lista pasada y antes sí venían."));
  s.push(
    i.riesgo.length
      ? tabla(
          ["Alumno", "Clase", "Faltas", "Última clase", "Último acceso"],
          i.riesgo.map((r) => [
            { texto: r.nombre, negrita: true },
            r.curso,
            { texto: r.faltas, color: MAL, negrita: true },
            r.ultimaAsistencia,
            r.ultimaVisita ?? "nunca",
          ]),
          [2],
        )
      : vacio("Nadie encadena dos faltas. Bien."),
  );

  // Diario
  s.push(h2("Diario de clase"));
  s.push(
    i.videos.length
      ? tabla(
          ["Vídeo", "Clase", "Alumnos", "Veces"],
          i.videos.map((v) => [{ texto: v.titulo, negrita: true }, `${v.curso} · ${v.sesion}`, v.alumnos, v.veces]),
          [2, 3],
        )
      : vacio("Ayer nadie abrió un vídeo del diario."),
  );
  s.push(`<div style="font:600 13px ${FUENTE};color:${TINTA};margin:18px 0 8px">Clases de los últimos 7 días sin resumen</div>`);
  s.push(
    i.sinResumen.length
      ? tabla(["Clase", "Día", "Profe"], i.sinResumen.map((x) => [{ texto: x.curso, negrita: true }, x.fecha, x.profes]))
      : vacio("Todas tienen su resumen."),
  );

  // Operativa
  s.push(h2("Pendiente"));
  s.push(`<div style="font:600 13px ${FUENTE};color:${TINTA};margin:0 0 8px">Premios por entregar</div>`);
  s.push(
    i.canjes.length
      ? tabla(
          ["Alumno", "Premio", "Pedido el", "Días"],
          i.canjes.map((c) => [
            { texto: c.nombre, negrita: true },
            c.premio,
            c.desde,
            { texto: c.dias, color: c.dias >= 3 ? MAL : TINTA },
          ]),
          [3],
        )
      : vacio("No hay premios pendientes."),
  );
  s.push(`<div style="font:600 13px ${FUENTE};color:${TINTA};margin:18px 0 8px">Cumpleaños de esta semana</div>`);
  s.push(
    i.cumples.length
      ? tabla(["Alumno", "Cuándo"], i.cumples.map((c) => [{ texto: c.nombre, negrita: true }, c.cuando]))
      : vacio("Nadie cumple años en los próximos 7 días."),
  );

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(asunto(i))}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6">
<tr><td align="center" style="padding:24px 12px">
<table width="640" cellpadding="0" cellspacing="0" role="presentation"
       style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
              box-shadow:0 1px 3px rgba(0,0,0,.08)">
  <tr><td style="background:${MARCA};padding:26px 28px 22px">
    <div style="font:700 20px ${FUENTE};color:#ffffff;letter-spacing:.02em">NEXUS VNG</div>
    <div style="font:500 13px ${FUENTE};color:#9ca3af;margin-top:4px">
      Área de alumnos · ${esc(fechaLarga(i.fecha))}
    </div>
  </td></tr>
  <tr><td style="height:4px;background:${CIAN};
    background-image:linear-gradient(90deg,${CIAN} 0%,#71e9c9 50%,#b5f6af 100%);
    font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:24px 28px 8px">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>${kpis}</tr></table>
  </td></tr>
  <tr><td style="padding:0 28px 8px">${s.join("")}</td></tr>
  <tr><td style="padding:20px 28px 26px;border-top:1px solid ${BORDE}">
    <p style="font:400 12px ${FUENTE};color:${GRIS};line-height:1.6;margin:0">
      <strong>Sobre los datos.</strong> Las visitas se registran desde el 01/10/2026: antes de esa
      fecha solo consta el último acceso por enlace. Una visita es abrir Inicio, Ranking, Perfil o
      el diario de una clase. Los datos de actividad se borran a los 12 meses.
    </p>
    <p style="font:400 12px ${FUENTE};color:#9ca3af;margin:12px 0 0">
      Se envía cada día a las 9:00 ·
      <a href="https://nexusvng.es/area-privada/admin" style="color:${GRIS}">Abrir el panel</a>
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

export function asunto(i: InformeAlumnos): string {
  const [, m, d] = i.fecha.split("-");
  const partes = [`${i.kpis.entraron} ${i.kpis.entraron === 1 ? "entrada" : "entradas"}`];
  if (i.kpis.nuevos) partes.push(`${i.kpis.nuevos} ${i.kpis.nuevos === 1 ? "nuevo" : "nuevos"}`);
  if (i.kpis.puntos) partes.push(`+${i.kpis.puntos} pts`);
  if (i.riesgo.length) partes.push(`${i.riesgo.length} en riesgo`);
  return `Área de alumnos · ${d}/${m} · ${partes.join(", ")}`;
}

/** Versión en texto plano: la leen los clientes sin HTML y los filtros de spam. */
export function renderTexto(i: InformeAlumnos): string {
  const l: string[] = [`NEXUS VNG · Área de alumnos · ${fechaLarga(i.fecha)}`, ""];
  l.push(
    `Entraron: ${i.kpis.entraron} · Primera vez: ${i.kpis.nuevos} · Campos rellenados: ${i.kpis.camposRellenados} · Puntos dados: ${i.kpis.puntos}`,
    "",
  );
  if (i.avisos.length) l.push(...i.avisos.map((a) => `- ${a}`), "");
  l.push("QUIÉN ENTRÓ AYER");
  l.push(
    ...(i.visitas.length
      ? i.visitas.map((v) => `- ${v.nombre}${v.nuevo ? " (nuevo)" : ""}: ${v.primera}–${v.ultima}, ${v.paginas} pág. (${v.secciones.join(", ")})`)
      : ["Nadie."]),
    "",
  );
  l.push("PERFIL");
  l.push(...(i.cambios.length ? i.cambios.map((c) => `- ${c.nombre}: ${c.cambios.join(", ") || "—"}${c.perfilCompletado ? " · perfil completo" : ""}`) : ["Sin cambios."]), "");
  l.push("PUNTOS");
  l.push(...(i.puntos.length ? i.puntos.map((p) => `- ${p.nombre}: ${p.puntos >= 0 ? "+" : ""}${p.puntos} (${p.concepto}) · saldo ${p.saldo}`) : ["Sin movimientos."]), "");
  l.push("QUIÉN USA EL ÁREA");
  l.push(...SEGMENTOS.map((s) => `- ${SEGMENTO_LABELS[s]} (${i.segmentos[s].length}): ${i.segmentos[s].join(", ") || "—"}`), "");
  if (i.riesgo.length) {
    l.push("RIESGO DE BAJA");
    l.push(...i.riesgo.map((r) => `- ${r.nombre} (${r.curso}): ${r.faltas} faltas seguidas, vino por última vez el ${r.ultimaAsistencia}`), "");
  }
  if (i.canjes.length) {
    l.push("PREMIOS POR ENTREGAR");
    l.push(...i.canjes.map((c) => `- ${c.nombre}: ${c.premio} (desde el ${c.desde})`), "");
  }
  l.push("Panel: https://nexusvng.es/area-privada/admin");
  return l.join("\n");
}
