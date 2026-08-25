"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole, isAdminSession } from "@/lib/auth";
import { INTENSIVO_PRECIO } from "@/content/intensivos";
import {
  altaPuertaSchema,
  marcaIntensivoSchema,
  type MarcaIntensivoInput,
} from "@/lib/validation/intensivo";

/**
 * Mutaciones del control de intensivos.
 * La barrera real es la RLS (migración 0024: solo admin y profesor tocan
 * `intensivo_registros`); aquí se valida con Zod y se comprueba el rol para
 * devolver un error legible en vez de un fallo de política.
 */

export type IntensivoResult = { ok: boolean; message?: string; registroId?: string };

const RUTA_INDICE = "/area-privada/admin/intensivos";

function revalidar(sesion: string) {
  revalidatePath(RUTA_INDICE);
  revalidatePath(`${RUTA_INDICE}/${sesion}`);
}

async function requireStaff(): Promise<boolean> {
  const role = await getSessionRole();
  return role === "admin" || role === "profesor";
}

/**
 * Guarda la marca de una persona en una sesión (asistió / pagó / método).
 *
 * Tres caminos según de dónde venga la fila:
 *   · registroId  → UPDATE directo (altas en puerta, o marcas ya creadas).
 *   · leadId      → UPSERT por (sesion, lead_id): la primera vez crea la fila.
 *   · ninguno     → error: no sabríamos a quién estamos marcando.
 */
export async function guardarMarcaIntensivo(
  input: MarcaIntensivoInput,
): Promise<IntensivoResult> {
  if (!(await requireStaff())) return { ok: false, message: "Sin permisos." };

  const parsed = marcaIntensivoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos no válidos." };
  const marca = parsed.data;

  // Sin pago no hay método de pago: evita dejar "bizum" colgando al desmarcar.
  const metodoPago = marca.pagado ? marca.metodoPago : null;

  const supabase = await createClient();

  if (marca.registroId) {
    const { error } = await supabase
      .from("intensivo_registros")
      .update({
        asistio: marca.asistio,
        pagado: marca.pagado,
        metodo_pago: metodoPago,
        importe: marca.importe,
      })
      .eq("id", marca.registroId);

    if (error) {
      console.error("[guardarMarcaIntensivo] update:", error.message);
      return { ok: false, message: "No se ha podido guardar." };
    }

    revalidar(marca.sesion);
    return { ok: true, registroId: marca.registroId };
  }

  if (!marca.leadId) {
    return { ok: false, message: "Falta identificar a la persona." };
  }

  const { data, error } = await supabase
    .from("intensivo_registros")
    .upsert(
      {
        sesion: marca.sesion,
        lead_id: marca.leadId,
        nombre: marca.nombre,
        telefono: marca.telefono,
        email: marca.email,
        asistio: marca.asistio,
        pagado: marca.pagado,
        metodo_pago: metodoPago,
        importe: marca.importe,
      },
      { onConflict: "sesion,lead_id" },
    )
    .select("id")
    .single();

  if (error) {
    console.error("[guardarMarcaIntensivo] upsert:", error.message);
    return { ok: false, message: "No se ha podido guardar." };
  }

  revalidar(marca.sesion);
  return { ok: true, registroId: data.id };
}

/**
 * Alta en puerta: alguien que se presenta sin haberse apuntado por la web.
 * Se crea ya con `asistio = true` (si está aquí, ha venido).
 *
 * Ojo: NO crea un lead. Estos datos se recogen para gestionar la clase, no
 * para marketing — meterlos en el CRM exigiría consentimiento explícito
 * (RGPD). Si Pol quiere añadir a alguien a campañas, lo da de alta como lead
 * con su consentimiento aparte.
 */
export async function anadirAsistentePuerta(
  input: unknown,
): Promise<IntensivoResult> {
  if (!(await requireStaff())) return { ok: false, message: "Sin permisos." };

  const parsed = altaPuertaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }
  const alta = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intensivo_registros")
    .insert({
      sesion: alta.sesion,
      lead_id: null,
      nombre: alta.nombre,
      telefono: alta.telefono ? alta.telefono : null,
      email: null,
      asistio: true,
      pagado: alta.pagado,
      metodo_pago: alta.pagado ? alta.metodoPago : null,
      importe: INTENSIVO_PRECIO,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[anadirAsistentePuerta] insert:", error.message);
    return { ok: false, message: "No se ha podido añadir." };
  }

  revalidar(alta.sesion);
  return { ok: true, registroId: data.id };
}

/** Borra una fila (para deshacer un alta en puerta equivocada). Solo admin. */
export async function eliminarRegistroIntensivo(
  registroId: string,
  sesion: string,
): Promise<IntensivoResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "Sin permisos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("intensivo_registros")
    .delete()
    .eq("id", registroId);

  if (error) {
    console.error("[eliminarRegistroIntensivo] delete:", error.message);
    return { ok: false, message: "No se ha podido borrar." };
  }

  revalidar(sesion);
  return { ok: true };
}
