#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
# Reconstruye la BD local de Supabase DESDE CERO con todas las migraciones.
#
# ⚠️ Por qué no vale `supabase db reset` / `supabase db start` a secas:
# el CLI solo acepta ficheros `<número>_nombre.sql` y se SALTA en silencio los
# que llevan letra (0031a, 0032a…0032o, 0038a…, 0043a…, 0044a…, 0045a…,
# 0046a…): 44 de 84 a 15-09-2026. Solo avisa con un "Skipping migration" en
# el log. Con él, la BD local se quedaba sin `course_teachers`, sin el diario,
# sin avatares y sin el endurecimiento de RLS — y fallaba en 0034.
# No se renombran los ficheros porque "0046c" y compañía están citados en
# código, docs y MEMORY.md, y así se llaman también en producción.
#
# Qué hace:
#   1. Levanta Postgres con el config.toml del repo, pero desde un directorio
#      temporal SIN migraciones ni seed (para que el CLI no aplique nada).
#   2. Aplica supabase/migrations/*.sql con psql en orden lexicográfico (C),
#      que es el orden real: 0031_ < 0031a_ < 0031b_ < 0032a_ …
#   3. Aplica supabase/seed.sql.
#
# BORRA la BD local (stop --no-backup). Lo usan `pnpm db:reset` y la CI.
# Requisitos: Docker, Supabase CLI y psql.
# ════════════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

for bin in supabase psql docker; do
  command -v "$bin" >/dev/null || { echo "Falta '$bin' en el PATH." >&2; exit 1; }
done

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/supabase"
cp "$ROOT/supabase/config.toml" "$WORK/supabase/config.toml"

echo "· Parando la BD local anterior (se borra)…"
supabase stop --no-backup --workdir "$WORK" >/dev/null 2>&1 || true

echo "· Levantando Postgres sin migraciones…"
supabase db start --workdir "$WORK"

echo "· Aplicando migraciones…"
count=0
while IFS= read -r f; do
  echo "  → $(basename "$f")"
  psql "$DB_URL" -q -v ON_ERROR_STOP=1 -f "$f" >/dev/null
  count=$((count + 1))
done < <(printf '%s\n' "$ROOT"/supabase/migrations/*.sql | LC_ALL=C sort)
echo "  $count migraciones aplicadas."

if [ -f "$ROOT/supabase/seed.sql" ]; then
  echo "· Aplicando seed…"
  psql "$DB_URL" -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/seed.sql" >/dev/null
fi

echo "✓ BD local lista en $DB_URL"
