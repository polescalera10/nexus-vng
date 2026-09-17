import {
  CAMPO_PENDIENTE_LABELS,
  type CampoPendiente,
} from "@/lib/perfil-completo";

/**
 * Qué falta para cobrar los puntos, campo a campo.
 *
 * Antes era una frase suelta ("nos faltan tus apellidos") encima del
 * formulario, y se leía como decoración: alguien podía rellenar el cumpleaños
 * y la foto, guardar, y quedarse convencido de que ya lo tenía todo. Una lista
 * con lo hecho tachado y lo pendiente marcado no deja esa duda.
 *
 * El orden es fijo, no el de `camposPendientes`: la lista no debe reordenarse
 * sola cada vez que el alumno completa uno.
 */

const ORDEN: CampoPendiente[] = ["apellidos", "cumpleanos", "foto"];

function Marca({ hecho }: { hecho: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 flex-none ${hecho ? "text-accent" : "text-text-faint"}`}
    >
      <circle cx="12" cy="12" r="9" />
      {hecho && <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />}
    </svg>
  );
}

export function ChecklistPerfil({
  pendientes,
  premioPerfil,
  yaCobrado,
}: {
  pendientes: CampoPendiente[];
  /** Puntos que da la regla. 0 = regla apagada, no se promete nada. */
  premioPerfil: number;
  yaCobrado: boolean;
}) {
  const completo = pendientes.length === 0;

  // Regla apagada y perfil incompleto: no hay nada que prometer ni que celebrar.
  if (!completo && premioPerfil === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-accent/30 bg-accent/8 p-5">
      {/* Cuando ya cobró no se repite la cifra: la regla puede haber cambiado
          de valor después, y el apunte del libro mayor manda sobre ella. */}
      <p className="font-body text-base font-bold text-text-strong">
        {completo ? "Perfil completo" : `Suma ${premioPerfil} puntos completando tu perfil`}
      </p>
      <p className="mt-1 font-body text-sm text-text-muted">
        {completo
          ? yaCobrado
            ? "Los puntos por completarlo ya están en tu saldo."
            : "No te falta nada."
          : "En cuanto estén los tres, los puntos entran solos."}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {ORDEN.map((campo) => {
          const hecho = !pendientes.includes(campo);
          return (
            <li key={campo} className="flex items-center gap-2.5">
              <Marca hecho={hecho} />
              {/* `first-letter:uppercase` y no un segundo juego de etiquetas:
                  las mismas cadenas se usan dentro de una frase ("nos faltan
                  tus apellidos"), donde la minúscula es la correcta. */}
              <span
                className={`font-body text-sm first-letter:uppercase ${
                  hecho
                    ? "text-text-muted line-through"
                    : "font-semibold text-text-strong"
                }`}
              >
                {CAMPO_PENDIENTE_LABELS[campo]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
