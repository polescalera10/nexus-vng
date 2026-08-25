/**
 * Lista blanca de orígenes para las imágenes que se pintan en la web pública
 * (portadas de evento y las que van dentro del markdown de una ficha).
 *
 * Sin ella, una URL de un tercero carga un recurso externo en cada visita: ese
 * tercero recibe la IP y el user-agent del visitante sin base legal. Es un
 * problema de RGPD, no de XSS — React ya escapa el atributo.
 * Ver docs/auditoria-seguridad-2026-08-03.md (B2).
 *
 * Se aceptan rutas propias (`/images/…`), Supabase Storage y el propio dominio.
 */
export function safeImageSrc(src: string | undefined | null): string | null {
  if (!src) return null;
  const value = src.trim();

  // Ruta propia: debe empezar por "/" y no por "//" ni "/\" (dominio externo).
  if (/^\/(?![/\\])[^\s\\]*$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;

    const siteHost = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : null;

    if (url.hostname.endsWith(".supabase.co")) return url.toString();
    if (siteHost && url.hostname === siteHost) return url.toString();
    return null;
  } catch {
    return null;
  }
}
