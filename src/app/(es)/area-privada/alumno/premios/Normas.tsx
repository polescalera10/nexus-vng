/**
 * Normas del programa de puntos, en lenguaje llano y plegadas por defecto: la
 * mayoría no las abre nunca, pero quien pregunta "¿y si me doy de baja?" tiene
 * que encontrar la respuesta sin escribir por WhatsApp.
 *
 * Son las bases del programa (decisiones de Pol del 05-10-2026, MEMORY.md).
 * Si cambia una regla de fondo —topes, caducidad, qué pasa con la baja—, se
 * cambia aquí y en el trigger correspondiente de 0050.
 */
const NORMAS: { titulo: string; texto: string }[] = [
  {
    titulo: "Los puntos no son dinero",
    texto: "No se cambian por efectivo ni se pueden pasar a otra persona.",
  },
  {
    titulo: "Se descuentan al canjear",
    texto:
      "Al pedir un premio, los puntos salen de tu saldo en ese momento. Si por lo que sea anulamos el canje, te los devolvemos enteros.",
  },
  {
    titulo: "Algunos premios tienen tope",
    texto:
      "El descuento y cada mes gratis se pueden pedir una vez cada 3 meses. El año de clases gratis, una vez al año. El resto, sin límite.",
  },
  {
    titulo: "Cuotas",
    texto:
      "El descuento de 20 € y los meses gratis se aplican en tu próxima cuota. Los demás premios te los damos en clase o te escribimos para concretarlos.",
  },
  {
    titulo: "Tus puntos no caducan",
    texto: "Y los conservas si te das de baja y vuelves más adelante.",
  },
  {
    titulo: "Amigos",
    texto:
      "Los puntos por un amigo cuentan cuando se apunta y paga su primera cuota. Venir solo a probar no suma.",
  },
  {
    titulo: "Stories y reels",
    texto:
      "Como máximo 4 stories y 2 reels al mes. Tienen que ser tuyos: los creas y los publicas tú, no vale compartir lo que sube la cuenta de NEXUS. Cuenta pública, etiqueta a @nexusvng (en los reels también puedes invitarnos como colaborador) y márcalo como colaboración. Los puntos los suma tu profe o el equipo al verlo.",
  },
  {
    titulo: "Reseña en Google",
    texto:
      "50 puntos, una sola vez, por dejar tu opinión sobre NEXUS en Google. Puntúa y cuenta lo que de verdad pienses: no premiamos la nota, premiamos que la dejes. Menciona en la reseña que NEXUS te da puntos por escribirla. Los puntos los suma el equipo al verla.",
  },
  {
    titulo: "Cambios",
    texto:
      "Podemos cambiar premios y puntos. Si lo hacemos, lo verás aquí antes, y lo que ya hayas pedido se respeta.",
  },
];

export function Normas() {
  return (
    <details className="group rounded-lg border border-text-strong/10 bg-bg-panel">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-body text-[15px] font-bold text-text-strong [&::-webkit-details-marker]:hidden">
        Normas del programa
        <span
          aria-hidden="true"
          className="font-body text-lg text-text-muted transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <dl className="flex flex-col gap-4 border-t border-text-strong/8 px-5 py-5">
        {NORMAS.map((n) => (
          <div key={n.titulo}>
            <dt className="font-body text-sm font-bold text-text-strong">{n.titulo}</dt>
            <dd className="mt-0.5 font-body text-sm leading-relaxed text-text-muted">
              {n.texto}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
