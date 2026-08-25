import { createClient } from "@/lib/supabase/server";
import { LEAD_ORIGEN_LABELS, formatDate } from "@/lib/format";
import type { Lead } from "@/types/database";

/**
 * Consultas del panel de novedades (inicio de admin).
 * Todo pasa por el cliente de servidor (RLS): solo un admin ve estas filas.
 * Sin embeds PostgREST — queries planas + composición en JS (convención del repo).
 */

export type ActivityKind =
  | "lead"
  | "alumno"
  | "inscripcion"
  | "sesion"
  | "whatsapp"
  | "profesor"
  | "curso"
  | "evento";

export type ActivityBadge = {
  label: string;
  variant: "neutral" | "success" | "warning" | "danger";
};

export type ActivityItem = {
  /** `${kind}:${rowId}` — único entre tablas. */
  id: string;
  kind: ActivityKind;
  /** Timestamp ISO por el que se ordena el feed. */
  at: string;
  title: string;
  detail: string | null;
  href: string | null;
  badge: ActivityBadge | null;
};

export type DashboardStats = {
  leadsNuevos: number;
  leads7d: number;
  inscripciones7d: number;
  cuotasPendientes: number;
  alumnosActivos: number;
  whatsappErrores: number;
};

/** Cuántas filas se piden por tabla antes de mezclar y recortar. */
const PER_TABLE = 15;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const since7d = daysAgoIso(7);
  const head = { count: "exact" as const, head: true };

  const [
    leadsNuevos,
    leads7d,
    inscripciones7d,
    cuotasPendientes,
    alumnosActivos,
    whatsappErrores,
  ] = await Promise.all([
    supabase.from("leads").select("id", head).eq("estado", "nuevo"),
    supabase.from("leads").select("id", head).gte("created_at", since7d),
    supabase.from("enrollments").select("id", head).gte("enrolled_at", since7d),
    supabase
      .from("students")
      .select("id", head)
      .eq("active", true)
      .eq("payment_status", "pendiente"),
    supabase.from("students").select("id", head).eq("active", true),
    supabase.from("whatsapp_events").select("id", head).eq("status", "error"),
  ]);

  return {
    leadsNuevos: leadsNuevos.count ?? 0,
    leads7d: leads7d.count ?? 0,
    inscripciones7d: inscripciones7d.count ?? 0,
    cuotasPendientes: cuotasPendientes.count ?? 0,
    alumnosActivos: alumnosActivos.count ?? 0,
    whatsappErrores: whatsappErrores.count ?? 0,
  };
}

