#!/usr/bin/env python3
"""
Genera el set de iconos de NEXUS VNG a partir de la N vectorizada.

    python3 scripts/generate-icons.py

Escribe src/app/favicon.ico, src/app/apple-icon.png y public/icons/*.png.
La fuente de verdad del glifo es src/app/icon.svg: si cambia el dibujo, hay
que tocar N_POLY aquí y el path del SVG a la vez (mismo espacio 20x40).

Solo usa la librería estándar (zlib + struct escriben el PNG y el ICO a mano)
para no meter una dependencia de imagen en un repo que no la necesita.
"""
import math, os, struct, zlib

# --- Glifo: polígono de la N en espacio 20 x 40 (medido del PNG original) ---
GLYPH_W, GLYPH_H = 20.0, 40.0
N_POLY = [
    (0.0, 0.0), (9.0, 0.0), (12.0, 19.48), (12.0, 0.0), (20.0, 0.0),
    (20.0, 40.0), (12.0, 40.0), (12.0, 37.0), (8.0, 18.32), (8.0, 40.0), (0.0, 40.0),
]

INK = (0x0a, 0x0a, 0x0a)
STOPS = [(0.0, (0xb5, 0xf6, 0xaf)), (0.55, (0x71, 0xe9, 0xc9)), (1.0, (0x30, 0xe4, 0xec))]

SS = 8  # submuestras verticales por píxel


def grad(t):
    t = min(max(t, 0.0), 1.0)
    for i in range(len(STOPS) - 1):
        p0, c0 = STOPS[i]
        p1, c1 = STOPS[i + 1]
        if t <= p1:
            f = 0.0 if p1 == p0 else (t - p0) / (p1 - p0)
            return tuple(c0[k] + (c1[k] - c0[k]) * f for k in range(3))
    return STOPS[-1][1]


def add_span(cov, y, x0, x1, size):
    """Acumula cobertura horizontal exacta de [x0,x1) en la fila y."""
    if x1 <= x0:
        return
    x0 = max(x0, 0.0); x1 = min(x1, float(size))
    if x1 <= x0:
        return
    row = cov[y]
    i0, i1 = int(math.floor(x0)), int(math.ceil(x1)) - 1
    if i0 == i1:
        row[i0] += (x1 - x0)
        return
    row[i0] += (i0 + 1 - x0)
    for i in range(i0 + 1, i1):
        row[i] += 1.0
    row[i1] += (x1 - i1)


def rasterize_poly(poly, size):
    """Cobertura [0..1] por píxel de un polígono simple (scanline + supersampling)."""
    cov = [[0.0] * size for _ in range(size)]
    n = len(poly)
    for y in range(size):
        for s in range(SS):
            sy = y + (s + 0.5) / SS
            xs = []
            for i in range(n):
                x1, y1 = poly[i]
                x2, y2 = poly[(i + 1) % n]
                if (y1 <= sy < y2) or (y2 <= sy < y1):
                    xs.append(x1 + (sy - y1) * (x2 - x1) / (y2 - y1))
            xs.sort()
            for k in range(0, len(xs) - 1, 2):
                add_span(cov, y, xs[k], xs[k + 1], size)
    for y in range(size):
        for x in range(size):
            cov[y][x] = min(cov[y][x] / SS, 1.0)
    return cov


def rounded_rect_cov(size, radius):
    """Cobertura de un cuadrado con esquinas redondeadas."""
    cov = [[0.0] * size for _ in range(size)]
    r = radius
    for y in range(size):
        for s in range(SS):
            sy = y + (s + 0.5) / SS
            if sy < r:
                dy = r - sy
            elif sy > size - r:
                dy = sy - (size - r)
            else:
                dy = 0.0
            dx = math.sqrt(max(r * r - dy * dy, 0.0))
            x0, x1 = (r - dx, size - r + dx) if dy > 0 else (0.0, float(size))
            add_span(cov, y, x0, x1, size)
    for y in range(size):
        for x in range(size):
            cov[y][x] = min(cov[y][x] / SS, 1.0)
    return cov


def glyph_poly(size, glyph_ratio):
    """N centrada, con altura = glyph_ratio * size."""
    h = size * glyph_ratio
    k = h / GLYPH_H
    w = GLYPH_W * k
    ox, oy = (size - w) / 2.0, (size - h) / 2.0
    return [(ox + x * k, oy + y * k) for x, y in N_POLY], oy, h


def render(size, glyph_ratio, radius_ratio):
    bg = rounded_rect_cov(size, size * radius_ratio) if radius_ratio > 0 else None
    poly, gy0, gh = glyph_poly(size, glyph_ratio)
    gcov = rasterize_poly(poly, size)
    px = bytearray(size * size * 4)
    for y in range(size):
        t = (y + 0.5 - gy0) / gh
        gr, gg, gb = grad(t)
        for x in range(size):
            a_bg = bg[y][x] if bg else 1.0
            a_g = gcov[y][x] * a_bg  # el glifo nunca sobresale del fondo
            a = a_bg
            if a <= 0.0:
                continue
            # fondo tinta + glifo encima (premultiplicado sobre el fondo opaco)
            r = INK[0] * (1 - a_g / a) + gr * (a_g / a)
            g = INK[1] * (1 - a_g / a) + gg * (a_g / a)
            b = INK[2] * (1 - a_g / a) + gb * (a_g / a)
            i = (y * size + x) * 4
            px[i] = int(round(r)); px[i + 1] = int(round(g))
            px[i + 2] = int(round(b)); px[i + 3] = int(round(a * 255))
    return bytes(px)


def png(px, size):
    def chunk(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    raw = b"".join(b"\x00" + px[y * size * 4:(y + 1) * size * 4] for y in range(size))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


def ico(entries):
    """entries: [(size, png_bytes)] -> .ico con PNGs embebidos."""
    out = struct.pack("<HHH", 0, 1, len(entries))
    off = 6 + 16 * len(entries)
    body = b""
    for size, data in entries:
        out += struct.pack("<BBBBHHII", size if size < 256 else 0, size if size < 256 else 0,
                           0, 0, 1, 32, len(data), off)
        off += len(data)
        body += data
    return out + body


OUT = os.environ.get("OUT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(OUT, "src", "app")
PUB = os.path.join(OUT, "public", "icons")
os.makedirs(PUB, exist_ok=True)

# favicon.ico multi-tamaño: 16/32/48. A 16 px la N va más grande y sin redondeo
# para no perder píxeles útiles.
ico_entries = []
for s in (16, 32, 48):
    ratio = 0.86 if s == 16 else 0.78
    rad = 0.0 if s == 16 else 0.16
    ico_entries.append((s, png(render(s, ratio, rad), s)))
    print("ico", s)
open(os.path.join(APP, "favicon.ico"), "wb").write(ico(ico_entries))

# apple-icon: 180x180 opaco a sangre (iOS aplica su propia máscara)
open(os.path.join(APP, "apple-icon.png"), "wb").write(png(render(180, 0.60, 0.0), 180))
print("apple 180")

# PWA
open(os.path.join(PUB, "icon-192.png"), "wb").write(png(render(192, 0.74, 0.18), 192))
print("192")
open(os.path.join(PUB, "icon-512.png"), "wb").write(png(render(512, 0.74, 0.18), 512))
print("512")
# maskable: glifo dentro de la zona segura (60% central), fondo a sangre
open(os.path.join(PUB, "icon-maskable-512.png"), "wb").write(png(render(512, 0.50, 0.0), 512))
print("maskable")
