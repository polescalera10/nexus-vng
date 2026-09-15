-- 0046c · Los helpers de RLS dejan de ser invocables por `anon`.
--
-- Eran `SECURITY DEFINER` con EXECUTE para PUBLIC/anon, así que cualquiera con
-- la clave publicable podía llamarlos por `/rest/v1/rpc/…`. Con la sesión
-- anónima devuelven false/vacío, pero no tienen por qué estar expuestos.
-- Requiere 0046a: ninguna política aplicable a `anon` los llama ya.
--
-- `authenticated` CONSERVA el EXECUTE: las políticas se evalúan con el rol de
-- quien consulta, y sin él la RLS de todo el panel fallaría con
-- "permission denied for function". Por eso el lint 0029 de Supabase seguirá
-- listándolos: es esperado. Todos dependen de `auth.uid()`, así que un usuario
-- solo puede preguntar por sí mismo.
--
-- `founding_spots_taken()` sigue abierta a anon a propósito: la usa el contador
-- público de plazas fundadoras.

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public."current_role"() from public, anon;
revoke execute on function public.can_teach_session(uuid) from public, anon;
revoke execute on function public.current_student_course_ids() from public, anon;
revoke execute on function public.current_student_teacher_ids() from public, anon;
revoke execute on function public.current_teacher_course_ids() from public, anon;
revoke execute on function public.student_can_see_session(uuid) from public, anon;
revoke execute on function public.teaches_or_substitutes_student(uuid) from public, anon;
revoke execute on function public.teaches_student(uuid) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public."current_role"() to authenticated;
grant execute on function public.can_teach_session(uuid) to authenticated;
grant execute on function public.current_student_course_ids() to authenticated;
grant execute on function public.current_student_teacher_ids() to authenticated;
grant execute on function public.current_teacher_course_ids() to authenticated;
grant execute on function public.student_can_see_session(uuid) to authenticated;
grant execute on function public.teaches_or_substitutes_student(uuid) to authenticated;
grant execute on function public.teaches_student(uuid) to authenticated;
