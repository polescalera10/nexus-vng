import { createClient } from "@/lib/supabase/server";
import type {
  PointEvent,
  PointMilestone,
  PointRule,
  Reward,
  RewardRedemption,
} from "@/types/database";

/**
 * Consultas de gamificación.
 *
 * El saldo NUNCA se guarda: se calcula sumando `point_events` (vista
 * `student_point_balances`). Un contador materializado se desincroniza en
 * cuanto alguien corrige un apunte a mano, y aquí las correcciones son
 * habituales — se pasa lista mal, se cancela un canje.
 *
 * Sin embeds PostgREST (convención del repo): queries planas + composición.
 */

export type StudentPoints = {
  balance: number;
  events: PointEvent[];
};

export type LeaderboardRow = {
  studentId: string;
  fullName: string;
  balance: number;
};

export type RedemptionListItem = RewardRedemption & {
  studentName: string | null;
  rewardName: string | null;
};

export async function getPointRules(onlyActive = false): Promise<PointRule[]> {
  const supabase = await createClient();
  let query = supabase
    .from("point_rules")
    .select("*")
    .order("orden", { ascending: true });
  if (onlyActive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) {
    console.error("[getPointRules]", error.message);
    return [];
  }
  // `icon` es text con CHECK: el estrechamiento de `PointRule` lo refleja.
  return (data ?? []) as PointRule[];
}

/**
 * Una regla concreta por código, o null si no existe o está apagada.
 *
 * Lo usa la pantalla del alumno para decir cuántos puntos da completar el
 * perfil sin escribir el número a mano: quien concede los puntos es el trigger
 * de 0045d, y también los lee de aquí. Si Pol cambia el valor en el panel, la
 * promesa y el premio siguen cuadrando.
 */
export async function getPointRule(code: string): Promise<PointRule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("point_rules")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[getPointRule]", error.message);
    return null;
  }
  return data as PointRule | null;
}

/**
 * ¿Ya se le concedió a este alumno el apunte de una regla concreta?
 *
 * Para no prometer puntos que ya cobró ni darlos por cobrados sin serlo: una
 * ficha que ya estaba completa antes de existir la regla no tiene apunte,
 * porque el trigger se dispara al guardar, no al mirar.
 */
export async function hasPointEventForRule(
  studentId: string,
  code: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("point_events")
    .select("id")
    .eq("student_id", studentId)
    .eq("rule_code", code)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[hasPointEventForRule]", error.message);
    return false;
  }
  return data !== null;
}

export async function getRewards(onlyActive = false): Promise<Reward[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rewards")
    .select("*")
    .order("cost_points", { ascending: true });
  if (onlyActive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) {
    console.error("[getRewards]", error.message);
    return [];
  }
  // `icon` y `redeem_limit` son text con CHECK (0050).
  return (data ?? []) as Reward[];
}

export async function getPointMilestones(): Promise<PointMilestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("point_milestones")
    .select("*")
    .order("points", { ascending: true });

  if (error) {
    console.error("[getPointMilestones]", error.message);
    return [];
  }
  return data ?? [];
}

/** Saldo + movimientos de un alumno, del más reciente al más antiguo. */
export async function getStudentPoints(
  studentId: string,
  limit = 50,
): Promise<StudentPoints> {
  const supabase = await createClient();

  const [{ data: balance }, { data: events, error }] = await Promise.all([
    supabase
      .from("student_point_balances")
      .select("balance")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("point_events")
      .select("*")
      .eq("student_id", studentId)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (error) console.error("[getStudentPoints]", error.message);

  return { balance: balance?.balance ?? 0, events: events ?? [] };
}

/** Saldos de varios alumnos de una vez (listado y ranking). */
export async function getBalancesByStudent(
  studentIds: string[],
): Promise<Map<string, number>> {
  if (studentIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_point_balances")
    .select("student_id, balance")
    .in("student_id", studentIds);

  if (error) {
    console.error("[getBalancesByStudent]", error.message);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.student_id, r.balance]));
}

/** Ranking de alumnos activos por saldo. */
export async function getLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("active", true);

  if (error || !students || students.length === 0) {
    if (error) console.error("[getLeaderboard]", error.message);
    return [];
  }

  const balances = await getBalancesByStudent(students.map((s) => s.id));

  return students
    .map((s) => ({
      studentId: s.id,
      fullName: s.full_name,
      balance: balances.get(s.id) ?? 0,
    }))
    .filter((r) => r.balance > 0)
    .sort((a, b) => b.balance - a.balance || a.fullName.localeCompare(b.fullName, "es"))
    .slice(0, limit);
}

