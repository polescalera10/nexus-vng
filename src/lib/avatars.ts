import { createClient } from "@/lib/supabase/server";

/**
 * Fotos de perfil del alumno.
 *
 * El bucket `avatars` (0044e) es PRIVADO, así que no hay URL estable que
 * guardar: en `students.avatar_path` vive la ruta y la URL se firma al pintar.
 * Firmar caduca —una hora— y por eso ninguna de estas URLs debe acabar en una
 * página cacheada; las del área privada son `force-dynamic`, que es donde se
 * usan.
 */

export const AVATAR_BUCKET = "avatars";

/** Una hora: sobra para una visita y no deja el enlace vivo si se reenvía. */
const TTL_SEGUNDOS = 3600;

/**
 * Firma varias rutas de golpe y devuelve un mapa ruta → URL.
 *
 * Las rutas que fallan (fichero borrado a mano, permiso denegado) se caen del
 * mapa en silencio: quien las pida recibe `undefined` y pinta las iniciales.
 * Un avatar roto no debe tumbar el ranking entero.
 */
export async function signAvatarUrls(
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const limpias = [...new Set(paths.filter((p): p is string => !!p))];
  if (limpias.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(limpias, TTL_SEGUNDOS);

  if (error) {
    console.error("[signAvatarUrls]", error.message);
    return new Map();
  }

  const mapa = new Map<string, string>();
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) mapa.set(item.path, item.signedUrl);
  }
  return mapa;
}

/** Atajo para una sola ruta. */
export async function signAvatarUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  return (await signAvatarUrls([path])).get(path) ?? null;
}
