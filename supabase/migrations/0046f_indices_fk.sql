-- 0046f · Índices para las claves foráneas que no tenían.
--
-- Sin índice, borrar o actualizar la fila referenciada (un profesor, una
-- recompensa, un lead) obliga a recorrer entera la tabla que la apunta.
-- Lint 0001_unindexed_foreign_keys. Tablas pequeñas: sin CONCURRENTLY.

create index if not exists attendance_recorded_by_idx on public.attendance (recorded_by);
create index if not exists class_sessions_substitute_teacher_id_idx on public.class_sessions (substitute_teacher_id);
create index if not exists contenido_created_by_idx on public.contenido (created_by);
create index if not exists courses_nivel_id_idx on public.courses (nivel_id);
create index if not exists eventos_created_by_idx on public.eventos (created_by);
create index if not exists intensivo_registros_lead_id_idx on public.intensivo_registros (lead_id);
create index if not exists point_events_created_by_idx on public.point_events (created_by);
create index if not exists point_events_rule_code_idx on public.point_events (rule_code);
create index if not exists reward_redemptions_resolved_by_idx on public.reward_redemptions (resolved_by);
create index if not exists reward_redemptions_reward_id_idx on public.reward_redemptions (reward_id);
create index if not exists session_notes_created_by_idx on public.session_notes (created_by);
create index if not exists session_videos_created_by_idx on public.session_videos (created_by);
