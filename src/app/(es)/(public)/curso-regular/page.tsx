import { permanentRedirect } from "next/navigation";

/**
 * La landing del curso regular se fusionó con /clases (una sola página de
 * ventas). Mantenemos la ruta como redirección permanente por si algún enlace
 * externo apunta aquí.
 *
 * `permanentRedirect` (308), no `redirect` (307): una redirección temporal no
 * traspasa señales de posicionamiento a /clases y Google mantiene la URL
 * antigua en el índice esperando a que vuelva.
 */
export default function CursoRegularPage() {
  permanentRedirect("/clases");
}
