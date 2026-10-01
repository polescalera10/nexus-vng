import { NextResponse } from "next/server";
import { cronRequestIsAuthorized } from "@/lib/cron-auth";
import { enviarCorreo, ResendNoConfigurado } from "@/lib/email/resend";
import { todayInMadrid } from "@/lib/format";
import { horaMadrid, sumarDias } from "@/lib/informe-alumnos/calc";
import { construirInforme } from "@/lib/informe-alumnos/datos";
import { asunto, renderHtml, renderTexto } from "@/lib/informe-alumnos/render";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/informe-alumnos — informe diario del área de alumnos a Pol.
 *
 * Lo dispara pg_cron desde Supabase (0049d) a las 07:00 y a las 08:00 UTC con
 * la cabecera `x-cron-secret` = INFORME_ALUMNOS_SECRET. Solo envía en la
 * llamada que cae a las 9 en Madrid: así aguanta el cambio de hora sin tocar
 * nada. Resume el día anterior completo.
 *
 * Parámetros, para probar a mano:
 *   ?fecha=YYYY-MM-DD  día a resumir (por defecto, ayer en Madrid)
 *   ?forzar=1          envía aunque no sean las 9 y aunque ya se enviara
 *   ?vista=html        devuelve el HTML del correo sin enviar nada
 *
 * Variables: INFORME_ALUMNOS_SECRET, RESEND_API_KEY, INFORME_ALUMNOS_TO
 * (separados por coma) y, opcional, INFORME_ALUMNOS_FROM.
 */
export async function GET(request: Request) {
  const secretos = [process.env.INFORME_ALUMNOS_SECRET, process.env.CRON_SECRET].filter(
    (s): s is string => Boolean(s),
  );
  if (secretos.length === 0) {
    console.error("[informe-alumnos] INFORME_ALUMNOS_SECRET no configurado.");
    return NextResponse.json({ error: "Secreto no configurado en el servidor." }, { status: 500 });
  }
  if (!secretos.some((s) => cronRequestIsAuthorized(request, s))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const forzar = url.searchParams.get("forzar") === "1";
  const vista = url.searchParams.get("vista") === "html";
  const pedida = url.searchParams.get("fecha");
  if (pedida && !/^\d{4}-\d{2}-\d{2}$/.test(pedida)) {
    return NextResponse.json({ error: "fecha debe ser YYYY-MM-DD." }, { status: 400 });
  }
  const fecha = pedida ?? sumarDias(todayInMadrid(), -1);

  if (!forzar && !vista && horaMadrid(new Date()) !== 9) {
    return NextResponse.json({ fecha, omitido: "fuera de hora" });
  }

  const supabase = createServiceClient();

  if (!forzar && !vista) {
    const { data: ya } = await supabase
      .from("informes_enviados")
      .select("enviado_at")
      .eq("tipo", "alumnos_diario")
      .eq("fecha", fecha)
      .maybeSingle();
    if (ya) return NextResponse.json({ fecha, omitido: "ya enviado", enviado_at: ya.enviado_at });
  }

  let informe;
  try {
    informe = await construirInforme(supabase, fecha);
  } catch (e) {
    console.error("[informe-alumnos] datos:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Error leyendo los datos." }, { status: 500 });
  }

  const html = renderHtml(informe);
  if (vista) {
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const to = (process.env.INFORME_ALUMNOS_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) {
    console.error("[informe-alumnos] INFORME_ALUMNOS_TO vacío.");
    return NextResponse.json({ error: "Sin destinatario configurado." }, { status: 500 });
  }

  try {
    const { id } = await enviarCorreo({
      from: process.env.INFORME_ALUMNOS_FROM ?? "NEXUS VNG <contacto@nexusvng.es>",
      to,
      subject: asunto(informe),
      html,
      text: renderTexto(informe),
      idempotencyKey: forzar ? undefined : `informe-alumnos-${fecha}`,
    });

    await supabase
      .from("informes_enviados")
      .upsert({ tipo: "alumnos_diario", fecha, proveedor_id: id, enviado_at: new Date().toISOString() });

    return NextResponse.json({ fecha, enviado: true, id, entraron: informe.kpis.entraron });
  } catch (e) {
    if (e instanceof ResendNoConfigurado) {
      console.error("[informe-alumnos] RESEND_API_KEY no configurada.");
      return NextResponse.json({ error: "RESEND_API_KEY no configurada." }, { status: 500 });
    }
    console.error("[informe-alumnos] envío:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Error enviando el correo." }, { status: 502 });
  }
}
