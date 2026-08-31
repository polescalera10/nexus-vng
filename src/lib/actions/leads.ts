"use server";

import { revalidatePath } from "next/cache";
import { postToN8n } from "@/lib/n8n/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { interestLeadSchema, leadEstadoSchema, leadSchema } from "@/lib/validation/lead";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Errores por campo, para feedback inline. */
  errors?: Record<string, string[]>;
};

/**
 * Cliente con el que se persiste un lead público.
 *
 * Se usa el service role a propósito: así el INSERT en `leads` deja de
 * necesitar la política `leads: insert público` (`WITH CHECK (true)` para
 * `anon`), que permitía a cualquiera lanzar `POST /rest/v1/leads` en bucle con
 * la clave publicable del bundle, saltándose el honeypot y la validación Zod.
 * Para el visitante no cambia nada: sigue siendo el mismo formulario.
 * Ver docs/auditoria-seguridad-2026-08-03.md (A2).
 *
 * ⚠️ Si `SUPABASE_SERVICE_ROLE_KEY` no estuviera configurada se cae al cliente
 * anónimo de siempre — mejor un lead guardado con la política antigua que un
 * formulario roto. Por eso la política solo debe retirarse DESPUÉS de
 * comprobar en producción que los formularios siguen guardando.
 */
async function leadsWriteClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  console.warn("[leads] SUPABASE_SERVICE_ROLE_KEY ausente; se inserta como anon.");
  return createClient();
}

/**
 * Server Action de los formularios públicos (clase de prueba, founding, contacto).
 * Flujo: validar (Zod, incluido el consentimiento RGPD) → insertar en `leads` →
 * POST al webhook n8n → feedback.
 * El webhook n8n NUNCA se expone al cliente: se llama desde aquí, en el servidor.
 */
export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const raw = {
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email") ?? "",
    modalidad_interes: formData.get("modalidad_interes") ?? "",
    origen: formData.get("origen"),
    mensaje: formData.get("mensaje") ?? "",
    consentimiento: formData.get("consentimiento") ?? "",
    website: formData.get("website") ?? "",
  };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Honeypot: si viene relleno, fingimos éxito y no hacemos nada.
  if (parsed.data.website) {
    return { status: "success", message: "¡Gracias! Te escribimos enseguida." };
  }

  // `consentimiento` solo se valida: no hay columna para él en `leads` (mismo
  // criterio que `submitInterestLead`); viaja a n8n como booleano.
  const { website: _hp, consentimiento: _c, ...lead } = parsed.data;

  // 1) Persistir el lead (escritura de servidor, ver leadsWriteClient).
  const supabase = await leadsWriteClient();
  const { error } = await supabase.from("leads").insert({
    nombre: lead.nombre,
    telefono: lead.telefono,
    email: lead.email || null,
    modalidad_interes: lead.modalidad_interes || null,
    origen: lead.origen,
    mensaje: lead.mensaje || null,
  });

  if (error) {
    console.error("[submitLead] insert error:", error.message);
    return {
      status: "error",
      message: "No hemos podido guardar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.",
    };
  }

  // 2) Notificar a n8n (email + WhatsApp). No bloquea el éxito del lead.
  await postToN8n({
    ...lead,
    consentimiento: true,
    recibido_en: new Date().toISOString(),
  }).catch((e) => console.error("[submitLead] webhook n8n falló:", e));

  return {
    status: "success",
    message: "¡Gracias! Te escribimos por WhatsApp enseguida.",
  };
}

/**
 * El contador público de plazas fundadoras se calcula sobre `leads`, así que
 * cualquier alta o cambio de estado de un lead `socio-fundador` deja obsoletas
 * la home y la landing. Sin esto habría que esperar a la revalidación horaria
 * para que "Quedan N / 10" reflejara la realidad.
 */
function revalidarPlazasFundadoras() {
  revalidatePath("/");
  revalidatePath("/socio-fundador");
}

/** Etiqueta legible en el CRM de la landing que convirtió al lead. */
const LANDING_LABEL: Record<"intensivos" | "curso-regular" | "socio-fundador", string> = {
  intensivos: "Intensivos agosto",
  "curso-regular": "Curso regular",
  "socio-fundador": "Socio fundador",
};

/**
 * Server Action de las landings de INTENSIVOS, CURSO REGULAR y SOCIO FUNDADOR.
 * Igual que `submitLead` pero con email obligatorio, consentimiento RGPD y un
 * array de `intereses` (etiquetas para marketing segmentado). Los intereses se
 * guardan como `text[]` en `leads` y se envían a n8n también en texto plano.
 */
export async function submitInterestLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const raw = {
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email") ?? "",
    origen: formData.get("origen"),
    // Checkboxes múltiples con el mismo name → getAll.
    intereses: formData.getAll("intereses").map(String),
    consentimiento: formData.get("consentimiento") ?? "",
    website: formData.get("website") ?? "",
  };

  const parsed = interestLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Honeypot: si viene relleno, fingimos éxito y no hacemos nada.
  if (parsed.data.website) {
    return { status: "success", message: "¡Gracias! Te escribimos enseguida." };
  }

  const { website: _hp, consentimiento: _c, ...lead } = parsed.data;

  const supabase = await leadsWriteClient();
  const { error } = await supabase.from("leads").insert({
    nombre: lead.nombre,
    telefono: lead.telefono,
    email: lead.email,
    origen: lead.origen,
    intereses: lead.intereses,
    mensaje: null,
    // Trazabilidad legible en el CRM: qué landing convirtió.
    modalidad_interes: LANDING_LABEL[lead.origen],
  });

  if (error) {
    console.error("[submitInterestLead] insert error:", error.message);
    return {
      status: "error",
      message:
        "No hemos podido guardar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.",
    };
  }

  if (lead.origen === "socio-fundador") revalidarPlazasFundadoras();

  await postToN8n({
    ...lead,
    intereses_texto: lead.intereses.join(", "),
    consentimiento: true,
    recibido_en: new Date().toISOString(),
  }).catch((e) => console.error("[submitInterestLead] webhook n8n falló:", e));

  return {
    status: "success",
    message: "¡Gracias! Hemos recibido tu solicitud y te escribimos enseguida.",
  };
}

/** Resultado de las mutaciones rápidas del panel (fuera de useActionState). */
export type LeadMutationResult = { ok: boolean; message?: string };

/**
 * Cambia el estado de un lead desde el panel (acción rápida del inicio de admin).
 * La barrera real es la RLS: solo `is_admin()` puede actualizar `leads`.
 */
export async function updateLeadEstado(
  leadId: string,
  estado: string,
): Promise<LeadMutationResult> {
  const parsed = leadEstadoSchema.safeParse(estado);
  if (!parsed.success) return { ok: false, message: "Estado no válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ estado: parsed.data }).eq("id", leadId);

  if (error) {
    console.error("[updateLeadEstado] error:", error.message);
    return { ok: false, message: "No se ha podido actualizar el lead." };
  }

  revalidatePath("/area-privada/admin");
  revalidatePath("/area-privada/admin/leads");
  // Descartar (o recuperar) un lead fundador mueve el contador público.
  revalidarPlazasFundadoras();
  return { ok: true };
}
