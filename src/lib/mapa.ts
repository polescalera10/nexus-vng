/**
 * Cálculo de teselas para el mapa de la sala (`components/ui/MapaSala.tsx`).
 *
 * Proyección Web Mercator, la de cualquier mapa de teselas: en el zoom `z` el
 * mundo mide `2^z · 256` píxeles de lado y cada tesela, 256. Puro y sin DOM,
 * para poder probarlo.
 */

export const TESELA = 256;

/** Estilo oscuro de MapTiler: encaja con la estética de la marca. */
export const ESTILO_MAPA = "streets-v2-dark";

export const ZOOM_MIN = 12;
export const ZOOM_MAX = 18;

/** Latitud y longitud → píxel del mundo en el zoom `z`. */
export function aPixel(lat: number, lon: number, z: number): { x: number; y: number } {
  const lado = 2 ** z * TESELA;
  const seno = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * lado,
    y: (0.5 - Math.log((1 + seno) / (1 - seno)) / (4 * Math.PI)) * lado,
  };
}

export type Tesela = {
  /** Índices de la tesela ya envueltos (la longitud da la vuelta al mundo). */
  x: number;
  y: number;
  z: number;
  /** Posición en píxeles dentro del visor. */
  left: number;
  top: number;
};

/**
 * Teselas que cubren un visor de `ancho × alto` centrado en el píxel del mundo
 * `(cx, cy)`. Las filas fuera del mundo (más allá de los polos) no existen.
 */
export function teselasVisibles(cx: number, cy: number, ancho: number, alto: number, z: number): Tesela[] {
  const n = 2 ** z;
  const origenX = cx - ancho / 2;
  const origenY = cy - alto / 2;
  const x0 = Math.floor(origenX / TESELA);
  const x1 = Math.floor((origenX + ancho - 1) / TESELA);
  const y0 = Math.floor(origenY / TESELA);
  const y1 = Math.floor((origenY + alto - 1) / TESELA);

  const teselas: Tesela[] = [];
  for (let ty = y0; ty <= y1; ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = x0; tx <= x1; tx++) {
      teselas.push({
        x: ((tx % n) + n) % n,
        y: ty,
        z,
        left: Math.round(tx * TESELA - origenX),
        top: Math.round(ty * TESELA - origenY),
      });
    }
  }
  return teselas;
}

/** URL de una tesela de MapTiler en alta densidad (512 px pintados a 256). */
export function urlTesela(t: Pick<Tesela, "x" | "y" | "z">, clave: string, estilo = ESTILO_MAPA): string {
  return `https://api.maptiler.com/maps/${estilo}/256/${t.z}/${t.x}/${t.y}@2x.png?key=${encodeURIComponent(clave)}`;
}

/** Recorta el zoom al rango del visor. */
export function limitarZoom(z: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z)));
}
