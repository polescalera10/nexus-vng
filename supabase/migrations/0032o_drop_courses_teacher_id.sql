-- ════════════════════════════════════════════════════════════════════════════
-- 0032o · Retirar `courses.teacher_id`, ya sustituida por `course_teachers`
--
--   ⚠️ PENDIENTE DE APLICAR (30-08-2026). El clasificador de permisos bloqueó
--   el `drop column` desde la sesión de Claude. Hasta que se ejecute, la
--   columna sigue ahí: no la lee nadie, pero es un duplicado que se queda
--   obsoleto en silencio. Aplicar desde el SQL editor de Supabase.
--
--   ORDEN OBLIGATORIO: esta migración va DESPUÉS de desplegar el código que
--   deja de leer la columna (commit 83918a1, desplegado). Al revés, el panel
--   en producción consultaría una columna que ya no existe y se vaciaría.
--
--   El insert de rescate no es decorativo: mientras el código viejo seguía
--   vivo, cada asignación del panel escribía en la columna y no en la tabla
--   nueva. Ya pasó una vez durante el propio cambio.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.course_teachers (course_id, teacher_id)
select c.id, c.teacher_id
from public.courses c
where c.teacher_id is not null
on conflict do nothing;

alter table public.courses drop column if exists teacher_id;
