#!/usr/bin/env python3
"""
Genera los assets web (posters JPEG + loops MP4 mudos) a partir del material
bruto de los intensivos. Se ejecuta a mano; no forma parte del build.

Necesita ffmpeg en el PATH (`brew install ffmpeg`).

    NEXUS_MEDIA_SRC=/ruta/al/material python3 scripts/build-media.py

Fuente: los .MOV originales de los intensivos (vertical 1080x1920, H.264).
Salida: public/media/ — es lo único que se versiona; el bruto pesa 4,4 GB y
se queda fuera del repo.

Los mapas de abajo son la selección de fotogramas e instantes: para cambiar
una imagen se toca el segundo, no el JPEG. Los nombres de salida tienen que
seguir coincidiendo con src/content/media.ts.
"""
import os, subprocess, pathlib, sys

SRC = pathlib.Path(os.environ.get("NEXUS_MEDIA_SRC", "/Volumes/Extreme SSD/NEXUS/Intensivos"))
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "media"

# Recorte vertical: de 1080x1920 a la relación pedida, anclado un poco por
# encima del centro (0.35) para no cortar cabezas.
def crop_filter(w, h, anchor=0.35):
    return (
        f"crop=w='min(iw,ih*{w}/{h})':h='min(ih,iw*{h}/{w})'"
        f":x='(iw-ow)/2':y='(ih-oh)*{anchor}',scale={w}:{h}"
    )


def still(rel, t, dst, w=900, h=1200, anchor=0.35, q=3):
    dst = OUT / dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(SRC / rel),
           "-frames:v", "1", "-vf", crop_filter(w, h, anchor), "-q:v", str(q), str(dst)]
    subprocess.run(cmd, check=True)
    return dst


def loop(rel, t, dur, dst, w=540, h=960, anchor=0.35, crf=30, fps=25):
    dst = OUT / dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    vf = crop_filter(w, h, anchor) + f",fps={fps}"
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-t", str(dur), "-i", str(SRC / rel),
           "-an", "-map_metadata", "-1", "-vf", vf,
           "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
           "-crf", str(crf), "-preset", "slow", "-movflags", "+faststart", str(dst)]
    subprocess.run(cmd, check=True)
    return dst


def triptych(panels, dur, dst, panel_w=640, panel_h=1080, crf=30, fps=25):
    """Tres clips verticales en columna → un solo vídeo horizontal 1920x1080."""
    dst = OUT / dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    ins, filt, labels = [], [], []
    for i, (rel, t) in enumerate(panels):
        ins += ["-ss", str(t), "-t", str(dur), "-i", str(SRC / rel)]
        filt.append(f"[{i}:v]{crop_filter(panel_w, panel_h)},fps={fps},setsar=1[p{i}]")
        labels.append(f"[p{i}]")
    filt.append("".join(labels) + f"hstack=inputs={len(panels)}[out]")
    cmd = ["ffmpeg", "-v", "error", "-y"] + ins + [
        "-filter_complex", ";".join(filt), "-map", "[out]", "-an", "-map_metadata", "-1",
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
        "-crf", str(crf), "-preset", "slow", "-movflags", "+faststart", str(dst)]
    subprocess.run(cmd, check=True)
    return dst


def poster_from(video, dst, t=0):
    """Primer fotograma del MP4 ya codificado: el póster coincide exactamente."""
    dst = OUT / dst
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(video),
                    "-frames:v", "1", "-q:v", "3", str(dst)], check=True)
    return dst


B0 = "Bachata 0/"; B2 = "Bachata 2/"; BL = "Bachata Lady/"
H = "Heels/"; R = "Reparto/"; S0 = "Salsa 0/"; S2 = "Salsa 2/"; SL = "Salsa Lady/"

HERO_PANELS = [(B2 + "IMG_7818.MOV", 3), (R + "IMG_7634.MOV", 0.5), (H + "IMG_7700.MOV", 4)]
HERO_DUR = 7

# Recorte apaisado (4:3) de cada disciplina para las tarjetas de /clases y la
# columna lateral de la ficha: slug → (clip, segundo, anclado vertical).
# Sale del mismo fotograma que la portada vertical, pero encuadrando las caras.
ANCHAS = {
    "salsa-cubana": (S2 + "IMG_7574.MOV", 14, 0.34),
    "bachata": (B0 + "IMG_7668.MOV", 3, 0.16),
    "reparto": (R + "IMG_7634.MOV", 4, 0.40),
    "heels": (H + "IMG_7700.MOV", 8, 0.10),
    "lady-style-salsa": (SL + "IMG_7786.MOV", 25, 0.14),
    "lady-style-bachata": (BL + "IMG_7611.MOV", 7, 0.16),
}

