import { createClient } from "@/lib/supabase/server";
import { intensivoSesiones, INTENSIVO_PRECIO } from "@/content/intensivos";
import type { IntensivoRegistro, Lead, MetodoPago } from "@/types/database";

/**
 * Consultas del control de intensivos (panel admin).
 *
 * La lista de cada sesión NO está en una tabla: se compone en JS a partir de
 *   1) `leads` cuyo `intereses` contiene el slug de la sesión (los que se
 *      apuntaron por el formulario de la web), y
 *   2) `intensivo_registros` (las marcas de asistencia/cobro y las altas en
 *      puerta, que son las filas con `lead_id` nulo).
 *
 * Sin embeds PostgREST (convención del repo): queries planas + merge aquí.
 */

/** Una persona en la lista de una sesión, ya mezclada. */
export type IntensivoAsistente = {
  /** Clave estable para React y para las Server Actions. */
  key: string;
  leadId: string | null;
  /** Fila en `intensivo_registros`; null si aún no se ha marcado nada. */
  registroId: string | null;
  nombre: string;
  telefono: string | null;
  email: string | null;
  asistio: boolean;
  pagado: boolean;
  importe: number;
  metodoPago: MetodoPago | null;
  /** true = se apuntó en el momento, no venía del formulario. */
  enPuerta: boolean;
};

export type IntensivoResumen = {
  sesion: string;
  /** Personas que se apuntaron por la web. */
  apuntados: number;
  /** Personas en la lista (apuntados + altas en puerta). */
  enLista: number;
  asistieron: number;
  pagaron: number;
  /** Euros cobrados (suma de `importe` de los marcados como pagados). */
  recaudado: number;
};

const byNombre = (a: { nombre: string }, b: { nombre: string }) =>
  a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });

/** Todos los slugs del cartel, para acotar las consultas. */
const SLUGS = intensivoSesiones.map((s) => s.value);

function toAsistente(
  registro: IntensivoRegistro | undefined,
  lead: Pick<Lead, "id" | "nombre" | "telefono" | "email"> | undefined,
): IntensivoAsistente {
  const leadId = lead?.id ?? registro?.lead_id ?? null;
  return {
    key: leadId ? `lead:${leadId}` : `registro:${registro!.id}`,
    leadId,
    registroId: registro?.id ?? null,
    // El lead manda en los datos de contacto: si se corrigen en el CRM, la
    // lista de la clase los refleja sin tener que tocar el registro.
    nombre: lead?.nombre ?? registro?.nombre ?? "Sin nombre",
    telefono: lead?.telefono ?? registro?.telefono ?? null,
    email: lead?.email ?? registro?.email ?? null,
    asistio: registro?.asistio ?? false,
    pagado: registro?.pagado ?? false,
    importe: registro?.importe ?? INTENSIVO_PRECIO,
    metodoPago: registro?.metodo_pago ?? null,
    enPuerta: !leadId,
  };
}

/** Lista completa de una sesión, ordenada alfabéticamente. */
export async function getListaIntensivo(sesion: string): Promise<IntensivoAsistente[]> {
  const supabase = await createClient();

  const [registrosRes, leadsRes] = await Promise.all([
    supabase.from("intensivo_registros").select("*").eq("sesion", sesion),
    supabase
      .from("leads")
      .select("id, nombre, telefono, email")
      .contains("intereses", [sesion]),
  ]);

  if (registrosRes.error) {
    console.error("[getListaIntensivo] registros:", registrosRes.error.message);
  }
  if (leadsRes.error) {
    console.error("[getListaIntensivo] leads:", leadsRes.error.message);
  }

  const registros = registrosRes.data ?? [];
  const leads = leadsRes.data ?? [];

  const registroPorLead = new Map(
    registros.filter((r) => r.lead_id).map((r) => [r.lead_id as string, r]),
  );

  const desdeLeads = leads.map((lead) => toAsistente(registroPorLead.get(lead.id), lead));

  // Filas sin lead vivo: altas en puerta y leads que ya no marcan esta sesión
  // (interés editado o lead borrado) pero de los que sí hay cobro registrado.
  const leadIds = new Set(leads.map((l) => l.id));
  const sueltos = registros
    .filter((r) => !r.lead_id || !leadIds.has(r.lead_id))
    .map((r) => toAsistente(r, undefined));

  return [...desdeLeads, ...sueltos].sort(byNombre);
}

/** Contadores de las 8 sesiones, para el índice del panel. */
export async function getResumenIntensivos(): Promise<Map<string, IntensivoResumen>> {
  const supabase = await createClient();

  const [registrosRes, leadsRes] = await Promise.all([
    supabase.from("intensivo_registros").select("*").in("sesion", SLUGS),
    supabase.from("leads").select("id, intereses").overlaps("intereses", SLUGS),
  ]);

  if (registrosRes.error) {
    console.error("[getResumenIntensivos] registros:", registrosRes.error.message);
  }
  if (leadsRes.error) {
    console.error("[getResumenIntensivos] leads:", leadsRes.error.message);
  }

  const resumen = new Map<string, IntensivoResumen>(
    SLUGS.map((sesion) => [
      sesion,
      { sesion, apuntados: 0, enLista: 0, asistieron: 0, pagaron: 0, recaudado: 0 },
    ]),
  );

  for (const lead of leadsRes.data ?? []) {
    for (const interes of lead.intereses ?? []) {
      const fila = resumen.get(interes);
      if (!fila) continue;
      fila.apuntados += 1;
      fila.enLista += 1;
    }
  }

  for (const registro of registrosRes.data ?? []) {
    const fila = resumen.get(registro.sesion);
    if (!fila) continue;
    // Los registros con lead ya están contados arriba; solo suman lista los de
    // puerta (`lead_id` nulo).
    if (!registro.lead_id) fila.enLista += 1;
    if (registro.asistio) fila.asistieron += 1;
    if (registro.pagado) {
      fila.pagaron += 1;
      fila.recaudado += Number(registro.importe);
    }
  }

  return resumen;
}
