"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { marcarOnboardingVisto } from "@/lib/actions/perfil";
import { listaPendientes, type CampoPendiente } from "@/lib/perfil-completo";

/**
 * Bienvenida al área del alumno. Se enseña UNA vez, la primera que entra.
 *
 * Una pantalla, no un carrusel de cinco pasos: lo que hay que contar cabe en
 * tres líneas y cada paso extra es gente que cierra sin leer. Todo el peso lo
 * lleva el último bloque, que es el que pide algo concreto — completar el
 * perfil — y dice qué se lleva a cambio.
 *
 * Se marca como vista tanto al aceptar como al cerrar: la bienvenida sale una
 * vez, no hasta que el alumno hace caso. De insistir se encarga el aviso del
 * inicio, que sigue ahí mientras falten datos.
 */

const SECCIONES = [
  {
    titulo: "Inicio",
    texto:
      "Tu próxima clase, tus grupos y el diario de cada uno: lo que se dio y los vídeos.",
    icono: <path d="M4 11.5 12 4l8 7.5M6 10.5V20h12v-9.5M10 20v-5h4v5" />,
  },
  {
    titulo: "Ranking",
    texto:
      "Los puntos de la escuela. Se ganan viniendo a clase, a las fiestas y a los congresos.",
    icono: (
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
    ),
  },
  {
    titulo: "Perfil",
    texto: "Tus datos y tu foto. Aquí decides también si sales en el ranking o no.",
    icono: (
      <>
        <circle cx="12" cy="8" r="3.4" />
        <path d="M4.8 20c.5-3.9 3.4-6.1 7.2-6.1s6.7 2.2 7.2 6.1" />
      </>
    ),
  },
] as const;

function Icono({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 flex-none text-accent"
    >
      {children}
    </svg>
  );
}

export function Onboarding({
  nombre,
  pendientes,
  puntosPremio,
}: {
  /** Solo el nombre de pila. */
  nombre: string;
  pendientes: CampoPendiente[];
  puntosPremio: number;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(true);

  const falta = pendientes.length > 0;

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void cerrar();
    };
    document.addEventListener("keydown", onKey);
    // Sin esto, el fondo se desliza por detrás del diálogo en móvil.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  async function cerrar() {
    // Se cierra al momento y se avisa al servidor después: si la petición
    // falla, lo peor que pasa es que la bienvenida vuelva a salir mañana.
    setAbierto(false);
    await marcarOnboardingVisto();
    router.refresh();
  }

  async function irAlPerfil() {
    setAbierto(false);
    await marcarOnboardingVisto();
    router.push("/area-privada/alumno/perfil");
  }

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar la bienvenida"
        onClick={() => void cerrar()}
        className="absolute inset-0 bg-ink/70"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-titulo"
        className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-text-strong/10 bg-bg-panel p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-soft sm:rounded-lg sm:p-8"
      >
        <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Área privada
        </span>
        <h2
          id="onboarding-titulo"
          className="mt-2 font-display text-[clamp(24px,5vw,34px)] text-text-strong"
        >
          Te damos la bienvenida, {nombre}
        </h2>
        <p className="mt-2 font-body text-sm text-text-muted">
          Esto es tuyo. Tienes tres sitios y poco más que aprender.
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {SECCIONES.map((s) => (
            <li key={s.titulo} className="flex gap-3">
              <Icono>{s.icono}</Icono>
              <span className="min-w-0">
                <span className="block font-body text-sm font-bold text-text-strong">
                  {s.titulo}
                </span>
                <span className="block font-body text-sm text-text-muted">{s.texto}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-sm border border-accent/30 bg-accent/8 p-4">
          <p className="font-body text-sm font-bold text-text-strong">
            {falta
              ? `Completa tu perfil y suma ${puntosPremio} puntos`
              : "Tu perfil ya está completo"}
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            {falta
              ? `Nos faltan ${listaPendientes(pendientes)}. Es un minuto y los puntos entran solos.`
              : "No te falta nada. Nos vemos en clase."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {falta ? (
            <>
              <Button type="button" autoFocus onClick={() => void irAlPerfil()}>
                Completar mi perfil
              </Button>
              <Button type="button" variant="ghost" onClick={() => void cerrar()}>
                Ahora no
              </Button>
            </>
          ) : (
            <Button type="button" autoFocus onClick={() => void cerrar()}>
              Entendido
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
