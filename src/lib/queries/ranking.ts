import { signAvatarUrls } from "@/lib/avatars";
import { createClient } from "@/lib/supabase/server";

/**
 * Ranking de puntos del área del alumno.
 *
 * No lee `students` directamente: el alumno solo alcanza su propia ficha
 * (0026) y abrirla en SELECT le daría de paso el teléfono, el email y las
 * notas del profe de todos sus compañeros. La lectura va por
 * `leaderboard_alumno()` (0044d), SECURITY DEFINER, que devuelve nombre, foto
 * y saldo y nada más — y solo a quien tiene ficha de alumno.
 */

export type RankingRow = {
  studentId: string;
  fullName: string;
  balance: number;
  /** Posición con empates compartidos: 100, 100, 90 → 1.º, 1.º, 3.º. */
  position: number;
  /** URL firmada de la foto, o null si no ha subido ninguna. */
  avatarUrl: string | null;
  isMe: boolean;
};

export type Ranking = {
  rows: RankingRow[];
  /**
   * La fila del alumno que mira, si sale en el ranking. Se devuelve aparte
   * para poder anclarla al pie cuando su posición queda fuera de la vista.
   */
  me: RankingRow | null;
};

export async function getRankingAlumno(studentId: string): Promise<Ranking> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("leaderboard_alumno", { p_limit: 200 });
  if (error) {
    console.error("[getRankingAlumno]", error.message);
    return { rows: [], me: null };
  }

  const filas = data ?? [];
  const urls = await signAvatarUrls(filas.map((f) => f.avatar_path));

  const rows = numerarRanking(filas, studentId, (path) => urls.get(path) ?? null);
  return { rows, me: rows.find((r) => r.isMe) ?? null };
}

/**
 * Numera una lista YA ordenada por saldo descendente.
 *
 * Los empates comparten posición y la siguiente salta: 100, 100, 90 son 1.ª,
 * 1.ª y 3.ª, no 1.ª, 2.ª y 3.ª. Numerar por índice sin más pondría a dos
 * personas con los mismos puntos en puestos distintos, que es exactamente lo
 * que un alumno mira dos veces y viene a preguntar.
 *
 * Separada de la consulta para poder probarla sin Supabase delante.
 */
export function numerarRanking(
  filas: {
    student_id: string;
    full_name: string;
    avatar_path: string | null;
    balance: number;
  }[],
  studentId: string,
  urlDeFoto: (path: string) => string | null,
): RankingRow[] {
  let posicion = 0;
  let anterior: number | null = null;

  return filas.map((f, i) => {
    if (f.balance !== anterior) {
      posicion = i + 1;
      anterior = f.balance;
    }
    return {
      studentId: f.student_id,
      fullName: f.full_name,
      balance: f.balance,
      position: posicion,
      avatarUrl: f.avatar_path ? urlDeFoto(f.avatar_path) : null,
      isMe: f.student_id === studentId,
    };
  });
}
