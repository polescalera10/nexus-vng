-- ════════════════════════════════════════════════════════════════════════════
-- 0044f · quién lee el bucket `avatars`
--
-- Cualquier usuario autenticado. Es exactamente lo que necesita el ranking, y
-- no es un agujero: el bucket sigue cerrado a internet y el nombre del fichero
-- no dice nada que la propia función del ranking no devuelva ya. Acotarlo más
-- obligaría a firmar cada URL con la clave de servicio, que no está en Vercel.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "avatars: lectura de cualquier autenticado" on storage.objects;
create policy "avatars: lectura de cualquier autenticado"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');
