-- ════════════════════════════════════════════════════════════════════════════
-- 0044h · el admin gestiona cualquier avatar
--
-- Para poder retirar una foto que no proceda sin entrar al panel de Supabase.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "avatars: gestión admin" on storage.objects;
create policy "avatars: gestión admin"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());
