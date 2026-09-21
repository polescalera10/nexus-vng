#!/usr/bin/env python3
"""Datos de la semana para el informe del lunes: GA4 + Search Console.

Saca la semana natural cerrada (lunes a domingo) y la anterior, y escribe un
Markdown con las dos columnas y la variación. NO interpreta nada: de eso se
encarga la rutina que lo llama (`~/.claude/scheduled-tasks/informe-semanal`).

AUTENTICACIÓN. Cuenta de servicio `claude-ga-lector@mi-ga-mcp-2026`, que tiene
acceso de lectura a la propiedad de GA4 y a la de Search Console. La clave vive
FUERA del repo (`~/.config/gcloud/claude-ga-lector.json`) y nunca se commitea.

Por qué el JWT se firma a mano en vez de usar google-auth: este script tiene
que correr sin instalar nada. Solo stdlib y `openssl`, que ya está en el Mac.
Ojo con el atajo fácil: `gcloud auth print-access-token` NO vale, porque emite
un token con scope `cloud-platform` y las dos APIs responden
`PERMISSION_DENIED - insufficient authentication scopes`.

Uso:
    python3 scripts/reporte-semanal.py                      # Markdown (copia del repo)
    python3 scripts/reporte-semanal.py --json               # datos en crudo
    python3 scripts/reporte-semanal.py --html               # correo maquetado, sin análisis
    python3 scripts/reporte-semanal.py --html --analisis a.json > correo.html

MAQUETA. El HTML del correo lo monta ESTE script, no el modelo. La rutina solo
escribe un JSON pequeño con su análisis (`--analisis`) y aquí se renderiza. Si
el modelo tuviera que escribir HTML de correo cada lunes, acabaría saliendo
distinto cada semana y roto en Outlook una de cada tres.

Forma del JSON de análisis (todos los campos opcionales):

    {
      "titular": "Dos o tres frases con lo que ha pasado.",
      "movido":   ["Lo que ha subido y por qué, con el dato."],
      "vigilar":  ["Lo que ha bajado o huele raro."],
      "propuestas": [
        {"que": "Qué hacer", "por_que": "Con el dato que lo sostiene",
         "coste": "Una tarde", "de_pol": false}
      ]
    }
"""

from __future__ import annotations

import argparse
import base64
import html as _html
import datetime as dt
import json
import os
import pathlib
import subprocess
import sys
import urllib.parse
import urllib.request

CLAVE = pathlib.Path(
    os.environ.get("NEXUS_GA_KEY", str(pathlib.Path.home() / ".config/gcloud/claude-ga-lector.json"))
)
GA4_PROPERTY = os.environ.get("NEXUS_GA4_PROPERTY", "548146583")
GSC_SITE = os.environ.get("NEXUS_GSC_SITE", "sc-domain:nexusvng.es")

SCOPES = (
    "https://www.googleapis.com/auth/analytics.readonly "
    "https://www.googleapis.com/auth/webmasters.readonly"
)


# --------------------------------------------------------------------------- #
# Autenticación
# --------------------------------------------------------------------------- #
def _b64(raw: bytes) -> bytes:
    return base64.urlsafe_b64encode(raw).rstrip(b"=")


def token() -> str:
    if not CLAVE.exists():
        sys.exit(
            f"No encuentro la clave de la cuenta de servicio en {CLAVE}.\n"
            "Se crea con:\n"
            "  gcloud iam service-accounts keys create \"$HOME/.config/gcloud/claude-ga-lector.json\" \\\n"
            "    --iam-account=claude-ga-lector@mi-ga-mcp-2026.iam.gserviceaccount.com \\\n"
            "    --project=mi-ga-mcp-2026"
        )
    d = json.loads(CLAVE.read_text())
    ahora = int(dt.datetime.now(dt.timezone.utc).timestamp())
    firmar = (
        _b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
        + b"."
        + _b64(
            json.dumps(
                {
                    "iss": d["client_email"],
                    "scope": SCOPES,
                    "aud": d["token_uri"],
                    "iat": ahora,
                    "exp": ahora + 3600,
                }
            ).encode()
        )
    )
    pem = subprocess.run(["mktemp"], capture_output=True, text=True, check=True).stdout.strip()
    try:
        pathlib.Path(pem).write_text(d["private_key"])
        os.chmod(pem, 0o600)
        sig = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", pem],
            input=firmar, capture_output=True, check=True,
        ).stdout
    finally:
        os.remove(pem)
    cuerpo = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": (firmar + b"." + _b64(sig)).decode(),
        }
    ).encode()
    req = urllib.request.Request(
        d["token_uri"], data=cuerpo, headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return json.load(urllib.request.urlopen(req, timeout=30))["access_token"]


def _post(url: str, tok: str, body: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req, timeout=60))


