import { NextResponse } from "next/server";
import { avatarPermitido } from "@/lib/google-reviews";

/**
 * GET /api/resenas/avatar?u=<url> — foto del autor de una reseña de Google.
 *
 * Google exige mostrarla junto a la reseña. Si la pidiera el navegador, la IP
 * de cada visitante de la home le llegaría a Google sin consentimiento (RGPD),
 * así que la pide nuestro servidor y la reenvía tal cual, sin guardarla
 * (`no-store`: las condiciones de Places tampoco permiten cachearla).
 *
 * Solo acepta imágenes de `*.googleusercontent.com` (`avatarPermitido`): sin
 * esa lista blanca, esta ruta sería un reenviador abierto a cualquier URL.
 */
export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024;

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("u");
  if (!url || !avatarPermitido(url)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      // Una redirección podría llevar fuera de la lista blanca.
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    const tipo = res.headers.get("content-type") ?? "";
    if (!res.ok || !tipo.startsWith("image/")) {
      return new NextResponse(null, { status: 404 });
    }
    const cuerpo = await res.arrayBuffer();
    if (cuerpo.byteLength > MAX_BYTES) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(cuerpo, {
      headers: {
        "Content-Type": tipo,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
