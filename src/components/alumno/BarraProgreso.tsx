/**
 * Barra de progreso hacia un premio. Con `role="progressbar"` para que un
 * lector de pantalla diga el porcentaje, y una etiqueta que explica de qué.
 */
export function BarraProgreso({
  valor,
  etiqueta,
  grosor = "md",
}: {
  /** 0-100. */
  valor: number;
  etiqueta: string;
  grosor?: "sm" | "md";
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valor}
      aria-label={etiqueta}
      className={`w-full overflow-hidden rounded-full bg-text-strong/8 ${
        grosor === "sm" ? "h-1.5" : "h-2.5"
      }`}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-neon-lime via-neon-mint to-neon transition-[width] duration-500"
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}