# --------------------------------------------------------------------------- #
# Ventanas de fechas
# --------------------------------------------------------------------------- #
def semanas(hoy: dt.date) -> tuple[tuple[dt.date, dt.date], tuple[dt.date, dt.date]]:
    """Última semana natural CERRADA (lunes-domingo) y la anterior."""
    lunes_de_esta = hoy - dt.timedelta(days=hoy.weekday())
    fin = lunes_de_esta - dt.timedelta(days=1)          # domingo pasado
    ini = fin - dt.timedelta(days=6)                    # lunes pasado
    return (ini, fin), (ini - dt.timedelta(days=7), fin - dt.timedelta(days=7))


# --------------------------------------------------------------------------- #
# GA4
# --------------------------------------------------------------------------- #
def ga4(tok: str, rango: tuple[dt.date, dt.date], dims: list[str], mets: list[str],
        filtro: dict | None = None, limite: int = 15) -> list[dict]:
    body = {
        "dateRanges": [{"startDate": rango[0].isoformat(), "endDate": rango[1].isoformat()}],
        "dimensions": [{"name": d} for d in dims],
        "metrics": [{"name": m} for m in mets],
        "limit": limite,
    }
    if dims:
        body["orderBys"] = [{"metric": {"metricName": mets[0]}, "desc": True}]
    if filtro:
        body["dimensionFilter"] = filtro
    d = _post(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4_PROPERTY}:runReport", tok, body
    )
    salida = []
    for r in d.get("rows", []):
        fila = {dims[i]: v["value"] for i, v in enumerate(r.get("dimensionValues", []))}
        for i, v in enumerate(r.get("metricValues", [])):
            fila[mets[i]] = float(v["value"])
        salida.append(fila)
    return salida


# --------------------------------------------------------------------------- #
# Search Console
# --------------------------------------------------------------------------- #
def gsc(tok: str, rango: tuple[dt.date, dt.date], dims: list[str], limite: int = 25) -> list[dict]:
    sitio = urllib.parse.quote(GSC_SITE, safe="")
    body = {
        "startDate": rango[0].isoformat(),
        "endDate": rango[1].isoformat(),
        "dimensions": dims,
        "rowLimit": limite,
        "type": "web",
    }
    d = _post(
        f"https://searchconsole.googleapis.com/webmasters/v3/sites/{sitio}/searchAnalytics/query",
        tok, body,
    )
    salida = []
    for r in d.get("rows", []):
        fila = {dims[i]: k for i, k in enumerate(r.get("keys", []))} if dims else {}
        fila |= {
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "ctr": r.get("ctr", 0.0),
            "position": r.get("position", 0.0),
        }
        salida.append(fila)
    return salida


# --------------------------------------------------------------------------- #
# Formato
# --------------------------------------------------------------------------- #
def var(actual: float, previo: float) -> str:
    """Variación legible. Sin base previa no se inventa un porcentaje."""
    if previo == 0:
        return "nuevo" if actual else "—"
    pct = (actual - previo) / previo * 100
    return f"{pct:+.0f} %"