# slug → (poster (rel, t), loop (rel, t, dur), galería [(rel, t), …])
CLASES = {
    "salsa-cubana": ((S2 + "IMG_7574.MOV", 10), (S2 + "IMG_7574.MOV", 6, 7),
                     [(S0 + "IMG_5777.MOV", 12), (S0 + "IMG_7722.MOV", 14),
                      (S2 + "603F5926-D935-4683-B95A-277325B93DD4.MOV", 10)]),
    "bachata": ((B0 + "IMG_7668.MOV", 3), (B2 + "IMG_7818.MOV", 3, 7),
                [(B0 + "IMG_7667.MOV", 4), (B2 + "IMG_7795.MOV", 10), (B2 + "IMG_7795.MOV", 20)]),
    "reparto": ((R + "IMG_7634.MOV", 4), (R + "IMG_7634.MOV", 0.5, 7),
                [(R + "IMG_7622.MOV", 6), (R + "IMG_7637.MOV", 18), (R + "IMG_7638.MOV", 40)]),
    "heels": ((H + "IMG_7700.MOV", 8), (H + "IMG_7700.MOV", 4, 7),
              [(H + "IMG_7699.MOV", 3), (H + "IMG_7701.MOV", 10), (H + "IMG_7698.MOV", 6)]),
    "lady-style-salsa": ((SL + "IMG_7786.MOV", 25), (SL + "IMG_7777.MOV", 26, 7),
                         [(SL + "IMG_7775.MOV", 8), (SL + "IMG_7783.MOV", 7), (SL + "IMG_7780.MOV", 12)]),
    "lady-style-bachata": ((BL + "IMG_7611.MOV", 7), (BL + "IMG_7608.MOV", 12, 7),
                           [(BL + "IMG_7608.MOV", 20), (BL + "IMG_7591.MOV", 14), (BL + "IMG_7606.MOV", 3)]),
}

# (clip, segundo[, anclado vertical del recorte 16:10]) — el ancla por defecto
# (0.22) deja las caras dentro; los planos generales de sala piden bajarla.
INTENSIVOS = {
    "intensivo-salsa-lun17": (S2 + "IMG_7574.MOV", 12),
    "intensivo-bachata-lady-mar18": (BL + "IMG_7608.MOV", 18),
    "intensivo-reparto-mie19": (R + "IMG_7634.MOV", 2, 0.45),
    "intensivo-bachata-jue20": (B0 + "IMG_7657.MOV", 5),
    "intensivo-heels-lun24": (H + "IMG_7699.MOV", 3),
    "intensivo-salsa-mar25": (S0 + "IMG_7722.MOV", 12),
    "intensivo-lady-salsa-mie26": (SL + "IMG_7786.MOV", 30),
    "intensivo-bachata-jue27": (B2 + "IMG_7810.MOV", 6),
}

# Apoyos apaisados de /sobre-nosotros: el texto va a 68ch y un 3:4 ahí dentro
# sería una columna de imagen más alta que la propia sección.
SOBRE = {
    "sala-panoramica": (R + "IMG_7637.MOV", 20, 0.42),
    "clase-bachata": (B2 + "IMG_7818.MOV", 2, 0.25),
}

COMUNIDAD = {
    "sala-llena": (R + "IMG_7634.MOV", 5),
    "pareja-bachata": (B0 + "IMG_7668.MOV", 5),
    "grupo-heels": (H + "IMG_7699.MOV", 4),
    "rueda-salsa": (S2 + "IMG_7574.MOV", 14),
    "pareja-salsa": (S0 + "IMG_7722.MOV", 8),
}


def main():
    print("· hero")
    v = triptych(HERO_PANELS, HERO_DUR, "hero/hero-desktop.mp4")
    poster_from(v, "hero/hero-desktop.jpg")
    v = loop(R + "IMG_7634.MOV", 0.5, HERO_DUR, "hero/hero-mobile.mp4", w=720, h=1280, crf=29)
    poster_from(v, "hero/hero-mobile.jpg")

    for slug, (p, lo, galeria) in CLASES.items():
        print("·", slug)
        still(p[0], p[1], f"clases/{slug}.jpg")
        loop(lo[0], lo[1], lo[2], f"clases/{slug}.mp4")
        for i, (rel, t) in enumerate(galeria, start=1):
            still(rel, t, f"clases/{slug}-{i}.jpg")
        rel, t, anchor = ANCHAS[slug]
        still(rel, t, f"clases/{slug}-ancha.jpg", w=1200, h=900, anchor=anchor)

    print("· intensivos")
    for value, spec in INTENSIVOS.items():
        rel, t, *resto = spec
        # 16:10 y anclado arriba: la tarjeta de la sesión es apaisada, y
        # recortar por el centro de un vertical deja la banda de las caderas.
        still(rel, t, f"intensivos/{value}.jpg", w=960, h=600, anchor=resto[0] if resto else 0.22)

    print("· sobre-nosotros")
    for name, (rel, t, anchor) in SOBRE.items():
        still(rel, t, f"comunidad/{name}.jpg", w=1200, h=750, anchor=anchor)

    print("· comunidad")
    for name, (rel, t) in COMUNIDAD.items():
        still(rel, t, f"comunidad/{name}.jpg", w=1000, h=1250)

    print("hecho")


if __name__ == "__main__":
    sys.exit(main())