/** Leads pendientes de atender, los más recientes primero. */
export async function listLeads(options?: {
  estado?: Lead["estado"] | "todos";
  limit?: number;
}): Promise<Lead[]> {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);

  const estado = options?.estado ?? "todos";
  if (estado !== "todos") query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) {
    console.error("[listLeads] error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Feed unificado de novedades: últimas filas creadas en las tablas que importan
 * (leads, alumnos, inscripciones, sesiones, WhatsApp, profesores, cursos,
 * eventos), mezcladas y ordenadas por fecha descendente.
 */
export async function getActivityFeed(limit = 25): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const desc = { ascending: false } as const;

  const [leads, students, enrollments, sessions, wa, teachers, courses, eventos] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("students")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("enrollments")
        .select("*")
        .order("enrolled_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("class_sessions")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("whatsapp_events")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("teachers")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("courses")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
      supabase
        .from("eventos")
        .select("*")
        .order("created_at", desc)
        .limit(PER_TABLE),
    ]);

  const enrollmentRows = enrollments.data ?? [];
  const sessionRows = sessions.data ?? [];
  const waRows = wa.data ?? [];

  // Una sola pasada de lookups para los nombres que necesita el feed.
  const studentIds = [
    ...new Set(
      [
        ...enrollmentRows.map((e) => e.student_id),
        ...waRows.map((w) => w.student_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  ];
  const courseIds = [
    ...new Set([
      ...enrollmentRows.map((e) => e.course_id),
      ...sessionRows.map((s) => s.course_id),
    ]),
  ];

  const [studentNames, courseNames] = await Promise.all([
    studentIds.length
      ? supabase.from("students").select("id, full_name").in("id", studentIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    courseIds.length
      ? supabase.from("courses").select("id, name").in("id", courseIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const studentById = new Map(
    (studentNames.data ?? []).map((s) => [s.id, s.full_name]),
  );
  const courseById = new Map((courseNames.data ?? []).map((c) => [c.id, c.name]));

  const items: ActivityItem[] = [];

  for (const lead of leads.data ?? []) {
    items.push({
      id: `lead:${lead.id}`,
      kind: "lead",
      at: lead.created_at,
      title: `Lead nuevo · ${lead.nombre}`,
      detail:
        [
          LEAD_ORIGEN_LABELS[lead.origen] ?? lead.origen,
          lead.modalidad_interes,
          lead.telefono,
        ]
          .filter(Boolean)
          .join(" · ") || null,
      href: "/area-privada/admin/leads",
      badge:
        lead.estado === "nuevo"
          ? { label: "Sin atender", variant: "warning" }
          : null,
    });
  }

  for (const student of students.data ?? []) {
    items.push({
      id: `alumno:${student.id}`,
      kind: "alumno",
      at: student.created_at,
      title: `Alta de alumno · ${student.full_name}`,
      detail: student.email ?? student.phone,
      href: `/area-privada/admin/alumnos/${student.id}`,
      badge:
        student.payment_status === "pendiente"
          ? { label: "Cuota pendiente", variant: "danger" }
          : null,
    });
  }

  for (const enrollment of enrollmentRows) {
    const student = studentById.get(enrollment.student_id) ?? "Alumno";
    const course = courseById.get(enrollment.course_id) ?? "curso";
    items.push({
      id: `inscripcion:${enrollment.id}`,
      kind: "inscripcion",
      at: enrollment.enrolled_at,
      title: `Inscripción · ${student}`,
      detail: course,
      href: `/area-privada/admin/cursos/${enrollment.course_id}`,
      badge:
        enrollment.status === "lista_espera"
          ? { label: "Lista de espera", variant: "warning" }
          : enrollment.status === "baja"
            ? { label: "Baja", variant: "danger" }
            : null,
    });
  }

  for (const session of sessionRows) {
    const course = courseById.get(session.course_id) ?? "curso";
    items.push({
      id: `sesion:${session.id}`,
      kind: "sesion",
      at: session.created_at,
      title: `Sesión · ${course}`,
      detail: formatDate(session.session_date),
      href: `/area-privada/admin/cursos/${session.course_id}`,
      badge:
        session.status === "cancelada"
          ? { label: "Cancelada", variant: "danger" }
          : null,
    });
  }

  for (const event of waRows) {
    const student = event.student_id
      ? (studentById.get(event.student_id) ?? "Alumno")
      : "Difusión";
    items.push({
      id: `whatsapp:${event.id}`,
      kind: "whatsapp",
      at: event.created_at,
      title: `WhatsApp · ${event.type.replace(/_/g, " ")}`,
      detail: student,
      href: "/area-privada/admin/whatsapp",
      badge:
        event.status === "error"
          ? { label: "Error", variant: "danger" }
          : event.status === "pendiente"
            ? { label: "Pendiente", variant: "warning" }
            : null,
    });
  }

  for (const teacher of teachers.data ?? []) {
    items.push({
      id: `profesor:${teacher.id}`,
      kind: "profesor",
      at: teacher.created_at,
      title: `Profesor · ${teacher.full_name}`,
      detail: teacher.disciplines.join(", ") || null,
      href: "/area-privada/admin/profesores",
      badge: null,
    });
  }

  for (const course of courses.data ?? []) {
    items.push({
      id: `curso:${course.id}`,
      kind: "curso",
      at: course.created_at,
      title: `Curso · ${course.name}`,
      detail: null,
      href: `/area-privada/admin/cursos/${course.id}`,
      badge: course.active ? null : { label: "Inactivo", variant: "neutral" },
    });
  }

  for (const evento of eventos.data ?? []) {
    items.push({
      id: `evento:${evento.id}`,
      kind: "evento",
      at: evento.created_at,
      title: `Evento · ${evento.titulo}`,
      detail: formatDate(evento.fecha.slice(0, 10)),
      href: null,
      badge: evento.publico ? null : { label: "Borrador", variant: "neutral" },
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

/** Un lead por id (ficha de conversión). */
export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getLeadById] error:", error.message);
    return null;
  }
  return data;
}
