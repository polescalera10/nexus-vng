/**
 * Constantes de Cloudflare Turnstile compartidas entre el widget (cliente) y la
 * verificación (servidor). Aquí no hay secretos: la clave secreta solo se lee en
 * `lib/turnstile.ts`, dentro de la Server Action.
 */

/** Campo oculto que el widget añade al formulario con el token. */
export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

/**
 * Acción con la que se emite el token. Siteverify la devuelve y el servidor la
 * compara: un token sacado de otro widget (otro formulario, otra web con la
 * misma clave pública) no vale para enviar un lead.
 */
export const TURNSTILE_ACTION = "lead";
