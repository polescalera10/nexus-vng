import { NextResponse } from "next/server";
import { cronRequestIsAuthorized } from "@/lib/cron-auth";
import { currentMonthInMadrid } from "@/lib/sessions";
import { generateMonthSessions } from "@/lib/sessions-write";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/sesiones-mes — genera las sesiones del mes para todos los
 * cursos activos. Protegido con CRON_SECRET, service role (no hay sesión).
 *
 * **No está en vercel.json y es a propósito.** El plan Hobby admite dos cron
 * jobs y los dos están ocupados (keep-alive y cumpleanos), así que el disparo
 * automático del día 1 lo hace `keep-alive`, que ya corre a diario. Este
 * endpoint existe para dispararlo a mano cuando haga falta y para que el día
 * que el proyecto pase a Pro solo haya que añadir la entrada:
 *
 *     { "path": "/api/cron/sesiones-mes", "schedule": "0 5 1 * *" }
 *
 * `?month=YYYY-MM` permite adelantar o rellenar un mes concreto. Sin él, el
 * mes en curso en Madrid — Vercel corre en UTC y a las 01:30 del día 1 el
 * servidor todavía estaría en el mes anterior.
 *
 * Idempotente: reejecutarlo no duplica sesiones ni pisa las que ya hay.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[sesiones-mes] CRON_SECRET no configurado.");
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }
  if (!cronRequestIsAuthorized(request, secret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const pedido = new URL(request.url).searchParams.get("month");
  if (pedido && !/^\d{4}-(0[1-9]|1[0-2])$/.test(pedido)) {
    return NextResponse.json(
      { error: "El parámetro month debe ser YYYY-MM." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const res = await generateMonthSessions(supabase, pedido ?? currentMonthInMadrid());

  if (res.error) {
    return NextResponse.json({ ok: false, ...res }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...res });
}