def n(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def d1(x: float, signo: bool = False) -> str:
    """Un decimal con coma. En castellano el punto es el separador de miles."""
    txt = f"{x:+.1f}" if signo else f"{x:.1f}"
    return txt.replace(".", ",")



# --------------------------------------------------------------------------- #
# Maqueta del correo (HTML)
# --------------------------------------------------------------------------- #
#
# Reglas de HTML para correo, que no son las de una web:
#   · Estilos SIEMPRE en línea. Gmail borra el <style> del <head>.
#   · Maquetación con <table>. Nada de flex ni grid: Outlook no los entiende.
#   · Ancho máximo 640 px y fuentes del sistema.
#   · Fondo claro. Un correo oscuro se ve mal en la mitad de los clientes, así
#     que el negro de marca se queda en la cabecera y el degradado, en una
#     banda fina con color sólido de reserva para Outlook.
#
MARCA = "#0a0a0a"
CIAN = "#30e4ec"
BIEN = "#0a7f6b"   # verde oscuro: el cian de marca no se lee sobre blanco
MAL = "#c0392b"
GRIS = "#6b7280"
BORDE = "#e5e7eb"
TINTA = "#111827"

FUENTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"


def e(x: object) -> str:
    return _html.escape(str(x), quote=True)


def _color_var(txt: str, invertido: bool = False) -> str:
    """Color de una variación.

    En posición media bajar es MEJOR, así que esas celdas llevan la palabra
    "mejora" o "empeora" dentro del texto y mandan sobre el signo. Es a prueba
    de despistes: el color y la palabra no se pueden contradecir.
    """
    if "mejora" in txt:
        return BIEN
    if "empeora" in txt:
        return MAL
    if txt in ("—", "igual"):
        return GRIS
    if txt == "nuevo":
        return BIEN
    sube = txt.startswith("+")
    return (MAL if sube else BIEN) if invertido else (BIEN if sube else MAL)


def _kpi(valor: str, etiqueta: str, delta: str = "", invertido: bool = False) -> str:
    col = _color_var(delta, invertido) if delta else GRIS
    sub = (f'<div style="font:600 13px {FUENTE};color:{col};margin-top:2px">{e(delta)}</div>'
           if delta else "")
    return (
        f'<td width="25%" style="padding:14px 10px;text-align:center;'
        f'border:1px solid {BORDE};border-radius:8px;background:#fafafa">'
        f'<div style="font:700 26px {FUENTE};color:{TINTA};line-height:1.1">{e(valor)}</div>'
        f'{sub}'
        f'<div style="font:500 11px {FUENTE};color:{GRIS};text-transform:uppercase;'
        f'letter-spacing:.06em;margin-top:6px">{e(etiqueta)}</div></td>'
    )


def _h2(txt: str) -> str:
    return (f'<h2 style="font:700 17px {FUENTE};color:{TINTA};margin:32px 0 10px;'
            f'padding-bottom:6px;border-bottom:2px solid {BORDE}">{e(txt)}</h2>')


def _tabla(cabecera: list[str], filas: list[list[str]], colores: dict[int, bool] | None = None) -> str:
    """`colores` mapea índice de columna -> True si es una variación invertida."""
    colores = colores or {}
    th = "".join(
        f'<th align="{"left" if i == 0 else "right"}" style="font:600 11px {FUENTE};'
        f'color:{GRIS};text-transform:uppercase;letter-spacing:.05em;'
        f'padding:8px 10px;border-bottom:1px solid {BORDE}">{e(c)}</th>'
        for i, c in enumerate(cabecera)
    )
    cuerpo = []
    for n_, fila in enumerate(filas):
        fondo = "#ffffff" if n_ % 2 == 0 else "#fafafa"
        tds = []
        for i, celda in enumerate(fila):
            es_var = i in colores
            col = _color_var(celda, colores[i]) if es_var else TINTA
            peso = "600" if (i == 0 or es_var) else "400"
            tds.append(
                f'<td align="{"left" if i == 0 else "right"}" style="font:{peso} 13px {FUENTE};'
                f'color:{col};padding:9px 10px;border-bottom:1px solid #f1f1f1">{e(celda)}</td>'
            )
        cuerpo.append(f'<tr style="background:{fondo}">{"".join(tds)}</tr>')
    return (
        f'<table width="100%" cellpadding="0" cellspacing="0" role="presentation" '
        f'style="border-collapse:collapse;border:1px solid {BORDE};border-radius:8px">'
        f'<tr>{th}</tr>{"".join(cuerpo)}</table>'
    )


def _lista(items: list[str], icono: str, color: str) -> str:
    if not items:
        return f'<p style="font:400 14px {FUENTE};color:{GRIS};margin:0">Nada reseñable.</p>'
    return "".join(
        f'<table width="100%" cellpadding="0" cellspacing="0" role="presentation" '
        f'style="margin-bottom:8px"><tr>'
        f'<td width="24" valign="top" style="font:700 14px {FUENTE};color:{color};'
        f'padding-top:1px">{icono}</td>'
        f'<td style="font:400 14px {FUENTE};color:{TINTA};line-height:1.55">{e(x)}</td>'
        f"</tr></table>"
        for x in items
    )


def _propuestas(items: list[dict]) -> str:
    if not items:
        return f'<p style="font:400 14px {FUENTE};color:{GRIS};margin:0">Sin propuestas esta semana.</p>'
    out = []
    for i, p_ in enumerate(items, 1):
        sello = ""
        if p_.get("de_pol"):
            sello = (f'<span style="display:inline-block;font:700 10px {FUENTE};color:#8a5a00;'
                     f'background:#fff3d6;border-radius:4px;padding:3px 7px;margin-left:8px;'
                     f'text-transform:uppercase;letter-spacing:.05em">Te toca a ti</span>')
        coste = (f'<div style="font:500 12px {FUENTE};color:{GRIS};margin-top:8px">'
                 f'Coste: {e(p_["coste"])}</div>') if p_.get("coste") else ""
        porque = (f'<div style="font:400 13px {FUENTE};color:#374151;line-height:1.55;'
                  f'margin-top:6px">{e(p_["por_que"])}</div>') if p_.get("por_que") else ""
        out.append(
            f'<table width="100%" cellpadding="0" cellspacing="0" role="presentation" '
            f'style="margin-bottom:12px;border:1px solid {BORDE};border-left:3px solid {CIAN};'
            f'border-radius:6px;background:#fafafa"><tr><td style="padding:14px 16px">'
            f'<div style="font:700 14px {FUENTE};color:{TINTA}">{i}. {e(p_.get("que", ""))}{sello}</div>'
            f"{porque}{coste}</td></tr></table>"
        )
    return "".join(out)


def render_html(datos: dict, md_secciones: dict, analisis: dict) -> str:
    ini, fin = datos["semana"]
    pini, pfin = datos["semana_anterior"]
    f = lambda s_: dt.date.fromisoformat(s_).strftime("%d/%m")

    k = md_secciones["kpis"]
    kpis = "".join([
        _kpi(k["clics"], "Clics en Google", k["clics_var"]),
        '<td width="8"></td>',
        _kpi(k["impresiones"], "Impresiones", k["impresiones_var"]),
        '<td width="8"></td>',
        _kpi(k["posicion"], "Posición media", k["posicion_var"], invertido=True),
        '<td width="8"></td>',
        _kpi(k["whatsapp"], "Clics a WhatsApp", k["whatsapp_var"]),
    ])

    titular = analisis.get("titular", "")
    bloque_titular = (
        f'<table width="100%" cellpadding="0" cellspacing="0" role="presentation" '
        f'style="margin:24px 0;border-left:3px solid {CIAN};background:#f0fdfa;border-radius:6px">'
        f'<tr><td style="padding:16px 18px;font:400 15px {FUENTE};color:{TINTA};'
        f'line-height:1.6">{e(titular)}</td></tr></table>'
    ) if titular else ""

    secciones = [
        bloque_titular,
        _h2("Qué ha movido la aguja"),
        _lista(analisis.get("movido", []), "▲", BIEN),
        _h2("Qué vigilar"),
        _lista(analisis.get("vigilar", []), "▼", MAL),
        _h2("Tres cosas para esta semana"),
        _propuestas(analisis.get("propuestas", [])),
        _h2("Búsqueda · totales"),
        md_secciones["gsc_totales"],
        _h2("Consultas"),
        md_secciones["gsc_consultas"],
        _h2("Tráfico por canal"),
        md_secciones["canales"],
        _h2("Conversión"),
        md_secciones["conversion"],
        _h2("Dónde se pulsa WhatsApp"),
        md_secciones["wa_paginas"],
        _h2("Páginas más vistas"),
        md_secciones["paginas"],
    ]

    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6">
<tr><td align="center" style="padding:24px 12px">
<table width="640" cellpadding="0" cellspacing="0" role="presentation"
       style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
              box-shadow:0 1px 3px rgba(0,0,0,.08)">

  <tr><td style="background:{MARCA};padding:26px 28px 22px">
    <div style="font:700 20px {FUENTE};color:#ffffff;letter-spacing:.02em">NEXUS VNG</div>
    <div style="font:500 13px {FUENTE};color:#9ca3af;margin-top:4px">
      Informe semanal · {f(ini)} – {f(fin)}
    </div>
    <div style="font:400 12px {FUENTE};color:#6b7280;margin-top:2px">
      Comparado con {f(pini)} – {f(pfin)}
    </div>
  </td></tr>
  <tr><td style="height:4px;background:{CIAN};
    background-image:linear-gradient(90deg,{CIAN} 0%,#71e9c9 50%,#b5f6af 100%);
    font-size:0;line-height:0">&nbsp;</td></tr>

  <tr><td style="padding:24px 28px 8px">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>{kpis}</tr></table>
  </td></tr>

  <tr><td style="padding:0 28px 8px">{"".join(secciones)}</td></tr>

  <tr><td style="padding:20px 28px 26px;border-top:1px solid {BORDE}">
    <p style="font:400 12px {FUENTE};color:{GRIS};line-height:1.6;margin:0">
      <strong>Sobre los datos.</strong> Search Console tarda 2-3 días en consolidarse:
      una caída en los últimos días de la semana puede no ser real. GA4 cuenta de menos
      porque el consentimiento de cookies arranca desactivado. En posición media, bajar es mejor.
    </p>
    <p style="font:400 12px {FUENTE};color:#9ca3af;margin:12px 0 0">
      Generado automáticamente los lunes ·
      <a href="https://nexusvng.es" style="color:{GRIS}">nexusvng.es</a>
    </p>
  </td></tr>

</table></td></tr></table></body></html>"""

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true", help="datos en crudo, sin formatear")
    ap.add_argument("--html", action="store_true", help="correo maquetado en HTML")
    ap.add_argument("--analisis", help="JSON con el análisis que escribe la rutina")
    ap.add_argument("--hoy", help="fecha de referencia YYYY-MM-DD (para pruebas)")
    args = ap.parse_args()

    hoy = dt.date.fromisoformat(args.hoy) if args.hoy else dt.date.today()
    act, ant = semanas(hoy)
    tok = token()

    datos = {
        "semana": [act[0].isoformat(), act[1].isoformat()],
        "semana_anterior": [ant[0].isoformat(), ant[1].isoformat()],
        "ga4": {
            "totales": {k: ga4(tok, r, [], ["sessions", "activeUsers", "screenPageViews"])
                        for k, r in (("actual", act), ("anterior", ant))},
            "canales": {k: ga4(tok, r, ["sessionDefaultChannelGroup"], ["sessions"])
                        for k, r in (("actual", act), ("anterior", ant))},
            "eventos": {k: ga4(tok, r, ["eventName"], ["eventCount"])
                        for k, r in (("actual", act), ("anterior", ant))},
            "paginas": {k: ga4(tok, r, ["pagePath"], ["screenPageViews"], limite=12)
                        for k, r in (("actual", act), ("anterior", ant))},
            "conversion_por_pagina": ga4(
                tok, act, ["pagePath"], ["eventCount"],
                {"filter": {"fieldName": "eventName", "stringFilter": {"value": "whatsapp_click"}}},
                limite=10,
            ),
        },
        "gsc": {
            "totales": {k: gsc(tok, r, []) for k, r in (("actual", act), ("anterior", ant))},
            "consultas": {k: gsc(tok, r, ["query"], 25) for k, r in (("actual", act), ("anterior", ant))},
            "paginas": {k: gsc(tok, r, ["page"], 20) for k, r in (("actual", act), ("anterior", ant))},
        },
    }

    if args.json:
        print(json.dumps(datos, ensure_ascii=False, indent=1))
        return

    # ------------------------------------------------------------------ #
    # Datos ya comparados, listos para pintar en cualquiera de los dos formatos
    # ------------------------------------------------------------------ #
    vacio_ga = {"sessions": 0, "activeUsers": 0, "screenPageViews": 0}
    vacio_gsc = {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0}
    ta = (datos["ga4"]["totales"]["actual"] or [vacio_ga])[0]
    tp = (datos["ga4"]["totales"]["anterior"] or [vacio_ga])[0]
    ga_ = (datos["gsc"]["totales"]["actual"] or [vacio_gsc])[0]
    gp_ = (datos["gsc"]["totales"]["anterior"] or [vacio_gsc])[0]
    ev_a = {r["eventName"]: r["eventCount"] for r in datos["ga4"]["eventos"]["actual"]}
    ev_p = {r["eventName"]: r["eventCount"] for r in datos["ga4"]["eventos"]["anterior"]}
    prev_can = {r["sessionDefaultChannelGroup"]: r["sessions"] for r in datos["ga4"]["canales"]["anterior"]}
    prev_pag = {r["pagePath"]: r["screenPageViews"] for r in datos["ga4"]["paginas"]["anterior"]}
    prev_q = {r["query"]: r for r in datos["gsc"]["consultas"]["anterior"]}

    delta_pos = ga_["position"] - gp_["position"]
    ses = ta.get("sessions", 0)
    wa = ev_a.get("whatsapp_click", 0)

    kpis = {
        "clics": n(ga_["clicks"]),
        "clics_var": var(ga_["clicks"], gp_["clicks"]),
        "impresiones": n(ga_["impressions"]),
        "impresiones_var": var(ga_["impressions"], gp_["impressions"]),
        "posicion": d1(ga_["position"]),
        "posicion_var": f'{d1(delta_pos, signo=True)} {"mejora" if delta_pos < 0 else "empeora" if delta_pos > 0 else "igual"}',
        "whatsapp": n(wa),
        "whatsapp_var": var(wa, ev_p.get("whatsapp_click", 0)),
    }

    filas_gsc_tot = [
        ["Clics", n(ga_["clicks"]), n(gp_["clicks"]), var(ga_["clicks"], gp_["clicks"])],
        ["Impresiones", n(ga_["impressions"]), n(gp_["impressions"]), var(ga_["impressions"], gp_["impressions"])],
        ["CTR", f"{d1(ga_['ctr']*100)} %", f"{d1(gp_['ctr']*100)} %", "—"],
        ["Posición media", d1(ga_["position"]), d1(gp_["position"]),
         f'{d1(delta_pos, signo=True)} {"mejora" if delta_pos < 0 else "empeora" if delta_pos > 0 else "igual"}'],
    ]
    # Consultas con menos de 3 impresiones son ruido de cola larga: una
    # búsqueda suelta en posición 36 no dice nada y llena la tabla. Siguen
    # estando enteras en `--json`, por si alguna semana hace falta mirarlas.
    filas_consultas = [
        [r["query"], n(r["clicks"]), n(r["impressions"]), d1(r["position"]),
         d1(prev_q[r["query"]]["position"]) if r["query"] in prev_q else "—"]
        for r in datos["gsc"]["consultas"]["actual"]
        if r["impressions"] >= 3 or r["clicks"] > 0
    ][:20]
    filas_canales = [
        [r["sessionDefaultChannelGroup"], n(r["sessions"]),
         n(prev_can.get(r["sessionDefaultChannelGroup"], 0)),
         var(r["sessions"], prev_can.get(r["sessionDefaultChannelGroup"], 0))]
        for r in datos["ga4"]["canales"]["actual"]
    ]
    filas_conv = [
        [ev, n(ev_a.get(ev, 0)), n(ev_p.get(ev, 0)), var(ev_a.get(ev, 0), ev_p.get(ev, 0))]
        for ev in ("whatsapp_click", "generate_lead", "form_start")
    ]
    if ses:
        filas_conv.append(["% sesiones que pulsan WhatsApp", f"{d1(wa / ses * 100)} %", "", "—"])
    filas_wa = [[r["pagePath"], n(r["eventCount"])] for r in datos["ga4"]["conversion_por_pagina"]]
    filas_pag = [
        [r["pagePath"], n(r["screenPageViews"]), n(prev_pag.get(r["pagePath"], 0)),
         var(r["screenPageViews"], prev_pag.get(r["pagePath"], 0))]
        for r in datos["ga4"]["paginas"]["actual"]
    ]

    # ------------------------------------------------------------------ #
    # HTML del correo
    # ------------------------------------------------------------------ #
    if args.html:
        analisis = {}
        if args.analisis:
            ruta = pathlib.Path(args.analisis)
            if not ruta.exists():
                sys.exit(f"No encuentro el JSON de análisis en {ruta}")
            analisis = json.loads(ruta.read_text())
        # `colores`: qué columna es una variación, y si va invertida (posición).
        secciones = {
            "kpis": kpis,
            "gsc_totales": _tabla(["Métrica", "Semana", "Anterior", "Var."], filas_gsc_tot,
                                  {3: False}),
            "gsc_consultas": _tabla(["Consulta", "Clics", "Impr.", "Pos.", "Pos. ant."], filas_consultas),
            "canales": _tabla(["Canal", "Sesiones", "Anterior", "Var."], filas_canales, {3: False}),
            "conversion": _tabla(["Evento", "Semana", "Anterior", "Var."], filas_conv, {3: False}),
            "wa_paginas": _tabla(["Página", "Clics"], filas_wa),
            "paginas": _tabla(["Página", "Vistas", "Anterior", "Var."], filas_pag, {3: False}),
        }
        print(render_html(datos, secciones, analisis))
        return

    # ------------------------------------------------------------------ #
    # Markdown (copia para el repo y para que el modelo lea los datos)
    # ------------------------------------------------------------------ #
    def md(cab: list[str], filas: list[list[str]]) -> str:
        lineas = ["| " + " | ".join(cab) + " |", "|" + "---|" * len(cab)]
        lineas += ["| " + " | ".join(f) + " |" for f in filas]
        return "\n".join(lineas)

    out = [
        f"# Datos de la semana {act[0]:%d/%m} – {act[1]:%d/%m}",
        "",
        f"Comparados con {ant[0]:%d/%m} – {ant[1]:%d/%m}.",
        "",
        "> **Search Console tarda 2-3 días en consolidarse.** Los últimos días de la "
        "semana reciente pueden estar incompletos: una caída de última hora no es tendencia.",
        "> **En posición media, bajar es mejor.**",
        "",
        "## Búsqueda (Search Console)", "", md(["Métrica", "Semana", "Anterior", "Var."], filas_gsc_tot), "",
        "### Consultas", "", md(["Consulta", "Clics", "Impr.", "Pos.", "Pos. ant."], filas_consultas), "",
        "## Tráfico (GA4)", "",
        md(["Métrica", "Semana", "Anterior", "Var."], [
            ["Sesiones", n(ta.get("sessions", 0)), n(tp.get("sessions", 0)), var(ta.get("sessions", 0), tp.get("sessions", 0))],
            ["Usuarios", n(ta.get("activeUsers", 0)), n(tp.get("activeUsers", 0)), var(ta.get("activeUsers", 0), tp.get("activeUsers", 0))],
            ["Páginas vistas", n(ta.get("screenPageViews", 0)), n(tp.get("screenPageViews", 0)), var(ta.get("screenPageViews", 0), tp.get("screenPageViews", 0))],
        ]), "",
        "### Canales", "", md(["Canal", "Sesiones", "Anterior", "Var."], filas_canales), "",
        "### Conversión", "", md(["Evento", "Semana", "Anterior", "Var."], filas_conv), "",
        "### Dónde se pulsa WhatsApp", "", md(["Página", "Clics"], filas_wa), "",
        "### Páginas más vistas", "", md(["Página", "Vistas", "Anterior", "Var."], filas_pag), "",
    ]
    print("\n".join(out))


if __name__ == "__main__":
    main()
