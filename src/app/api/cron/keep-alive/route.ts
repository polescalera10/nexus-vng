import { NextResponse } from "next/server";
import { cronRequestIsAuthorized } from "@/lib/cron-auth";
import { todayInMadrid } from "@/lib/format";
import { currentMonthInMadrid } from "@/lib/sessions";
import { generateMonthSessions } from "@/lib/sessions-write";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/keep-alive — disparado por Vercel Cron una vez al día
 * (ver vercel.json). Hace una lectura trivial a Supabase para que el
 * proyecto registre actividad y no entre en pausa automática por
 * inactividad (límite del plan Free: pausa a los 7 días sin uso).
 *
 * No es una garantía oficial de Supabase, solo un ping de actividad — la
 * única forma garantizada de desactivar la pausa es el plan Pro.
 *
 * Vercel añade automáticamente `Authorization: Bearer $CRON_SECRET` en las
 * llamadas de sus Cron Jobs cuando la env var CRON_SECRET existe.
 *
 * **El día 1 de cada mes genera además las sesiones de todos los cursos.**
 * Va colgado aquí y no en su propio cron porque el plan Hobby admite solo dos
 * cron jobs y los dos están ocupados (este y `cumpleanos`); el mismo motivo
 * por el que `cumpleanos` hace dos cosas. La lógica está en
 * `/api/cron/sesiones-mes`, que se puede disparar a mano, y el día que el
 * proyecto pase a Pro basta con darle su propia entrada en vercel.json y
 * quitar este bloque.
 *
 * Sin las sesiones generadas, el profe no encuentra su clase para pasar lista
 * y el alumno no ve ni su próxima clase ni el diario.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[keep-alive] CRON_SECRET no configurado.");
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }
  if (!cronRequestIsAuthorized(request, secret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("modalidades").select("slug").limit(1);

  if (error) {
    // El detalle de Postgres se queda en el log, no viaja en la respuesta.
    console.error("[keep-alive] ping error:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // El día del mes se mira en Madrid: en UTC, a las 01:30 del día 1 el
  // servidor todavía va por el último día del mes anterior.
  const hoy = todayInMadrid();
  const esDiaUno = hoy.endsWith("-01");

  const sesiones = esDiaUno
    ? await generateMonthSessions(supabase, currentMonthInMadrid())
    : null;

  if (sesiones?.error) {
    console.error("[keep-alive] sesiones del mes:", sesiones.error);
  }

  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
    fecha: hoy,
    sesiones_del_mes: sesiones ?? "solo el día 1",
  });
}
