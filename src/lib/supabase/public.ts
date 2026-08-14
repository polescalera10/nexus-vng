import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para DATOS PÚBLICOS (modalidades, eventos): anon key y
 * SIN cookies.
 *
 * ⚠️ No sustituir por `createClient()` de `./server`: aquel llama a `cookies()`
 * y esa llamada marca la ruta como dinámica, lo que anula el `revalidate` de
 * las páginas públicas. Con el cliente de sesión, la web entera se servía con
 * `cache-control: no-store` y `x-vercel-cache: MISS` en cada visita (TTFB de
 * ~600 ms medido en producción, agosto 2026).
 *
 * Aquí no hay sesión que respetar: estas tablas se leen como anónimo igual, y
 * lo que se renderiza es idéntico para todo el mundo. Las consultas siguen
 * pasando por RLS con la anon key.
 */
export function createPublicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}
