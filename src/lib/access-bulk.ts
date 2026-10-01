import type { UserRole } from "@/types/database";

/**
 * Plan del alta de acceso en bloque. Puro: recibe lo que ya se ha leído y
 * decide qué se crea, qué se enlaza y qué se salta, para poder probarlo sin
 * Supabase (`tests/unit/access-bulk.test.ts`). Quien ejecuta el plan es
 * `grantAllStudentsAccess` (lib/actions/access.ts).
 */

export type CandidatoAcceso = { id: string; full_name: string; email: string };

/** Usuario de Auth que ya existe con ese email, y su rol en `profiles`. */
export type UsuarioExistente = { userId: string; role: UserRole | null };

export type PasoAcceso = {
  studentId: string;
  nombre: string;
  email: string;
  /** null = hay que crear el usuario de Auth; con valor, solo enlazar. */
  userId: string | null;
};

export type PlanAcceso = {
  pasos: PasoAcceso[];
  omitidos: { nombre: string; motivo: string }[];
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const normalizarEmail = (email: string) => email.trim().toLowerCase();

export function planificarAcceso(
  candidatos: readonly CandidatoAcceso[],
  existentes: ReadonlyMap<string, UsuarioExistente>,
): PlanAcceso {
  const pasos: PasoAcceso[] = [];
  const omitidos: PlanAcceso["omitidos"] = [];
  const vistos = new Set<string>();

  for (const c of candidatos) {
    const email = normalizarEmail(c.email);

    if (!EMAIL.test(email)) {
      omitidos.push({ nombre: c.full_name, motivo: "email no válido" });
      continue;
    }
    // Un email, una cuenta: dos fichas con el mismo correo chocarían en
    // `students.profile_id` (único). Gana la primera; la otra se revisa a mano.
    if (vistos.has(email)) {
      omitidos.push({ nombre: c.full_name, motivo: "comparte email con otro alumno" });
      continue;
    }
    vistos.add(email);

    const existente = existentes.get(email);
    if (existente && existente.role !== "alumno") {
      // Nunca se toca el rol de una cuenta que ya existe: un admin o un profe
      // que también es alumno acabaría degradado a alumno.
      omitidos.push({
        nombre: c.full_name,
        motivo: "ese email ya es de una cuenta de profe, admin o sin perfil",
      });
      continue;
    }

    pasos.push({
      studentId: c.id,
      nombre: c.full_name,
      email,
      userId: existente?.userId ?? null,
    });
  }

  return { pasos, omitidos };
}
