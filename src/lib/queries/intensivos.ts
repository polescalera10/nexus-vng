import { createClient } from "@/lib/supabase/server";
import { INTENSIVO_PRECIO } from "@/content/intensivos";
import type { IntensivoRegistro, Lead, MetodoPago } from "@/types/database";

/**
 * Consultas del control de sesiones sueltas (panel admin): intensivos y
 * masterclass, que comparten pantalla y tabla (`intensivo_registros`).
 *
 * La lista de cada sesión NO está en una tabla: se compone en JS a partir de
 *   1) `leads` que apuntan a esa sesión, por dos caminos según de dónde venga:
 *      `intereses` contiene el slug (formulario de intensivos, casillas) o
 *      `evento_slug` es el slug (formulario de la ficha de masterclass), y
 *   2) `intensivo_registros` (las marcas de asistencia/cobro y las altas en
 *      puerta, que son las filas con `lead_id` nulo).
 *
 * Sin embeds PostgREST (convención del repo): queries planas + merge aquí.
 * Tampoco un `or()` con los dos filtros: la sintaxis de `contains` dentro de
 * `or()` va entre llaves y escapada a mano, y aquí se lee mejor con dos
 * consultas y un `Map` por id.
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

function toAsistente(
  registro: IntensivoRegistro | undefined,
  lead: Pick<Lead, "id" | "nombre" | "telefono" | "email"> | undefined,
  precioDefecto: number,
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
    importe: registro?.importe ?? precioDefecto,
    metodoPago: registro?.metodo_pago ?? null,
    enPuerta: !leadId,
  };
}

/**
 * Lista completa de una sesión, ordenada alfabéticamente.
 * `precioDefecto` es el importe que se propone al cobrar a quien todavía no
 * tiene fila: 20 € en los intensivos, el precio del evento en una masterclass.
 */
export async function getListaIntensivo(
  sesion: string,
  precioDefecto: number = INTENSIVO_PRECIO,
): Promise<IntensivoAsistente[]> {
  const supabase = await createClient();

  const [registrosRes, porInteresRes, porEventoRes] = await Promise.all([
    supabase.from("intensivo_registros").select("*").eq("sesion", sesion),
    supabase
      .from("leads")
      .select("id, nombre, telefono, email")
      .contains("intereses", [sesion]),
    supabase
      .from("leads")
      .select("id, nombre, telefono, email")
      .eq("evento_slug", sesion),
  ]);

  if (registrosRes.error) {
    console.error("[getListaIntensivo] registros:", registrosRes.error.message);
  }
  for (const res of [porInteresRes, porEventoRes]) {
    if (res.error) console.error("[getListaIntensivo] leads:", res.error.message);
  }

  const registros = registrosRes.data ?? [];
  // Por id: un lead no puede salir dos veces aunque llegue por los dos caminos.
  const leads = [
    ...new Map(
      [...(porInteresRes.data ?? []), ...(porEventoRes.data ?? [])].map((l) => [l.id, l]),
    ).values(),
  ];

  const registroPorLead = new Map(
    registros.filter((r) => r.lead_id).map((r) => [r.lead_id as string, r]),
  );

  const desdeLeads = leads.map((lead) =>
    toAsistente(registroPorLead.get(lead.id), lead, precioDefecto),
  );

  // Filas sin lead vivo: altas en puerta y leads que ya no marcan esta sesión
  // (interés editado o lead borrado) pero de los que sí hay cobro registrado.
  const leadIds = new Set(leads.map((l) => l.id));
  const sueltos = registros
    .filter((r) => !r.lead_id || !leadIds.has(r.lead_id))
    .map((r) => toAsistente(r, undefined, precioDefecto));

  return [...desdeLeads, ...sueltos].sort(byNombre);
}

/** Contadores de las sesiones que se le pasen, para el índice del panel. */
export async function getResumenIntensivos(
  slugs: string[],
): Promise<Map<string, IntensivoResumen>> {
  const resumen = new Map<string, IntensivoResumen>(
    slugs.map((sesion) => [
      sesion,
      { sesion, apuntados: 0, enLista: 0, asistieron: 0, pagaron: 0, recaudado: 0 },
    ]),
  );
  if (slugs.length === 0) return resumen;

  const supabase = await createClient();

  const [registrosRes, porInteresRes, porEventoRes] = await Promise.all([
    supabase.from("intensivo_registros").select("*").in("sesion", slugs),
    supabase.from("leads").select("id, intereses").overlaps("intereses", slugs),
    supabase.from("leads").select("id, evento_slug").in("evento_slug", slugs),
  ]);

  if (registrosRes.error) {
    console.error("[getResumenIntensivos] registros:", registrosRes.error.message);
  }
  for (const res of [porInteresRes, porEventoRes]) {
    if (res.error) console.error("[getResumenIntensivos] leads:", res.error.message);
  }

  for (const lead of porInteresRes.data ?? []) {
    for (const interes of lead.intereses ?? []) {
      const fila = resumen.get(interes);
      if (!fila) continue;
      fila.apuntados += 1;
      fila.enLista += 1;
    }
  }

  for (const lead of porEventoRes.data ?? []) {
    const fila = lead.evento_slug ? resumen.get(lead.evento_slug) : undefined;
    if (!fila) continue;
    fila.apuntados += 1;
    fila.enLista += 1;
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
