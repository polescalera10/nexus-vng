import { z } from "zod";

/** Orígenes válidos de un lead (coinciden con los CTA/bloques de la web). */
export const leadOrigenes = [
  "clase-prueba",
  "founding",
  "contacto",
  "modalidad",
  "campana",
  "intensivos",
  "curso-regular",
  "socio-fundador",
  "masterclass",
] as const;

/**
 * Lead genérico (clase de prueba, founding, contacto, modalidades, campañas).
 * `consentimiento`: casilla RGPD obligatoria (art. 13 RGPD / LSSI-CE). Se valida
 * también en servidor: no basta con el `required` del HTML.
 */
export const leadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Dinos tu nombre")
    .max(120, "Nombre demasiado largo"),
  telefono: z
    .string()
    .trim()
    .min(6, "Teléfono no válido")
    .max(20, "Teléfono no válido")
    .regex(/^[+0-9\s().-]+$/, "El teléfono solo puede tener números y símbolos"),
  email: z
    .string()
    .trim()
    .email("Email no válido")
    .optional()
    .or(z.literal("")),
  modalidad_interes: z.string().trim().max(80).optional().or(z.literal("")),
  origen: z.enum(leadOrigenes),
  mensaje: z.string().trim().max(1000, "Mensaje demasiado largo").optional().or(z.literal("")),
  consentimiento: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar el tratamiento de datos para continuar" }),
  }),
  // Honeypot anti-spam: debe llegar vacío.
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Formulario de INTENSIVOS, CURSO REGULAR y SOCIO FUNDADOR (páginas de ventas
 * con captación por intereses). A diferencia del lead genérico:
 *   · email OBLIGATORIO (canal de seguimiento por interés),
 *   · `intereses`: al menos una etiqueta marcada (estilos/sesiones),
 *   · `consentimiento`: casilla RGPD obligatoria (LSSI-CE / RGPD).
 */
export const interestLeadSchema = z.object({
  nombre: z.string().trim().min(2, "Dinos tu nombre completo").max(120, "Nombre demasiado largo"),
  telefono: z
    .string()
    .trim()
    .min(6, "Teléfono no válido")
    .max(20, "Teléfono no válido")
    .regex(/^[+0-9\s().-]+$/, "El teléfono solo puede tener números y símbolos"),
  email: z.string().trim().min(1, "Necesitamos tu email").email("Email no válido").max(254),
  origen: z.enum(["intensivos", "curso-regular", "socio-fundador"]),
  intereses: z
    .array(z.string().trim().min(1).max(80))
    .min(1, "Marca al menos una opción que te interese")
    .max(50, "Demasiadas opciones marcadas"),
  consentimiento: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar el tratamiento de datos para continuar" }),
  }),
  // Honeypot anti-spam: debe llegar vacío.
  website: z.string().max(0).optional(),
});

export type InterestLeadInput = z.infer<typeof interestLeadSchema>;

/** `^[a-z0-9]+(-[a-z0-9]+)*$`, igual que el CHECK `leads_evento_slug_format` (0048). */
export const LEAD_EVENTO_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Inscripción a una MASTERCLASS desde la ficha pública del evento.
 * Pide lo mínimo para poder confirmar la plaza: nombre completo, teléfono y
 * email (los tres obligatorios) + consentimiento RGPD.
 *
 * `evento_slug` es la marca interna que dice A CUÁL se apunta (columna
 * `leads.evento_slug`, 0048). Viaja en un campo oculto, pero el servidor NO se
 * fía de él: lo usa solo para releer la ficha en la base y sacar de ahí el
 * título. Así no se puede escribir texto arbitrario en el CRM desde fuera.
 */
export const masterclassLeadSchema = z.object({
  nombre: z.string().trim().min(2, "Dinos tu nombre completo").max(120, "Nombre demasiado largo"),
  telefono: z
    .string()
    .trim()
    .min(6, "Teléfono no válido")
    .max(20, "Teléfono no válido")
    .regex(/^[+0-9\s().-]+$/, "El teléfono solo puede tener números y símbolos"),
  email: z.string().trim().min(1, "Necesitamos tu email").email("Email no válido").max(254),
  evento_slug: z
    .string()
    .trim()
    .min(2, "Evento no válido")
    .max(80, "Evento no válido")
    .regex(LEAD_EVENTO_SLUG_REGEX, "Evento no válido"),
  consentimiento: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar el tratamiento de datos para continuar" }),
  }),
  // Honeypot anti-spam: debe llegar vacío.
  website: z.string().max(0).optional(),
});

export type MasterclassLeadInput = z.infer<typeof masterclassLeadSchema>;

/** Estados del embudo de un lead (enum `lead_estado` en Postgres). */
export const leadEstados = [
  "nuevo",
  "contactado",
  "prueba_agendada",
  "convertido",
  "descartado",
] as const;

export const leadEstadoSchema = z.enum(leadEstados);
