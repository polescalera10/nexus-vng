import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

/**
 * Rol del usuario de la sesión, o `null` si no hay sesión.
 *
 * A diferencia de requireRole/requireAnyRole NO redirige: está pensada para
 * Server Actions que devuelven un estado de formulario o un `{ ok: false }` al
 * cliente, donde un `redirect()` (que lanza) rompería el flujo de la respuesta.
 * Es una segunda barrera por encima de la RLS, no la barrera principal.
 */
export async function getSessionRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? "alumno";
}

/**
 * ¿La sesión actual es de un admin?
 *
 * Atajo sobre `getSessionRole` para las Server Actions, que devuelven un
 * estado en vez de redirigir. Existía copiado a mano en `courses.ts`,
 * `enrollments.ts` y `whatsapp-events.ts` (tres `isAdmin()` privados idénticos
 * que releían `profiles` por su cuenta): tres sitios donde tocar el día que
 * cambie el modelo de permisos, y tres sitios donde olvidarse de uno.
 */
export async function isAdminSession(): Promise<boolean> {
  return (await getSessionRole()) === "admin";
}

/**
 * Garantiza sesión + rol en una página protegida del área privada.
 * Sin sesión → login. Rol distinto → su propio panel.
 * Devuelve { user, role } cuando el acceso es válido.
 */
export async function requireRole(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/area-privada");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const current = profile?.role ?? "alumno";
  if (current !== role) redirect(`/area-privada/${current}`);

  return { user, role: current };
}

/**
 * Como requireRole, pero acepta varios roles válidos.
 * Sin sesión → login. Rol fuera de la lista → su propio panel.
 * Devuelve { user, role } cuando el acceso es válido.
 */
export async function requireAnyRole(roles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/area-privada");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const current = profile?.role ?? "alumno";
  if (!roles.includes(current)) redirect(`/area-privada/${current}`);

  return { user, role: current };
}
