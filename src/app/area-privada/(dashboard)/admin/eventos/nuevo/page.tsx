import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { EventoForm } from "../EventoForm";

export const metadata = { title: "Nuevo evento · NEXUS VNG" };

export default async function NuevoEventoPage() {
  await requireRole("admin");

  return (
    <>
      <Link
        href="/area-privada/admin/eventos"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Eventos
      </Link>
      <h1 className="mt-3 font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
        Nuevo evento
      </h1>
      <p className="mt-2 max-w-[52ch] font-body text-base text-text-muted">
        Se guarda como borrador salvo que marques “Publicado en la web”.
      </p>

      <div className="mt-8">
        <EventoForm />
      </div>
    </>
  );
}
