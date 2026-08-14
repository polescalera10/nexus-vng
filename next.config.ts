import type { NextConfig } from "next";

/**
 * Content-Security-Policy — ver docs/auditoria-seguridad-2026-08-03.md (A1).
 *
 * Se despliega primero en modo REPORT-ONLY: el navegador registra las
 * violaciones en consola pero no bloquea nada, así que es imposible que rompa
 * la web. Cuando se confirme que no salen avisos durante unos días, cambiar la
 * clave de la cabecera a "Content-Security-Policy" (sin sufijo) para que pase
 * a bloquear de verdad.
 *
 * `'unsafe-inline'` en script-src hace falta hoy por el bootstrap de Consent
 * Mode (`components/analytics/Analytics.tsx`), que DEBE ser inline para
 * ejecutarse antes que gtag.js. La mejora posterior es un nonce generado en el
 * middleware, pero eso obliga a que el middleware cubra también las rutas
 * públicas (hoy solo cubre /area-privada) y añade una llamada por visita.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
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
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

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
