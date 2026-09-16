import { NextResponse } from "next/server";
import { getResenasGoogle } from "@/lib/google-reviews";

/**
 * GET /api/resenas — reseñas de la ficha de Google para el bloque "Dónde
 * estamos" de la home. La pide el navegador cuando el bloque entra en
 * pantalla, así que solo se factura una llamada a Places cuando alguien llega
 * hasta ahí, y la IP del visitante nunca le llega a Google.
 *
 * `no-store` porque las condiciones de Google prohíben guardar el contenido
 * de Places, también en la CDN. Sin reseñas (sin clave, cuota agotada o error),
 * 204 y el bloque no se pinta.
 */
export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function GET() {
  const datos = await getResenasGoogle();
  if (!datos) return new NextResponse(null, { status: 204, headers: SIN_CACHE });
  return NextResponse.json(datos, { headers: SIN_CACHE });
}
