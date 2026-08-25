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
  return data ?? [];
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
  return data ?? [];
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
