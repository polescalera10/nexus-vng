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
    python3 scripts/reporte-semanal.py            # semana cerrada más reciente
    python3 scripts/reporte-semanal.py --json     # los datos en crudo
"""

from __future__ import annotations

import argparse
import base64
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


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true", help="datos en crudo, sin formatear")
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

    out: list[str] = []
    A = out.append
    A(f"# Datos de la semana {act[0]:%d/%m} – {act[1]:%d/%m}")
    A("")
    A(f"Comparados con {ant[0]:%d/%m} – {ant[1]:%d/%m}.")
    A("")
    A("> **Aviso sobre Search Console:** sus datos tardan 2-3 días en consolidarse, "
      "así que los últimos días de la semana reciente pueden estar incompletos y "
      "aparecer una caída que no es real. No leer una bajada de última hora como tendencia.")
    A("")

    # --- GA4 ---
    A("## Tráfico (GA4)")
    A("")
    ta = datos["ga4"]["totales"]["actual"][0] if datos["ga4"]["totales"]["actual"] else {}
    tp = datos["ga4"]["totales"]["anterior"][0] if datos["ga4"]["totales"]["anterior"] else {}
    A("| Métrica | Semana | Anterior | Var. |")
    A("|---|---|---|---|")
    for etiqueta, clave in (("Sesiones", "sessions"), ("Usuarios", "activeUsers"), ("Páginas vistas", "screenPageViews")):
        a, p = ta.get(clave, 0), tp.get(clave, 0)
        A(f"| {etiqueta} | {n(a)} | {n(p)} | {var(a, p)} |")
    A("")

    A("### Canales")
    A("")
    prev_can = {r["sessionDefaultChannelGroup"]: r["sessions"] for r in datos["ga4"]["canales"]["anterior"]}
    A("| Canal | Sesiones | Anterior | Var. |")
    A("|---|---|---|---|")
    for r in datos["ga4"]["canales"]["actual"]:
        c = r["sessionDefaultChannelGroup"]
        A(f"| {c} | {n(r['sessions'])} | {n(prev_can.get(c, 0))} | {var(r['sessions'], prev_can.get(c, 0))} |")
    A("")

    A("### Conversión")
    A("")
    ev_a = {r["eventName"]: r["eventCount"] for r in datos["ga4"]["eventos"]["actual"]}
    ev_p = {r["eventName"]: r["eventCount"] for r in datos["ga4"]["eventos"]["anterior"]}
    A("| Evento | Semana | Anterior | Var. |")
    A("|---|---|---|---|")
    for e in ("whatsapp_click", "generate_lead", "form_start"):
        A(f"| `{e}` | {n(ev_a.get(e, 0))} | {n(ev_p.get(e, 0))} | {var(ev_a.get(e, 0), ev_p.get(e, 0))} |")
    ses = ta.get("sessions", 0)
    if ses:
        A(f"| Sesiones que pulsan WhatsApp | {ev_a.get('whatsapp_click', 0) / ses * 100:.1f} % | | |")
    A("")

    A("### Dónde se pulsa WhatsApp")
    A("")
    A("| Página | Clics |")
    A("|---|---|")
    for r in datos["ga4"]["conversion_por_pagina"]:
        A(f"| `{r['pagePath']}` | {n(r['eventCount'])} |")
    A("")

    A("### Páginas más vistas")
    A("")
    prev_pag = {r["pagePath"]: r["screenPageViews"] for r in datos["ga4"]["paginas"]["anterior"]}
    A("| Página | Vistas | Anterior | Var. |")
    A("|---|---|---|---|")
    for r in datos["ga4"]["paginas"]["actual"]:
        p = r["pagePath"]
        A(f"| `{p}` | {n(r['screenPageViews'])} | {n(prev_pag.get(p, 0))} | {var(r['screenPageViews'], prev_pag.get(p, 0))} |")
    A("")

    # --- GSC ---
    A("## Búsqueda (Search Console)")
    A("")
    ga_, gp_ = datos["gsc"]["totales"]["actual"], datos["gsc"]["totales"]["anterior"]
    ga_ = ga_[0] if ga_ else {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    gp_ = gp_[0] if gp_ else {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    A("| Métrica | Semana | Anterior | Var. |")
    A("|---|---|---|---|")
    A(f"| Clics | {n(ga_['clicks'])} | {n(gp_['clicks'])} | {var(ga_['clicks'], gp_['clicks'])} |")
    A(f"| Impresiones | {n(ga_['impressions'])} | {n(gp_['impressions'])} | {var(ga_['impressions'], gp_['impressions'])} |")
    A(f"| CTR | {ga_['ctr']*100:.1f} % | {gp_['ctr']*100:.1f} % | |")
    # En posición, BAJAR es mejor: se marca aparte para que nadie lo lea al revés.
    delta = ga_["position"] - gp_["position"]
    flecha = "mejora" if delta < 0 else ("empeora" if delta > 0 else "igual")
    A(f"| Posición media | {ga_['position']:.1f} | {gp_['position']:.1f} | {delta:+.1f} ({flecha}) |")
    A("")

    A("### Consultas")
    A("")
    prev_q = {r["query"]: r for r in datos["gsc"]["consultas"]["anterior"]}
    A("| Consulta | Clics | Impr. | Posición | Pos. anterior |")
    A("|---|---|---|---|---|")
    for r in datos["gsc"]["consultas"]["actual"]:
        p = prev_q.get(r["query"])
        antes = f"{p['position']:.1f}" if p else "—"
        A(f"| {r['query']} | {n(r['clicks'])} | {n(r['impressions'])} | {r['position']:.1f} | {antes} |")
    A("")

    A("### Páginas en búsqueda")
    A("")
    A("| Página | Clics | Impr. | Posición |")
    A("|---|---|---|---|")
    for r in datos["gsc"]["paginas"]["actual"]:
        A(f"| {r['page'].replace('https://nexusvng.es', '')} | {n(r['clicks'])} | {n(r['impressions'])} | {r['position']:.1f} |")
    A("")

    print("\n".join(out))


if __name__ == "__main__":
    main()
