import { z } from "zod";
import { site } from "@/lib/site";

/**
 * Reseñas de la ficha de Google Business Profile, vía Places API (New).
 *
 * Reglas de Google que condicionan este módulo
 * (developers.google.com/maps/documentation/places/web-service/policies):
 *   · No se puede guardar el contenido: ni base de datos ni caché. Cada
 *     llamada va con `cache: "no-store"` y la ruta que la sirve también.
 *   · Cada reseña se muestra con la foto, el nombre y el enlace al perfil de
 *     su autor, y el bloque lleva la atribución "Google Maps".
 *   · La API devuelve como mucho 5 reseñas, las que Google elige como más
 *     relevantes. Eso se le dice al visitante (Directiva Ómnibus).
 *
 * Coste: pedir `reviews` factura la llamada en el tramo Enterprise + Atmosphere.
 * El tope de gasto vive en Google Cloud (cuota diaria de la API), no aquí.
 * Sin `GOOGLE_PLACES_API_KEY`, o si Google falla, devuelve `null` y la home
 * simplemente no pinta el bloque de reseñas.
 */

const PLACES_URL = "https://places.googleapis.com/v1/places";
const FIELD_MASK = "rating,userRatingCount,googleMapsUri,reviews";

const textoSchema = z.object({ text: z.string() }).partial();

const resenaSchema = z.object({
  rating: z.number().min(1).max(5),
  relativePublishTimeDescription: z.string().optional(),
  publishTime: z.string().optional(),
  text: textoSchema.optional(),
  originalText: textoSchema.optional(),
  authorAttribution: z.object({
    displayName: z.string().min(1),
    uri: z.string().url().optional(),
    photoUri: z.string().url().optional(),
  }),
});

const placeSchema = z.object({
  rating: z.number().optional(),
  userRatingCount: z.number().int().nonnegative().optional(),
  googleMapsUri: z.string().url().optional(),
  reviews: z.array(z.unknown()).optional(),
});

export type ResenaGoogle = {
  autor: string;
  /** Perfil del autor en Google Maps. */
  autorUrl: string | null;
  /** Foto del autor servida por nuestro servidor (`/api/resenas/avatar`). */
  avatar: string | null;
  estrellas: number;
  /** "hace 2 semanas", tal como lo da Google. */
  cuando: string | null;
  publicada: string | null;
  /** Texto original del autor, sin traducir ni retocar. */
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
function perfilPermitido(url: string | undefined): string | null {
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
 * Convierte la respuesta de Places en lo que pinta la web. Pura, para poder
 * probarla sin red. Descarta las reseñas que no traen texto o autor: una
 * estrella sin opinión no aporta nada que leer.
 */
export function parsePlace(json: unknown): ResenasGoogle | null {
  const place = placeSchema.safeParse(json);
  if (!place.success) return null;

  const resenas: ResenaGoogle[] = [];
  for (const bruta of place.data.reviews ?? []) {
    const r = resenaSchema.safeParse(bruta);
    if (!r.success) continue;
    const texto = (r.data.originalText?.text ?? r.data.text?.text ?? "").trim();
    if (!texto) continue;
    const foto = r.data.authorAttribution.photoUri;
    resenas.push({
      autor: r.data.authorAttribution.displayName,
      autorUrl: perfilPermitido(r.data.authorAttribution.uri),
      avatar: foto && avatarPermitido(foto) ? `/api/resenas/avatar?u=${encodeURIComponent(foto)}` : null,
      estrellas: Math.round(r.data.rating),
      cuando: r.data.relativePublishTimeDescription ?? null,
      publicada: r.data.publishTime ?? null,
      texto,
    });
  }

  if (resenas.length === 0) return null;

  return {
    nota: place.data.rating ?? null,
    total: place.data.userRatingCount ?? null,
    fichaUrl: place.data.googleMapsUri ?? site.google.mapsUrl,
    resenas,
  };
}

/** Pide las reseñas a Google. Sin clave o con error, `null`: el bloque no se pinta. */
export async function getResenasGoogle(): Promise<ResenasGoogle | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${PLACES_URL}/${site.google.placeId}?languageCode=es`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      // 429 = cuota diaria agotada (el tope de gasto funcionando): no es un error.
      const nivel = res.status === 429 ? "info" : "warn";
      console[nivel](`[google-reviews] Places API respondió ${res.status}`);
      return null;
    }
    return parsePlace(await res.json());
  } catch (e) {
    console.warn("[google-reviews] sin respuesta de Places API", e);
    return null;
  }
}
