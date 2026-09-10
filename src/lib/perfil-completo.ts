import type { Student } from "@/types/database";

/**
 * Qué le falta al alumno para tener el perfil completo.
 *
 * ESTE FICHERO ES EL ESPEJO DE `public.perfil_alumno_completo()` (migración
 * 0045c). Quien manda es Postgres —es el trigger el que concede los puntos, no
 * la app—, así que si algún día cambia la regla hay que cambiarla en los dos
 * sitios o la pantalla dirá "te faltan 0 datos" y los puntos no llegarán.
 * `tests/unit/perfil-completo.test.ts` documenta los casos límite.
 *
 * Solo entran los tres campos que de verdad faltan en las fichas reales. El
 * teléfono y el rol de baile son NOT NULL desde el alta: pedirlos sería
 * regalar los puntos.
 */

export type CampoPendiente = "apellidos" | "cumpleanos" | "foto";

export const CAMPO_PENDIENTE_LABELS: Record<CampoPendiente, string> = {
  apellidos: "tus apellidos",
  cumpleanos: "tu cumpleaños",
  foto: "tu foto",
};

/** Al menos dos palabras, y la segunda de dos letras o más ("Ana R" no vale). */
const NOMBRE_CON_APELLIDO = /\S+\s+\S{2,}/;

type FichaMinima = Pick<Student, "full_name" | "birthday" | "avatar_path">;

export function camposPendientes(student: FichaMinima): CampoPendiente[] {
  const faltan: CampoPendiente[] = [];
  if (!NOMBRE_CON_APELLIDO.test((student.full_name ?? "").trim())) faltan.push("apellidos");
  if (!student.birthday) faltan.push("cumpleanos");
  if (!student.avatar_path) faltan.push("foto");
  return faltan;
}

export function perfilCompleto(student: FichaMinima): boolean {
  return camposPendientes(student).length === 0;
}

/** "tus apellidos y tu foto" · "tus apellidos, tu cumpleaños y tu foto". */
export function listaPendientes(campos: CampoPendiente[]): string {
  const partes = campos.map((c) => CAMPO_PENDIENTE_LABELS[c]);
  if (partes.length <= 1) return partes[0] ?? "";
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}
