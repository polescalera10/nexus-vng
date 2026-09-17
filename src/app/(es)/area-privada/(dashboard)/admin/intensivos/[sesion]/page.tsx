import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getListaIntensivo } from "@/lib/queries/intensivos";
import { getIntensivoSesion, intensivoTitulo } from "@/content/intensivos";
import { formatDate, todayInMadrid } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ListaIntensivo } from "./ListaIntensivo";

/**
 * Lista de una sesión de intensivo: quién se apuntó por la web, quién vino y
 * quién ha pagado. Es la pantalla que se usa en la puerta de la sala.
 */
export const dynamic = "force-dynamic";

type Params = Promise<{ sesion: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { sesion: slug } = await params;
  const sesion = getIntensivoSesion(slug);
  return { title: sesion ? `${intensivoTitulo(sesion)} · Intensivos` : "Intensivos" };
}

export default async function SesionIntensivoPage({ params }: { params: Params }) {
  await requireRole("admin");

  const { sesion: slug } = await params;
  const sesion = getIntensivoSesion(slug);
  if (!sesion) notFound();

  const asistentes = await getListaIntensivo(sesion.value);
  const esHoy = sesion.fechaIso === todayInMadrid();

  return (
    <>
      <Link
        href="/area-privada/admin/intensivos"
        className="inline-flex min-h-11 items-center gap-1.5 font-body text-sm font-semibold text-text-muted hover:text-text-strong"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
        Intensivos
      </Link>

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[clamp(28px,4.5vw,44px)] text-text-strong">
          {intensivoTitulo(sesion)}
        </h1>
        {esHoy && <Badge variant="success">Hoy</Badge>}
      </div>
      <p className="mt-1 font-body text-sm text-text-muted">
        {formatDate(sesion.fechaIso)} · {sesion.hora} · {sesion.profes}
      </p>

      <div className="mt-6">
        <ListaIntensivo sesion={sesion.value} asistentes={asistentes} />
      </div>
    </>
  );
}
