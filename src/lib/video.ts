/**
 * Lista blanca de orígenes para los vídeos del diario de clase.
 *
 * Mismo motivo que `safeImageSrc` en `lib/images.ts`: un iframe de un tercero
 * le entrega al tercero la IP y el user-agent de quien mira. Aquí además el
 * que mira es un alumno identificado, así que:
 *
 *   · La lista blanca decide QUÉ orígenes se aceptan.
 *   · YouTube va por `youtube-nocookie.com`, que no escribe cookies de
 *     seguimiento hasta que se le da al play.
 *   · El iframe NO se monta al pintar la página (ver `VideoEmbed`): hasta que
 *     el alumno pulsa, no sale ni una petición al tercero.
 *
 * El vídeo vive fuera porque el plan Free de Supabase Storage da 50 MB por
 * archivo y 1 GB en total: un clip de móvil de un minuto ya no cabe.
 */

export type VideoProvider = "youtube" | "vimeo" | "drive";

export type ParsedVideo = {
  provider: VideoProvider;
  /** URL del iframe, ya normalizada. */
  embedUrl: string;
  /** URL para abrir en pestaña nueva (la original, saneada). */
  watchUrl: string;
};

/** Nombre legible del proveedor, para el aviso previo al play. */
export const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  drive: "Google Drive",
};

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const VIMEO_HASH = /^[A-Za-z0-9]{6,20}$/;
const DRIVE_ID = /^[A-Za-z0-9_-]{10,80}$/;

/**
 * Valida y normaliza la URL de un vídeo. `null` si no es un origen aceptado —
 * y entonces no se pinta nada, nunca un iframe a un dominio desconocido.
 */
export function parseVideoUrl(raw: string | null | undefined): ParsedVideo | null {
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // ── YouTube ───────────────────────────────────────────────────────────────
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return youtube(id);
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") return youtube(url.searchParams.get("v"));
    // /shorts/ID, /embed/ID, /live/ID
    if (["shorts", "embed", "live"].includes(parts[0] ?? "")) return youtube(parts[1]);
    return null;
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────────
  // Los vídeos "unlisted" llevan un hash: vimeo.com/123456789/abc123def4
  // o player.vimeo.com/video/123456789?h=abc123def4. Sin el hash no se ven.
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts[0] === "video" ? 1 : 0;
    const id = parts[idx];
    const hash = parts[idx + 1] ?? url.searchParams.get("h");
    if (!id || !VIMEO_ID.test(id)) return null;
    if (hash && !VIMEO_HASH.test(hash)) return null;

    const embed = new URL(`https://player.vimeo.com/video/${id}`);
    if (hash) embed.searchParams.set("h", hash);
    embed.searchParams.set("dnt", "1"); // do not track
    return {
      provider: "vimeo",
      embedUrl: embed.toString(),
      watchUrl: `https://vimeo.com/${id}${hash ? `/${hash}` : ""}`,
    };
  }

  // ── Google Drive ──────────────────────────────────────────────────────────
  if (host === "drive.google.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    // /file/d/ID/view
    const id = parts[0] === "file" && parts[1] === "d" ? parts[2] : url.searchParams.get("id");
    if (!id || !DRIVE_ID.test(id)) return null;
    return {
      provider: "drive",
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      watchUrl: `https://drive.google.com/file/d/${id}/view`,
    };
  }

  return null;
}

function youtube(id: string | null | undefined): ParsedVideo | null {
  if (!id || !YT_ID.test(id)) return null;
  return {
    provider: "youtube",
    // nocookie + sin vídeos relacionados de otros canales al terminar.
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

/** Mensaje de ayuda del formulario del profe. Un sitio, un texto. */
export const VIDEO_URL_HINT =
  "Pega el enlace de YouTube, Vimeo o Google Drive. Otros sitios no se aceptan.";
