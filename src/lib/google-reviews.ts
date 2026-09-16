import { z } from "zod";
import { site } from "@/lib/site";

/**
 * Reseñas de la ficha de Google Business Profile, vía Featurable.
 *
 * Featurable (featurable.com, gratis) se conecta a la ficha con permiso de su
 * dueño y nos da las reseñas por su API, así que no hace falta la Places API
 * de Google ni facturación en Google Cloud. Decisión de Pol (16-09-2026), tras
 * descartar la Places API: solo 5 reseñas y sin poder guardarlas.
 *
 * Se piden en el SERVIDOR y se pintan en el HTML de la home (ISR de 1 h): el
 * navegador del visitante no habla con Featurable ni con Google, y los
 * buscadores ven las reseñas al rastrear. Las fotos de autor pasan por
 * `/api/resenas/avatar` por lo mismo.
 *
 * Directiva Ómnibus: se enseñan las más recientes, SIN filtrar por puntuación,
 * y el bloque lo dice. Si en el panel de Featurable se activa un filtro de
 * estrellas, el aviso de la web deja de ser verdad: no hacerlo.
 *
 * Sin `FEATURABLE_API_KEY` o `FEATURABLE_WIDGET_ID`, o si falla la API,
 * devuelve `null` y la home no pinta el bloque de reseñas.
 */

const API_URL = "https://featurable.com/api/v2/widgets";

/** Cuántas reseñas se enseñan. El aviso del bloque usa esta misma cifra. */
export const MAX_RESENAS = 6;

const resenaSchema = z.object({
  text: z.string().nullish(),
  rating: z.object({ value: z.number(), max: z.number().positive() }),
  publishedAt: z.string().nullish(),
  author: z.object({
    name: z.string().min(1),
    avatarUrl: z.string().nullish(),
    profileUrl: z.string().nullish(),
  }),
});

const widgetSchema = z.object({
  success: z.boolean().optional(),
  widget: z.object({
    isExampleReviews: z.boolean().optional(),
    reviews: z.array(z.unknown()).default([]),
    gbpLocationSummary: z
      .object({
        reviewsCount: z.number().int().nonnegative().nullish(),
        rating: z.number().nullish(),
      })
      .nullish(),
  }),
});

export type ResenaGoogle = {
  autor: string;
  /** Perfil del autor en Google Maps. */
  autorUrl: string | null;
  /** Foto del autor servida por nuestro servidor (`/api/resenas/avatar`). */
  avatar: string | null;
  estrellas: number;
  /** Fecha ISO de publicación. */
  publicada: string | null;
  /** Texto del autor, sin traducir ni retocar. */
  texto: string;
};

export type ResenasGoogle = {
  nota: number | null;
  total: number | null;
  fichaUrl: string;
  resenas: ResenaGoogle[];
};

/**
 * Fotos de autor: solo de los servidores de imágenes de Google. Es la lista
 * blanca del proxy de avatares, que si no sería un reenviador abierto (SSRF).
 */
export function avatarPermitido(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "googleusercontent.com" || u.hostname.endsWith(".googleusercontent.com"));
  } catch {
    return false;
  }
}

/** Enlaces al perfil del autor: solo a Google Maps. */
function perfilPermitido(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "www.google.com" || u.hostname === "maps.google.com")
      ? u.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Convierte la respuesta de Featurable en lo que pinta la web. Pura, para
 * probarla sin red.
 *   · Las reseñas de ejemplo (`isExampleReviews`, las que Featurable enseña
 *     antes de conectar la ficha) NUNCA se publican: serían reseñas falsas.
 *   · Sin texto no hay nada que leer: se descarta.
 *   · Orden: de la más reciente a la más antigua, sin mirar la nota.
 */
export function parseFeaturable(json: unknown, max = MAX_RESENAS): ResenasGoogle | null {
  const parsed = widgetSchema.safeParse(json);
  if (!parsed.success || parsed.data.success === false) return null;
  const { widget } = parsed.data;
  if (widget.isExampleReviews) return null;

  const resenas: ResenaGoogle[] = [];
  for (const bruta of widget.reviews) {
    const r = resenaSchema.safeParse(bruta);
    if (!r.success) continue;
    const texto = (r.data.text ?? "").trim();
    if (!texto) continue;
    const foto = r.data.author.avatarUrl;
    resenas.push({
      autor: r.data.author.name,
      autorUrl: perfilPermitido(r.data.author.profileUrl),
      avatar: foto && avatarPermitido(foto) ? `/api/resenas/avatar?u=${encodeURIComponent(foto)}` : null,
      estrellas: Math.min(5, Math.max(1, Math.round((r.data.rating.value / r.data.rating.max) * 5))),
      publicada: r.data.publishedAt ?? null,
      texto,
    });
  }

  if (resenas.length === 0) return null;

  resenas.sort((a, b) => (b.publicada ?? "").localeCompare(a.publicada ?? ""));

  return {
    nota: widget.gbpLocationSummary?.rating ?? null,
    total: widget.gbpLocationSummary?.reviewsCount ?? null,
    fichaUrl: site.google.mapsUrl,
    resenas: resenas.slice(0, max),
  };
}

/** Pide las reseñas a Featurable. Sin configurar o con error, `null`. */
export async function getResenasGoogle(): Promise<ResenasGoogle | null> {
  const key = process.env.FEATURABLE_API_KEY;
  const widgetId = process.env.FEATURABLE_WIDGET_ID;
  if (!key || !widgetId) return null;

  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(widgetId)}`, {
      headers: { "X-API-Key": key },
      // Featurable ya refresca desde Google cada 24 h: con una vez por hora
      // sobra, y no se roza su límite de peticiones.
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`[google-reviews] Featurable respondió ${res.status}`);
      return null;
    }
    return parseFeaturable(await res.json());
  } catch (e) {
    console.warn("[google-reviews] sin respuesta de Featurable", e);
    return null;
  }
}
