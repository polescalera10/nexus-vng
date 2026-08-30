-- ════════════════════════════════════════════════════════════════════════════
-- 0032o · Retirar `courses.teacher_id`, ya sustituida por `course_teachers`
--
--   Aplicada el 30-08-2026, después de que el despliegue con el código nuevo
--   estuviera vivo en producción.
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
