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
    texto: "Tu próxima clase y el diario de cada grupo, con vídeos.",
    icono: <path d="M4 11.5 12 4l8 7.5M6 10.5V20h12v-9.5M10 20v-5h4v5" />,
  },
  {
    titulo: "Ranking",
    texto: "Los puntos de la escuela y tu puesto.",
    icono: (
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
    ),
  },
  {
    titulo: "Perfil",
    texto: "Tus datos, tu foto y si sales en el ranking.",
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/*
        El fondo cierra al tocarlo, pero queda fuera del árbol de accesibilidad:
        con el aspa ya hay un "cerrar" anunciado, y dos botones con el mismo
        nombre obligan a un lector de pantalla a elegir entre dos cosas que
        hacen lo mismo. `tabIndex={-1}` lo saca del recorrido del tabulador,
        que es lo que exige `aria-hidden` sobre algo enfocable.
      */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => void cerrar()}
        className="absolute inset-0 bg-ink/70"
      />

      {/*
        Hoja inferior en móvil, tarjeta centrada a partir de sm. El alto lo
        limita `max-h-[88dvh]` y el que hace scroll es el cuerpo, no la hoja
        entera: así los botones se quedan siempre a la vista. En un móvil de
        568px de alto, con la hoja entera scrollable, "Completar mi perfil"
        quedaba por debajo del pliegue y había que adivinar que estaba ahí.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-titulo"
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-lg border border-text-strong/10 bg-bg-panel shadow-soft sm:max-h-[85dvh] sm:rounded-lg"
      >
        {/* Asa de la hoja: solo en móvil, donde se arrastra con el pulgar. */}
        <span
          aria-hidden="true"
          className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-text-strong/20 sm:hidden"
        />

        {/*
          El aspa hace de "ahora no". Como segundo botón en el pie ocupaba una
          fila entera y, en un móvil de 568px de alto, el bloque de los puntos
          —lo único que la pantalla pide de verdad— quedaba por debajo.
        */}
        <button
          type="button"
          aria-label="Cerrar la bienvenida"
          onClick={() => void cerrar()}
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-text-strong/8 hover:text-text-strong sm:right-3 sm:top-3"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="size-5"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 sm:px-8 sm:pt-7">
          <div className="pr-10">
            <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Área privada
            </span>
            <h2
              id="onboarding-titulo"
              className="mt-1.5 font-display text-[clamp(24px,6vw,32px)] leading-tight text-text-strong"
            >
              Hola, {nombre}
            </h2>
            <p className="mt-1.5 font-body text-sm text-text-muted">
              Tu área tiene tres sitios.
            </p>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {SECCIONES.map((s) => (
              <li key={s.titulo} className="flex gap-3">
                <Icono>{s.icono}</Icono>
                <span className="min-w-0">
                  <span className="block font-body text-sm font-bold text-text-strong">
                    {s.titulo}
                  </span>
                  <span className="block font-body text-sm text-text-muted">
                    {s.texto}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 mb-4 rounded-sm border border-accent/30 bg-accent/8 p-4">
            <p className="font-body text-sm font-bold text-text-strong">
              {falta
                ? `Completa tu perfil y suma ${puntosPremio} puntos`
                : "Tu perfil ya está completo"}
            </p>
            <p className="mt-1 font-body text-sm text-text-muted">
              {falta
                ? `Nos faltan ${listaPendientes(pendientes)}.`
                : "No te falta nada. Nos vemos en clase."}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-text-strong/10 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-4">
          <Button
            type="button"
            autoFocus
            className="w-full"
            onClick={() => void (falta ? irAlPerfil() : cerrar())}
          >
            {falta ? "Completar mi perfil" : "Entendido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
