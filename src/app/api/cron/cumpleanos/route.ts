import { NextResponse } from "next/server";
import { cronRequestIsAuthorized } from "@/lib/cron-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/format";
import {
  dispatchWhatsappEvent,
  flushPendingWhatsappEvents,
} from "@/lib/whatsapp/dispatch";

/**
 * GET /api/cron/cumpleanos — tarea diaria de WhatsApp.
 * Protegida por el header `x-cron-secret` == CRON_SECRET (env).
 * Service role: no hay sesión de usuario, no pasa por RLS.
 *
 * Hace dos cosas, y van juntas a propósito: el plan de Vercel limita el número
 * de crons, y ambas son "lo que hay que empujar hoy hacia n8n".
 *
 *   1. Felicita a los alumnos activos que cumplen años hoy. El `anio` viaja en
 *      el payload y hay un índice único parcial sobre él (migración 0029), así
 *      que reejecutar el cron no manda dos felicitaciones.
 *   2. Vacía la cola de eventos `pendiente`. Los crea el trigger de hitos de
 *      puntos, que vive en Postgres y no puede llamar a n8n por su cuenta.
 *
 * Responde JSON { fecha, felicitados, pendientes_despachados }.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cumpleanos] CRON_SECRET no configurado.");
    return NextResponse.json(
      { error: "CRON_SECRET no configurado en el servidor." },
      { status: 500 },
    );
  }
  if (!cronRequestIsAuthorized(request, secret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();

  // "Hoy" es el de Vilanova, no el del servidor (Vercel corre en UTC).
  const hoy = todayInMadrid();
  const [anio, mes, dia] = hoy.split("-");

  const { data: students, error } = await supabase
    .from("students")
    .select("id, full_name, phone, birthday")
    .eq("active", true)
    .not("birthday", "is", null);

  if (error) {
    console.error("[cumpleanos] alumnos:", error.message);
    return NextResponse.json({ error: "Error leyendo alumnos." }, { status: 500 });
  }

  // El filtro por día y mes se hace en JS: en Postgres exigiría una función en
  // el WHERE (`to_char(birthday,'MM-DD')`) que PostgREST no expone, y el
  // volumen de alumnos de una escuela cabe de sobra en memoria.
  const cumplen = (students ?? []).filter((s) => s.birthday?.slice(5) === `${mes}-${dia}`);

  // Dedupe explícito además del índice único: así el log no se llena de
  // errores 23505 cada vez que el cron se reintenta.
  const { data: yaFelicitados } = await supabase
    .from("whatsapp_events")
    .select("student_id, payload")
    .eq("type", "cumpleanos")
    .gte("created_at", `${anio}-01-01T00:00:00Z`);

  const hechos = new Set(
    (yaFelicitados ?? [])
      .filter((e) => (e.payload as Record<string, unknown>)?.anio === anio)
      .map((e) => e.student_id)
      .filter((id): id is string => id !== null),
  );

  let felicitados = 0;
  for (const s of cumplen) {
    if (hechos.has(s.id)) continue;

    const nacimiento = Number(s.birthday!.slice(0, 4));
    await dispatchWhatsappEvent(supabase, {
      type: "cumpleanos",
      studentId: s.id,
      payload: {
        anio,
        fecha: hoy,
        student_name: s.full_name,
        nombre_corto: s.full_name.split(" ")[0],
        phone: s.phone,
        edad: Number(anio) - nacimiento,
      },
    });
    felicitados += 1;
  }

  const pendientesDespachados = await flushPendingWhatsappEvents(supabase);

  return NextResponse.json({
    fecha: hoy,
    felicitados,
    pendientes_despachados: pendientesDespachados,
  });
}
