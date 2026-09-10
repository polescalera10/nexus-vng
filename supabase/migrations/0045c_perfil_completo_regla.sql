-- ════════════════════════════════════════════════════════════════════════════
-- 0045c · la regla "perfil completo" y qué significa completo
--
-- Los puntos NO van escritos en el código: salen de `point_rules`, como el
-- resto, para que Pol pueda subirlos o apagar la regla desde el panel sin
-- desplegar. Diez es el valor de salida, el mismo que asistir a una clase.
--
-- "Completo" son las tres cosas que de verdad faltan en las fichas reales:
-- el nombre lleva apellido, hay cumpleaños y hay foto. Teléfono y rol de baile
-- no cuentan porque son NOT NULL desde el alta: premiarlos sería regalar los
-- puntos por no hacer nada.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.perfil_alumno_completo(
  p_full_name text,
  p_birthday date,
  p_avatar_path text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  -- `\S+\s+\S{2,}` = al menos dos palabras y la segunda de dos letras o más.
  -- Sin el `{2,}`, "Ana R" contaría como nombre y apellido.
  select p_birthday is not null
     and p_avatar_path is not null
     and btrim(coalesce(p_full_name, '')) ~ '\S+\s+\S{2,}';
$$;

revoke all on function public.perfil_alumno_completo(text, date, text) from public, anon;
grant execute on function public.perfil_alumno_completo(text, date, text) to authenticated;

insert into public.point_rules (code, label, points, source, active, orden)
values ('perfil_completo', 'Completar el perfil', 10, 'manual', true, 7)
on conflict (code) do nothing;

-- La garantía real de que nadie cobra dos veces. El `if not exists` del
-- trigger evita el ruido; este índice evita la carrera entre dos updates
-- simultáneos, que es lo que de verdad duplicaría el apunte.
create unique index if not exists point_events_perfil_completo_unique
  on public.point_events (student_id)
  where rule_code = 'perfil_completo';
