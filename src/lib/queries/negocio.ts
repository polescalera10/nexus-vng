import { createClient } from "@/lib/supabase/server";
import type {
  AlumnoNegocioInput,
  CursoNegocioInput,
} from "@/lib/dashboard/negocio";

/**
 * Queries del Dashboard de negocio.
 *
 * Vía `createClient()` (anon key + sesión), así que respetan RLS: sin sesión de
 * admin no devuelven nada. Consultas planas y composición en JS — los tipos de
 * `Database` están escritos a mano con `Relationships: []` y un embed de
 * PostgREST rompería la inferencia (convención del proyecto).
 *
 * Solo curso regular: los leads de `intensivos` se excluyen a propósito
 * (Pol, 31-08-2026). Agosto fue un producto aparte y ya terminó.
 */

export type EmbudoFila = {
  origen: string;
  estado: string;
  total: number;
};

export type DatosNegocio = {
  cursos: CursoNegocioInput[];
  alumnos: AlumnoNegocioInput[];
  embudo: EmbudoFila[];
};

/** Origen de lead que NO cuenta como curso regular. */
const ORIGENES_FUERA = ["intensivos"];

export async function getDatosNegocio(): Promise<DatosNegocio> {
  const supabase = await createClient();

  const [cursosRes, modalidadesRes, nivelesRes, vinculosRes, teachersRes, studentsRes, enrollmentsRes, leadsRes] =
    await Promise.all([
      supabase
        .from("courses")
        .select(
          "id, name, weekday, start_time, capacity_leaders, capacity_followers, modalidad_id, nivel_id",
        )
        .eq("active", true)
        .order("weekday")
        .order("start_time"),
      supabase.from("modalidades").select("id, nombre, categoria"),
      supabase.from("niveles").select("id, nombre"),
      supabase.from("course_teachers").select("course_id, teacher_id"),
      supabase.from("teachers").select("id, full_name"),
      supabase
        .from("students")
        .select("id, full_name, dance_role, is_founding_member, payment_status")
        .eq("active", true)
        .order("full_name"),
      supabase.from("enrollments").select("student_id, course_id, status"),
      supabase.from("leads").select("origen, estado"),
    ]);

  const modalidades = new Map(
    (modalidadesRes.data ?? []).map((m) => [m.id, { nombre: m.nombre, categoria: m.categoria }]),
  );
  const niveles = new Map((nivelesRes.data ?? []).map((n) => [n.id, n.nombre]));
  const teachers = new Map((teachersRes.data ?? []).map((t) => [t.id, t.full_name]));

  const profesPorCurso = new Map<string, { id: string; nombre: string }[]>();
  for (const v of vinculosRes.data ?? []) {
    const nombre = teachers.get(v.teacher_id);
    if (!nombre) continue;
    const lista = profesPorCurso.get(v.course_id) ?? [];
    lista.push({ id: v.teacher_id, nombre });
    profesPorCurso.set(v.course_id, lista);
  }

  const cursos: CursoNegocioInput[] = (cursosRes.data ?? []).map((c) => {
    const modalidad = c.modalidad_id ? modalidades.get(c.modalidad_id) : undefined;
    return {
      id: c.id,
      name: c.name,
      weekday: c.weekday,
      // `start_time` llega como "20:30:00": al panel solo le interesa hora y minuto.
      hora: (c.start_time ?? "").slice(0, 5),
      capacityLeaders: c.capacity_leaders ?? 0,
      capacityFollowers: c.capacity_followers ?? 0,
      modalidad: modalidad?.nombre ?? null,
      categoria: modalidad?.categoria ?? null,
      nivel: c.nivel_id ? (niveles.get(c.nivel_id) ?? null) : null,
      profesores: (profesPorCurso.get(c.id) ?? []).sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es"),
      ),
    };
  });

  const activasPorAlumno = new Map<string, string[]>();
  const esperaPorAlumno = new Map<string, number>();
  for (const e of enrollmentsRes.data ?? []) {
    if (e.status === "activa") {
      const lista = activasPorAlumno.get(e.student_id) ?? [];
      lista.push(e.course_id);
      activasPorAlumno.set(e.student_id, lista);
    } else if (e.status === "lista_espera") {
      esperaPorAlumno.set(e.student_id, (esperaPorAlumno.get(e.student_id) ?? 0) + 1);
    }
  }

  const alumnos: AlumnoNegocioInput[] = (studentsRes.data ?? []).map((s) => ({
    id: s.id,
    nombre: s.full_name,
    rol: s.dance_role === "leader" ? "leader" : "follower",
    fundador: s.is_founding_member,
    cuotaPendiente: s.payment_status === "pendiente",
    cursoIds: activasPorAlumno.get(s.id) ?? [],
    enEspera: esperaPorAlumno.get(s.id) ?? 0,
  }));

  const conteo = new Map<string, EmbudoFila>();
  for (const l of leadsRes.data ?? []) {
    if (ORIGENES_FUERA.includes(l.origen)) continue;
    const clave = `${l.origen}|${l.estado}`;
    const fila = conteo.get(clave) ?? { origen: l.origen, estado: l.estado, total: 0 };
    fila.total += 1;
    conteo.set(clave, fila);
  }
  const embudo = [...conteo.values()].sort((a, b) => b.total - a.total);

  return { cursos, alumnos, embudo };
}