/** Canjes, opcionalmente filtrados por estado. */
export async function getRedemptions(
  status?: RewardRedemption["status"],
  limit = 50,
): Promise<RedemptionListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reward_redemptions")
    .select("*")
    .order("requested_at", { ascending: false })
    .limit(limit);
  if (status) query = query.eq("status", status);

  const { data: redemptions, error } = await query;
  if (error) {
    console.error("[getRedemptions]", error.message);
    return [];
  }
  if (!redemptions || redemptions.length === 0) return [];

  const [{ data: students }, { data: rewards }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name")
      .in("id", [...new Set(redemptions.map((r) => r.student_id))]),
    supabase
      .from("rewards")
      .select("id, name")
      .in("id", [...new Set(redemptions.map((r) => r.reward_id))]),
  ]);

  const studentName = new Map((students ?? []).map((s) => [s.id, s.full_name]));
  const rewardName = new Map((rewards ?? []).map((r) => [r.id, r.name]));

  return redemptions.map((r) => ({
    ...r,
    studentName: studentName.get(r.student_id) ?? null,
    rewardName: rewardName.get(r.reward_id) ?? null,
  }));
}

/** Canjes de un alumno concreto (su propia vista y la ficha del admin). */
export async function getStudentRedemptions(
  studentId: string,
): Promise<RedemptionListItem[]> {
  const supabase = await createClient();

  const { data: redemptions, error } = await supabase
    .from("reward_redemptions")
    .select("*")
    .eq("student_id", studentId)
    .order("requested_at", { ascending: false });

  if (error) {
    console.error("[getStudentRedemptions]", error.message);
    return [];
  }
  if (!redemptions || redemptions.length === 0) return [];

  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, name")
    .in("id", [...new Set(redemptions.map((r) => r.reward_id))]);

  const rewardName = new Map((rewards ?? []).map((r) => [r.id, r.name]));

  return redemptions.map((r) => ({
    ...r,
    studentName: null,
    rewardName: rewardName.get(r.reward_id) ?? null,
  }));
}

/* ── Historial global (admin) ────────────────────────────────────────────── */

export type HistorialFiltros = {
  studentId?: string;
  /** Código de regla, o `canje` para ver solo canjes. */
  regla?: string;
  /** `AAAA-MM`. */
  mes?: string;
  /** Desde 1. */
  pagina: number;
};

export type HistorialFila = PointEvent & {
  studentName: string | null;
  ruleLabel: string | null;
  /** Quién hizo el apunte. En un canje es el propio alumno. */
  createdByName: string | null;
};

export const HISTORIAL_POR_PAGINA = 50;

/** Primer día del mes siguiente a `AAAA-MM`, como `AAAA-MM-DD`. */
function mesSiguiente(mes: string): string {
  const [y = 1970, m = 1] = mes.split("-").map(Number);
  // `m` va de 1 a 12 y Date.UTC cuenta desde 0: pasarle `m` ya es el mes siguiente.
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 10);
}

/**
 * Todos los apuntes del libro mayor, del más reciente al más antiguo, con
 * filtros y paginación. Solo admin: la RLS de `point_events` deja al alumno
 * ver los suyos y nada más, así que con otra sesión esto devuelve lo suyo.
 */
