#!/usr/bin/env python3
"""
Rastreo SEO on-page de nexusvng.es (o de un build local).

Lee el sitemap del host indicado y, por cada URL, saca una fila JSON con:
status, title y su longitud, meta description y su longitud, canonical,
meta robots, H1, número de H2, tipos de JSON-LD, palabras dentro de <main>,
imágenes sin alt y si hay og:image.

Uso:
    python3 scripts/seo-crawl.py                         # producción
    python3 scripts/seo-crawl.py http://localhost:3100   # build local
    python3 scripts/seo-crawl.py https://nexusvng.es /clases /eventos   # solo esas rutas
    python3 scripts/seo-crawl.py --diff docs/seo-baseline-2026-09-15.jsonl

Con --diff compara contra una línea base guardada y enseña solo los campos
que han cambiado. Sin dependencias: solo la librería estándar.
"""

import html
import json
import re
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse

UA = "Mozilla/5.0 (compatible; nexus-seo-crawl/1.0)"
CAMPOS = ("status", "title", "title_len", "desc", "desc_len", "canonical", "robots", "h1", "h2", "ld", "words", "noalt", "og")


def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")


def sitemap_paths(base: str) -> list[str]:
    _, xml = fetch(f"{base}/sitemap.xml")
    # El sitemap trae URLs absolutas del dominio canónico: nos quedamos con la
    # ruta para poder rastrear el mismo árbol contra localhost.
    return [urlparse(loc).path or "/" for loc in re.findall(r"<loc>([^<]+)</loc>", xml)]


def ld_types(body: str) -> list[str]:
    tipos: set[str] = set()

    def walk(x):
        if isinstance(x, dict):
            t = x.get("@type")
            if isinstance(t, str):
                tipos.add(t)
            elif isinstance(t, list):
                tipos.update(map(str, t))
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)

    for bloque in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', body, re.S):
        try:
            walk(json.loads(bloque))
        except json.JSONDecodeError:
            tipos.add("JSON_INVALIDO")
    return sorted(tipos)


def texto(fragmento: str) -> str:
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", fragmento)).split())


def analizar(base: str, path: str) -> dict:
    status, body = fetch(f"{base}{path if path != '/' else ''}" or base)
    meta = lambda pat: (m.group(1) if (m := re.search(pat, body)) else None)  # noqa: E731
    title = meta(r"<title>(.*?)</title>")
    title = html.unescape(title) if title else None
    desc = meta(r'<meta name="description" content="([^"]*)"')
    desc = html.unescape(desc) if desc else None
    limpio = re.sub(r"<script.*?</script>|<style.*?</style>", "", body, flags=re.S)
    main = re.search(r"<main.*?</main>", limpio, re.S)
    imgs = re.findall(r"<img[^>]*>", body)
    return {
        "path": path,
        "status": status,
        "title": title,
        "title_len": len(title or ""),
        "desc": desc,
        "desc_len": len(desc or ""),
        "canonical": meta(r'<link rel="canonical" href="([^"]*)"'),
        "robots": meta(r'<meta name="robots" content="([^"]*)"'),
        "h1": [texto(h) for h in re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S)],
        "h2": len(re.findall(r"<h2[\s>]", body)),
        "ld": ld_types(body),
        "words": len(texto(main.group(0) if main else limpio).split()),
        "noalt": sum(1 for i in imgs if "alt=" not in i),
        "og": 'property="og:image"' in body,
    }


def diff(base_file: str, filas: list[dict]) -> None:
    antes = {r["path"]: r for r in map(json.loads, open(base_file, encoding="utf-8"))}
    ahora = {r["path"]: r for r in filas}
    for path in sorted(set(antes) | set(ahora)):
        a, b = antes.get(path), ahora.get(path)
        if a is None:
            print(f"+ {path} (nueva)")
            continue
        if b is None:
            print(f"- {path} (ya no está)")
            continue
        cambios = [c for c in CAMPOS if a.get(c) != b.get(c)]
        for c in cambios:
            print(f"~ {path} · {c}: {a.get(c)!r} -> {b.get(c)!r}")


def main(argv: list[str]) -> None:
    base_file = None
    if "--diff" in argv:
        i = argv.index("--diff")
        base_file = argv[i + 1]
        argv = argv[:i] + argv[i + 2 :]
    base = (argv[0] if argv else "https://nexusvng.es").rstrip("/")
    paths = argv[1:] or sitemap_paths(base)
    filas = [analizar(base, p) for p in paths]
    if base_file:
        diff(base_file, filas)
    else:
        for f in filas:
            print(json.dumps(f, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1:])
