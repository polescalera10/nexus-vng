import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getEventoById } from "@/lib/queries/eventos-admin";
import { EventoForm } from "../../EventoForm";

export const metadata = { title: "Editar evento · NEXUS VNG" };

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const evento = await getEventoById(id);
  if (!evento) notFound();

  return (
    <>
      <Link
        href="/area-privada/admin/eventos"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Eventos
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Editar evento
      </h1>

      <div className="mt-8">
        <EventoForm evento={evento} />
      </div>
    </>
  );
}
