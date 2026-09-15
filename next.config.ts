import type { NextConfig } from "next";

/**
 * Content-Security-Policy — ver docs/auditoria-seguridad-2026-08-03.md (A1).
 *
 * BLOQUEANTE desde el 15-09-2026 (estuvo en Report-Only del 03-08 al 15-09).
 * Cualquier origen nuevo — un embed, un script de terceros, un endpoint — hay
 * que añadirlo aquí o el navegador lo bloquea sin avisar más que en consola.
 *   · frame-src   — los orígenes de `parseVideoUrl` (lib/video.ts). Si se añade
 *                   una plataforma de vídeo allí, va también aquí.
 *   · connect-src — `*.google-analytics.com` cubre `region1.…`, que es adonde
 *                   GA4 manda los hits de visitantes del EEE.
 *   · challenges.cloudflare.com — script e iframe de Turnstile en los
 *                   formularios de lead (components/forms/TurnstileField.tsx).
 *   · `'unsafe-eval'` solo en `next dev` (React Refresh lo necesita); nunca
 *                   en el build de producción.
 *
 * `'unsafe-inline'` en script-src hace falta hoy por el bootstrap de Consent
 * Mode (`components/analytics/Analytics.tsx`), que DEBE ser inline para
 * ejecutarse antes que gtag.js. La mejora posterior es un nonce generado en el
 * middleware, pero eso obliga a que el middleware cubra también las rutas
 * públicas (hoy solo cubre /area-privada) y añade una llamada por visita.
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Origen del Supabase configurado, SOLO si es local (http://127.0.0.1:54321 al
 * usar `scripts/db-reset-local.sh --full`). En producción es https://*.supabase.co
 * y ya está en la lista; sin esto, contra un Supabase local el navegador
 * bloquea el login (connect-src) y el formulario dice "contraseña incorrecta".
 */
const localSupabaseOrigin = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return ["127.0.0.1", "localhost"].includes(url.hostname) ? url.origin : "";
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co${localSupabaseOrigin ? ` ${localSupabaseOrigin}` : ""} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Solo tiene efecto en modo bloqueante (en Report-Only el navegador lo
  // ignora y lo marca como error en consola). Con un Supabase local por http se
  // omite: reescribiría sus llamadas a https y el login fallaría igual.
  ...(localSupabaseOrigin ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/**
 * Cabeceras de seguridad. Ninguna altera el render: solo le dicen al navegador
 * lo que NO debe permitir.
 *   · nosniff             — prohíbe adivinar el tipo MIME de una respuesta.
 *   · Referrer-Policy     — no filtra la URL completa a terceros.
 *   · X-Frame-Options     — clickjacking en navegadores sin soporte de CSP.
 *   · Permissions-Policy  — desactiva APIs del navegador que la web no usa.
 *   · HSTS                — Vercel ya manda max-age; se añade subdominios + preload.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // DENY, igual que `frame-ancestors 'none'`: la web no se enmarca ni a sí misma.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

/**
 * Nota sobre `vercel.json`: lleva `regions: ["cdg1"]` (París). El origen por
 * defecto era `iad1` (Washington) y el público es de Vilanova: cada petición
 * no cacheada cruzaba el Atlántico — TTFB de ~600 ms medido el 14-08-2026.
 * La explicación va aquí porque `vercel.json` es JSON estricto: Vercel valida
 * el fichero contra su esquema y rechaza cualquier clave que no conozca, así
 * que no admite ni siquiera un "//" a modo de comentario.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No anunciar el framework a los escáneres automáticos (cabecera X-Powered-By).
  poweredByHeader: false,
  images: {
    // PLACEHOLDER: añade aquí el host de Supabase Storage cuando subas imágenes reales.
    // remotePatterns: [{ protocol: "https", hostname: "<project-ref>.supabase.co" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Server Actions usadas por los formularios (lead / founding / contacto).
    serverActions: {
      bodySizeLimit: "1mb",
    },
    /**
     * NO activar. Mete el CSS en un <style> del HTML en vez de servirlo como
     * <link>, lo que ahorra una petición que bloquea el render (110 ms según
     * Lighthouse) — pero probado en producción el 15-08-2026 salió mucho peor:
     * el HTML pasó de 18,7 KiB a 38,9 KiB y el FCP en móvil de 0,9 s a 2,6 s.
     * El documento es lo primero que se descarga y engordarlo al doble retrasa
     * el primer pintado más de lo que ahorra la petición que se quita.
     */
    inlineCss: false,
  },
  /**
   * Redirecciones permanentes de URLs retiradas. `/clases/lady-style` existía
   * desde el lanzamiento y tiene enlaces externos; al partirse la disciplina en
   * Lady Style Salsa y Lady Style Bachata (migración 0025) su página deja de
   * generarse, y sin 301 sería un 404 que tira el posicionamiento a la basura.
   */
  async redirects() {
    return [
      {
        source: "/clases/lady-style",
        destination: "/clases/lady-style-salsa",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        /**
         * Área privada fuera del índice por cabecera, no por robots.txt.
         *
         * Con `Disallow` Google no rastrea la ruta, pero puede indexar la URL
         * a pelo si alguien la enlaza (sale en el SERP sin snippet, "no hay
         * información disponible"). Con `noindex` la lee y la descarta de
         * verdad. Por eso robots.ts ya no la bloquea.
         */
        source: "/area-privada",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/area-privada/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
