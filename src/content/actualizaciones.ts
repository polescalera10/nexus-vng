/**
 * Fecha de última edición REAL del contenido de cada página fija, para el
 * `lastmod` del sitemap.
 *
 * Antes el sitemap ponía `new Date()` en las 56 URLs: la fecha del build. Eso
 * hace que las 56 cambien a la vez en cada despliegue aunque no se haya tocado
 * una coma, y Google acaba ignorando el campo entero (documentación de
 * sitemaps: usa `lastmod` solo si lo considera fiable). Con fechas reales,
 * prioriza el rastreo de lo que de verdad ha cambiado.
 *
 * REGLA DE MANTENIMIENTO: al cambiar el copy de una página, actualizar aquí su
 * fecha (formato YYYY-MM-DD). No hace falta tocarla por cambios de estilo,
 * refactors o textos de otra página. Las rutas dinámicas (modalidades y
 * eventos) no van aquí: su fecha sale del `updated_at` de Supabase.
 */
export const actualizaciones: Record<string, string> = {
  "": "2026-08-14",
  "/clases": "2026-08-14",
  "/socio-fundador": "2026-08-01",
  "/intensivos": "2026-08-14",
  "/profesores": "2026-08-14",
  "/horarios": "2026-08-14",
  "/eventos": "2026-08-01",
  "/sobre-nosotros": "2026-08-14",
  "/contacto": "2026-08-14",
  "/faq": "2026-08-14",
  "/aviso-legal": "2026-08-01",
  "/privacidad": "2026-08-01",
  "/cookies": "2026-08-01",
};

/** Fecha de la sección para el sitemap; cae a hoy si la ruta no está declarada. */
export function ultimaActualizacion(path: string): Date {
  const fecha = actualizaciones[path];
  return fecha ? new Date(`${fecha}T00:00:00Z`) : new Date();
}