export async function getHistorialPuntos(
  f: HistorialFiltros,
): Promise<{ filas: HistorialFila[]; total: number }> {
  const supabase = await createClient();
  const desde = (f.pagina - 1) * HISTORIAL_POR_PAGINA;

  let query = supabase
    .from("point_events")
    .select("*", { count: "exact" })
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .range(desde, desde + HISTORIAL_POR_PAGINA - 1);

  if (f.studentId) query = query.eq("student_id", f.studentId);
  if (f.regla === "canje") query = query.eq("source", "canje");
  else if (f.regla) query = query.eq("rule_code", f.regla);
  if (f.mes) query = query.gte("occurred_on", `${f.mes}-01`).lt("occurred_on", mesSiguiente(f.mes));

  const { data: events, count, error } = await query;
  if (error) {
    console.error("[getHistorialPuntos]", error.message);
    return { filas: [], total: 0 };
  }
  if (!events || events.length === 0) return { filas: [], total: count ?? 0 };

  const creadores = [...new Set(events.map((e) => e.created_by).filter((id): id is string => !!id))];
  const [{ data: students }, { data: perfiles }, { data: reglas }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name")
      .in("id", [...new Set(events.map((e) => e.student_id))]),
    creadores.length > 0
      ? supabase.from("profiles").select("id, nombre").in("id", creadores)
      : Promise.resolve({ data: [] as { id: string; nombre: string | null }[] }),
    supabase.from("point_rules").select("code, label"),
  ]);

  const studentName = new Map((students ?? []).map((s) => [s.id, s.full_name]));
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const ruleLabel = new Map((reglas ?? []).map((r) => [r.code, r.label]));

  return {
    total: count ?? events.length,
    filas: events.map((e) => ({
      ...e,
      studentName: studentName.get(e.student_id) ?? null,
      ruleLabel: e.rule_code ? (ruleLabel.get(e.rule_code) ?? null) : null,
      createdByName: e.created_by ? (perfilNombre.get(e.created_by) ?? null) : null,
    })),
  };
}

export type ResumenPuntos = {
  /** Puntos positivos apuntados este mes (sin contar devoluciones de canjes). */
  dadosEsteMes: number;
  /** Puntos que han salido en canjes este mes, en positivo. */
  canjeadosEsteMes: number;
  /** Suma de todos los saldos: lo que los alumnos podrían canjear hoy. */
  enCirculacion: number;
};

/** Cifras de cabecera del historial. `mes` en `AAAA-MM` (hora de Madrid). */
export async function getResumenPuntos(mes: string): Promise<ResumenPuntos> {
  const supabase = await createClient();
  const [{ data: delMes, error: e1 }, { data: saldos, error: e2 }] = await Promise.all([
    supabase
      .from("point_events")
      .select("points, source")
      .gte("occurred_on", `${mes}-01`)
      .lt("occurred_on", mesSiguiente(mes)),
    supabase.from("student_point_balances").select("balance"),
  ]);
  if (e1) console.error("[getResumenPuntos]", e1.message);
  if (e2) console.error("[getResumenPuntos]", e2.message);

  let dadosEsteMes = 0;
  let canjeadosEsteMes = 0;
  for (const e of delMes ?? []) {
    if (e.source === "canje") canjeadosEsteMes += -e.points;
    else if (e.points > 0) dadosEsteMes += e.points;
  }
  const enCirculacion = (saldos ?? []).reduce((n, s) => n + (s.balance ?? 0), 0);

  return { dadosEsteMes, canjeadosEsteMes, enCirculacion };
}

/** Alumnos para el filtro del historial (también los de baja: tienen apuntes). */
export async function getStudentOptions(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name")
    .order("full_name", { ascending: true });
  if (error) {
    console.error("[getStudentOptions]", error.message);
    return [];
  }
  return data ?? [];
}
