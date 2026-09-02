import { normalizePhone } from "@/lib/phone";
import { WHATSAPP_NUMBER } from "@/lib/site";

/**
 * Re-exportado por compatibilidad: la normalización vive en `lib/phone.ts`
 * desde que `students.phone` (E.164) también la necesita.
 */
export { normalizePhone };

/**
 * Origen del clic. Sirve para (a) prerrellenar un mensaje distinto por bloque
 * y (b) identificar qué CTA convierte mejor.
 */
export type WaOrigin =
  | "hero"
  | "sticky"
  | "founding"
  | "cta-final"
  | "footer"
  | "nav"
  | "modalidad"
  | "profesor"
  | "contacto"
  | "evento"
  | "campana"
  /** CTA de sección dentro de una página; el mensaje lo pone el contexto de ruta. */
  | "pagina";

const MESSAGES: Record<WaOrigin, string> = {
  hero: "¡Hola! Me gustaría info de la clase de prueba de baile 🙂",
  sticky: "¡Hola! Quiero reservar mi clase de prueba de baile 💃",
  founding: "¡Hola! Quiero mi plaza fundadora de NEXUS VNG ✨",
  "cta-final": "¡Hola! ¿Empezamos? Me gustaría apuntarme a una clase de prueba 🙂",
  footer: "¡Hola! Me gustaría más información sobre NEXUS VNG 🙂",
  nav: "¡Hola! Me gustaría info sobre las clases de baile 🙂",
  modalidad: "¡Hola! Me interesa la clase de", // se completa con la modalidad
  // Se completa con el nombre del profe: así sabemos qué ficha convierte.
  profesor: "¡Hola! Me gustaría probar una clase con",
  contacto: "¡Hola! Os escribo desde la web de NEXUS VNG 🙂",
  evento: "¡Hola! Me gustaría más información sobre el evento", // se completa con el nombre del evento
  // Sin base: las landings de campaña (src/content/campanas/) pasan su mensaje
  // completo propio por dolor vía `extra` — ver buildWaLink más abajo.
  campana: "",
  // Fallback: los CTA con `contextual` no leen de aquí, su texto sale de
  // `wa-page-context.ts` según la página que se esté mirando.
  pagina: "¡Hola! Me gustaría más información sobre las clases de NEXUS VNG 🙂",
};

/**
 * Construye un enlace wa.me con mensaje prerrellenado y URL-encoded.
 * @param origin  bloque/CTA de origen
 * @param extra   texto adicional (p. ej. el nombre de la modalidad, o el
 *                mensaje completo de una landing de campaña cuando el origen
 *                no tiene base propia)
 */
/**
 * Enlace de WhatsApp AL LEAD (no a la escuela): acción rápida del panel para
 * responder a alguien que ha dejado sus datos en la web.
 */
export function buildLeadWaLink(phone: string, nombre?: string): string | null {
  const number = normalizePhone(phone);
  if (!number) return null;
  const saludo = nombre ? `¡Hola ${nombre.split(" ")[0]}!` : "¡Hola!";
  const text = `${saludo} Te escribo desde NEXUS VNG por tu consulta sobre las clases 🙂`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Enlace de WhatsApp AL ALUMNO. Igual que el del lead pero sin hablar de una
 * consulta: aquí ya es alguien de la escuela y el mensaje lo escribe el admin
 * (aviso de clase, cambio de horario, cuota). Solo abre el chat con el saludo.
 */
export function buildStudentWaLink(phone: string, nombre?: string): string | null {
  const number = normalizePhone(phone);
  if (!number) return null;
  const saludo = nombre ? `¡Hola ${nombre.split(" ")[0]}!` : "¡Hola!";
  return `https://wa.me/${number}?text=${encodeURIComponent(`${saludo} Te escribo desde NEXUS VNG 🙂`)}`;
}

export function buildWaLink(origin: WaOrigin, extra?: string): string {
  const base = MESSAGES[origin];
  const text = extra ? (base ? `${base} ${extra} 💃` : extra) : base;
  return buildWaLinkFromText(text);
}

/**
 * Enlace a WhatsApp con un mensaje ya redactado entero. Lo usan los CTA
 * contextuales, cuyo texto depende de la página (ver `lib/wa-page-context.ts`)
 * y no del origen del bloque.
 */
export function buildWaLinkFromText(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
