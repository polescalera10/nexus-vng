import type {
  IconoPuntos,
  PointEvent,
  RedeemLimit,
  Reward,
  RewardRedemption,
} from "@/types/database";

/**
 * Lógica pura de la gamificación para pintar el área del alumno: cuándo vuelve
 * a estar disponible un premio, cuántas stories lleva este mes, a qué premio
 * se acerca y el historial por meses.
 *
 * Los topes de verdad los hacen cumplir los triggers de 0050
 * (`reward_redemptions_apply` y `point_events_check_monthly_limit`). Esto es su
 * espejo para avisar ANTES del clic, no una segunda barrera: si los dos no
 * coinciden, manda la base de datos.
 */

export const REDEEM_LIMIT_MESES: Record<RedeemLimit, number> = {
  trimestre: 3,
  anual: 12,
};

export const REDEEM_LIMIT_LABELS: Record<RedeemLimit, string> = {
  trimestre: "1 vez cada 3 meses",
  anual: "1 vez al año",
};

/**
 * Suma meses como Postgres (`timestamptz + interval 'N months'` en UTC): si el
 * día no existe en el mes de llegada, se queda en el último. El 31 de enero
 * más un mes es el 28 de febrero, no el 3 de marzo que daría `setUTCMonth`.
 */
export function sumarMeses(fecha: Date, meses: number): Date {
  const y = fecha.getUTCFullYear();
  const m = fecha.getUTCMonth() + meses;
  const ultimoDia = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const r = new Date(fecha);
  r.setUTCDate(1);
  r.setUTCFullYear(y, m, Math.min(fecha.getUTCDate(), ultimoDia));
  return r;
}

type CanjeMinimo = Pick<RewardRedemption, "reward_id" | "status" | "requested_at">;

/**
 * Fecha a partir de la cual el alumno puede volver a pedir el premio, o null
 * si puede pedirlo ya. Espejo de la ventana móvil del trigger: cuenta desde el
 * último canje NO cancelado de ese mismo premio.
 */
export function proximoCanjeDisponible(
  reward: Pick<Reward, "id" | "redeem_limit">,
  canjes: CanjeMinimo[],
  ahora: Date = new Date(),
): Date | null {
  if (!reward.redeem_limit) return null;

  let ultimo: Date | null = null;
  for (const c of canjes) {
    if (c.reward_id !== reward.id || c.status === "cancelado") continue;
    const d = new Date(c.requested_at);
    if (!ultimo || d > ultimo) ultimo = d;
  }
  if (!ultimo) return null;

  const libre = sumarMeses(ultimo, REDEEM_LIMIT_MESES[reward.redeem_limit]);
  return libre > ahora ? libre : null;
}

/**
 * Apuntes positivos de una regla en un mes natural (`AAAA-MM`, por
 * `occurred_on`). Es lo que cuenta el trigger para el tope de stories y reels.
 */
export function usosDelMes(
  events: Pick<PointEvent, "rule_code" | "points" | "occurred_on">[],
  ruleCode: string,
  mes: string,
): number {
  return events.filter(
    (e) => e.rule_code === ruleCode && e.points > 0 && e.occurred_on.startsWith(mes),
  ).length;
}

/**
 * El premio que toca perseguir: el más barato que todavía no alcanza. null si
 * ya llega a todos (o no hay catálogo).
 */
export function siguienteMeta<T extends Pick<Reward, "cost_points">>(
  rewards: T[],
  balance: number,
): T | null {
  let meta: T | null = null;
  for (const r of rewards) {
    if (r.cost_points <= balance) continue;
    if (!meta || r.cost_points < meta.cost_points) meta = r;
  }
  return meta;
}

/** Porcentaje entero 0-100 de lo que lleva hacia un coste. */
export function progreso(balance: number, coste: number): number {
  if (coste <= 0) return 100;
  return Math.max(0, Math.min(100, Math.floor((balance / coste) * 100)));
}

export type MesDeHistorial<E> = {
  /** `AAAA-MM`. */
  mes: string;
  ganados: number;
  /** En positivo: lo que salió del saldo ese mes (canjes y ajustes a la baja). */
  gastados: number;
  events: E[];
};

/**
 * Agrupa movimientos por mes natural conservando su orden. Espera la lista ya
 * ordenada de más reciente a más antigua, que es como la devuelve la consulta.
 */
export function agruparPorMes<E extends Pick<PointEvent, "points" | "occurred_on">>(
  events: E[],
): MesDeHistorial<E>[] {
  const grupos: MesDeHistorial<E>[] = [];
  for (const e of events) {
    const mes = e.occurred_on.slice(0, 7);
    let g = grupos[grupos.length - 1];
    if (!g || g.mes !== mes) {
      g = { mes, ganados: 0, gastados: 0, events: [] };
      grupos.push(g);
    }
    g.events.push(e);
    if (e.points > 0) g.ganados += e.points;
    else g.gastados += -e.points;
  }
  return grupos;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Icono de un movimiento: el de su regla si viene del catálogo, el del premio
 * si es un canje (`source_id` es el id del canje) y una estrella si es un
 * apunte a mano sin regla.
 */
export function iconoDeMovimiento(
  e: Pick<PointEvent, "rule_code" | "source" | "source_id">,
  iconosRegla: Map<string, IconoPuntos | null>,
  iconosCanje: Map<string, IconoPuntos | null>,
): IconoPuntos {
  if (e.source === "canje" && e.source_id) return iconosCanje.get(e.source_id) ?? "regalo";
  if (e.rule_code) return iconosRegla.get(e.rule_code) ?? "estrella";
  return "estrella";
}

/** `2026-10` → "Octubre 2026". */
export function etiquetaMes(mes: string): string {
  const [y, m] = mes.split("-");
  const nombre = MESES[Number(m) - 1] ?? mes;
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${y}`;
}

/** Fecha corta para "Disponible el…": 5 ene 2027. */
export function formatFechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
}
