-- ════════════════════════════════════════════════════════════════════════════
-- 0044e · bucket `avatars`, privado
--
-- Primer bucket del proyecto. Privado (`public = false`) porque una foto de
-- cara es un dato personal: en un bucket público basta con acertar la URL
-- —o que Google la indexe— para verla sin estar dentro del área privada. La
-- app las pinta con URL firmada de una hora (`lib/avatars.ts`).
--
-- 2 MB por fichero y solo tres tipos de imagen. El navegador ya reescala a
-- 512px antes de subir, así que el límite es una red de seguridad contra el
-- que suba por REST: el plan Free son 1 GB en total para todo el proyecto.
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
