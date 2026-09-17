import { Fragment } from "react";

/**
 * Pinta un texto marcando en negrita lo que va entre `**`. Existe para que los
 * textos traducidos (`src/i18n/textos/`) puedan llevar énfasis sin partir cada
 * frase en trozos: el orden de las palabras cambia de un idioma a otro.
 */
export function Negritas({ texto, className }: { texto: string; className?: string }) {
  return (
    <>
      {texto.split("**").map((trozo, i) =>
        i % 2 === 1 ? (
          <strong key={i} className={className}>
            {trozo}
          </strong>
        ) : (
          <Fragment key={i}>{trozo}</Fragment>
        ),
      )}
    </>
  );
}
