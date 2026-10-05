import type { createServiceClient } from "@/lib/supabase/server";
import { perfilCompleto } from "@/lib/perfil-completo";
import type { ProfileChangeField } from "@/types/database";
import {
  activosEntre,
  diaMadrid,
  diasEntre,
  diasHastaCumple,
  hitosCruzados,
  horaMinutoMadrid,
  movimientosRanking,
  pct,
  puestos,
  riesgoDeBaja,
  segmentoDeUso,
  sumarDias,
  ventanaDia,
  type Segmento,
  type SesionAlumno,
} from "./calc";

/**
 * Lee la base de datos y compone el informe diario del área de alumnos.
 *
 * Service role: corre desde el cron, sin sesión, y necesita ver a todos los
 * alumnos y `auth.users`. Queries planas y composición en JS (convención del
 * repo). Las tablas que pueden pasar de 1.000 filas se leen paginadas: es el
 * tope de PostgREST y lo corta sin avisar.
 *
 * `fecha` es el día que se resume (ayer, en Madrid). El correo sale el día
 * siguiente, y por eso los cumpleaños y "hoy es lunes" se miran sobre él.
 */

type Service = ReturnType<typeof createServiceClient>;

export type FilaVisita = {
  nombre: string;
  primera: string;
  ultima: string;
  paginas: number;
  secciones: string[];
  nuevo: boolean;
};

export type FilaCambios = { nombre: string; cambios: string[]; perfilCompletado: boolean };
export type FilaPuntos = { nombre: string; puntos: number; concepto: string; saldo: number };
export type FilaRanking = { puesto: number; nombre: string; saldo: number; movimiento: string };
export type FilaRiesgo = {
  nombre: string;
  curso: string;
  faltas: number;
  ultimaAsistencia: string;
  ultimaVisita: string | null;
};
export type FilaVideo = { titulo: string; curso: string; sesion: string; alumnos: number; veces: number };
export type FilaSinResumen = { curso: string; fecha: string; profes: string };
export type FilaCanje = { nombre: string; premio: string; desde: string; dias: number };

export type InformeAlumnos = {
  fecha: string;
  envio: string;
  kpis: { entraron: number; nuevos: number; camposRellenados: number; puntos: number };
  avisos: string[];
  visitas: FilaVisita[];
  cambios: FilaCambios[];
  puntos: FilaPuntos[];
  hitos: { nombre: string; hito: string }[];
  ranking: FilaRanking[];
  segmentos: Record<Segmento, string[]>;
  sinAcceso: number;
  embudo: { etapa: string; alumnos: number; pct: string }[];
  enlacesSinUsar: { nombre: string; pedido: string }[];
  riesgo: FilaRiesgo[];
  videos: FilaVideo[];
  sinResumen: FilaSinResumen[];
  canjes: FilaCanje[];
  cumples: { nombre: string; cuando: string }[];
  semana: null | { activos7: number; activos7Antes: number; activos28: number; conAcceso: number };
};

export const SECCION_LABELS: Record<string, string> = {
  inicio: "Inicio",
  premios: "Premios",
  historial: "Historial",
  ranking: "Ranking",
  perfil: "Perfil",
  clase: "Diario",
};

export const CAMPO_LABELS: Record<ProfileChangeField, [relleno: string, vaciado: string]> = {
  full_name: ["nombre", "borró el nombre"],
  phone: ["teléfono", "borró el teléfono"],
  birthday: ["cumpleaños", "borró el cumpleaños"],
  dance_role: ["rol de baile", "rol de baile"],
  avatar_path: ["foto", "quitó la foto"],
  show_in_leaderboard: ["vuelve al ranking", "sale del ranking"],
};

const PAGINA = 1000;

/** Lee todas las páginas de una consulta (PostgREST corta en 1.000 filas). */
async function todas<T>(
  pagina: (
    desde: number,
    hasta: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await pagina(desde, desde + PAGINA - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGINA) return out;
  }
}

/** Divide una lista de ids para no pasar URLs kilométricas a `.in()`. */
function trozos<T>(lista: T[], n = 150): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n));
  return out;
}

async function porIds<T>(
  ids: string[],
  consulta: (lote: string[]) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const out: T[] = [];
  for (const lote of trozos([...new Set(ids)])) {
    if (lote.length === 0) continue;
    const { data, error } = await consulta(lote);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
  }
  return out;
}

function fechaCorta(fecha: string): string {
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
}

function cuandoCumple(dias: number): string {
  if (dias === 0) return "hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}

export async function construirInforme(
  supabase: Service,
  fecha: string,
): Promise<InformeAlumnos> {
  const envio = sumarDias(fecha, 1);
  const { desde, hasta } = ventanaDia(fecha);
  const inicio28 = sumarDias(fecha, -27);
  const inicioClases = sumarDias(fecha, -41);

  // ── Lecturas ────────────────────────────────────────────────────────────
  const [
    students,
    resumenes,
    dias28,
    cambios,
    eventosPuntos,
    saldos,
    hitosRows,
    canjesRows,
    plays,
    teachers,
    enrollments,
  ] = await Promise.all([
    todas((a, b) =>
      supabase
        .from("students")
        .select("id, full_name, profile_id, birthday, avatar_path, show_in_leaderboard, active")
        .order("id")
        .range(a, b),
    ),
    todas((a, b) =>
      supabase.from("student_activity_summary").select("*").order("student_id").range(a, b),
    ),
    todas((a, b) =>
      supabase
        .from("student_activity_days")
        .select("student_id, day, first_seen_at, last_seen_at, views, sections")
        .gte("day", inicio28)
        .lte("day", fecha)
        .order("day")
        .order("student_id")
        .range(a, b),
    ),
    todas((a, b) =>
      supabase
        .from("student_profile_changes")
        .select("student_id, field, filled, changed_at")
        .gte("changed_at", desde)
        .lt("changed_at", hasta)
        .order("changed_at")
        .range(a, b),
    ),
    // Desde el inicio del día resumido hasta ahora: lo de esta mañana hace
    // falta para reconstruir el saldo con el que acabó el día.
    todas((a, b) =>
      supabase
        .from("point_events")
        .select("id, student_id, points, concept, created_at, rule_code")
        .gte("created_at", desde)
        .order("created_at")
        .range(a, b),
    ),
    todas((a, b) =>
      supabase.from("student_point_balances").select("*").order("student_id").range(a, b),
    ),
    supabase.from("point_milestones").select("label, points").eq("active", true),
    supabase
      .from("reward_redemptions")
      .select("student_id, reward_id, requested_at")
      .eq("status", "solicitado")
      .order("requested_at"),
    supabase
      .from("student_video_plays")
      .select("student_id, session_video_id, plays")
      .eq("played_on", fecha),
    supabase.from("teachers").select("id, full_name, profile_id"),
    todas((a, b) =>
      supabase
        .from("enrollments")
        .select("student_id, course_id, enrolled_at")
        .eq("status", "activa")
        .order("id")
        .range(a, b),
    ),
  ]);

  for (const r of [hitosRows, canjesRows, plays, teachers]) {
    if (r.error) throw new Error(r.error.message);
  }

  const usuarios: {
    id: string;
    email?: string;
    last_sign_in_at?: string | null;
    recovery_sent_at?: string | null;
  }[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    usuarios.push(...data.users);
    if (data.users.length < 1000) break;
  }

  // ── Índices ─────────────────────────────────────────────────────────────
  const alumnoPorId = new Map(students.map((s) => [s.id, s]));
  const nombre = (id: string) => alumnoPorId.get(id)?.full_name ?? "Alumno borrado";
  const usuarioPorId = new Map(usuarios.map((u) => [u.id, u]));
  const resumenPorId = new Map(resumenes.map((r) => [r.student_id, r]));
  const activos = students.filter((s) => s.active);
  const conAcceso = activos.filter((s) => s.profile_id);

  // ── Visitas de ayer ─────────────────────────────────────────────────────
  const deAyer = dias28.filter((d) => d.day === fecha);
  const visitas: FilaVisita[] = deAyer
    .map((d) => ({
      nombre: nombre(d.student_id),
      primera: horaMinutoMadrid(d.first_seen_at),
      ultima: horaMinutoMadrid(d.last_seen_at),
      paginas: d.views,
      secciones: d.sections.map((s) => SECCION_LABELS[s] ?? s),
      nuevo: resumenPorId.get(d.student_id)?.first_day === fecha,
    }))
    .sort((a, b) => a.primera.localeCompare(b.primera));

  // ── Perfiles ────────────────────────────────────────────────────────────
  const completados = new Set(
    eventosPuntos
      .filter(
        (e) => e.rule_code === "perfil_completo" && e.created_at >= desde && e.created_at < hasta,
      )
      .map((e) => e.student_id),
  );
  const cambiosPorAlumno = new Map<string, string[]>();
  for (const c of cambios) {
    const [relleno, vaciado] = CAMPO_LABELS[c.field];
    const texto = c.filled ? relleno : vaciado;
    const lista = cambiosPorAlumno.get(c.student_id) ?? [];
    if (!lista.includes(texto)) lista.push(texto);
    cambiosPorAlumno.set(c.student_id, lista);
  }
  for (const id of completados) if (!cambiosPorAlumno.has(id)) cambiosPorAlumno.set(id, []);
  const filasCambios: FilaCambios[] = [...cambiosPorAlumno.entries()]
    .map(([id, lista]) => ({ nombre: nombre(id), cambios: lista, perfilCompletado: completados.has(id) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const camposRellenados = cambios.filter((c) => c.filled && c.field !== "show_in_leaderboard").length;

  // ── Puntos ──────────────────────────────────────────────────────────────
  // El saldo de hoy es la suma del libro mayor; quitándole lo apuntado después
  // de ayer sale el saldo al cerrar el día, y quitándole también lo de ayer,
  // el de la víspera. Nada se materializa (convención del repo).
  const saldoHoy = new Map(saldos.map((s) => [s.student_id, s.balance]));
  const deltaAyer = new Map<string, number>();
  const deltaHoy = new Map<string, number>();
  for (const e of eventosPuntos) {
    const m = e.created_at < hasta ? deltaAyer : deltaHoy;
    m.set(e.student_id, (m.get(e.student_id) ?? 0) + e.points);
  }
  const saldoFin = new Map<string, number>();
  const saldoInicio = new Map<string, number>();
  for (const s of students) {
    const fin = (saldoHoy.get(s.id) ?? 0) - (deltaHoy.get(s.id) ?? 0);
    saldoFin.set(s.id, fin);
    saldoInicio.set(s.id, fin - (deltaAyer.get(s.id) ?? 0));
  }

  const eventosAyer = eventosPuntos.filter((e) => e.created_at < hasta);
  const puntosFilas: FilaPuntos[] = eventosAyer.map((e) => ({
    nombre: nombre(e.student_id),
    puntos: e.points,
    concepto: e.concept,
    saldo: saldoFin.get(e.student_id) ?? 0,
  }));
  const puntosRepartidos = eventosAyer.reduce((t, e) => t + Math.max(e.points, 0), 0);

  const hitos = (hitosRows.data ?? []) as { label: string; points: number }[];
  const hitosAyer = [...deltaAyer.keys()].flatMap((id) =>
    hitosCruzados(saldoInicio.get(id) ?? 0, saldoFin.get(id) ?? 0, hitos).map((h) => ({
      nombre: nombre(id),
      hito: `${h.label} (${h.points} pts)`,
    })),
  );

  // Ranking tal y como lo ve el alumno: activos y sin haberse salido.
  const enRanking = activos.filter((s) => s.show_in_leaderboard).map((s) => s.id);
  const rankAntes = new Map(enRanking.map((id) => [id, saldoInicio.get(id) ?? 0]));
  const rankAhora = new Map(enRanking.map((id) => [id, saldoFin.get(id) ?? 0]));
  const movs = new Map(movimientosRanking(rankAntes, rankAhora).map((m) => [m.id, m]));
  const puestosAhora = puestos(rankAhora);
  const ranking: FilaRanking[] = [...puestosAhora.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([id, puesto]) => {
      const m = movs.get(id);
      const movimiento = !m
        ? "igual"
        : m.antes === null
          ? "nuevo"
          : m.antes > puesto
            ? `sube ${m.antes - puesto}`
            : `baja ${puesto - m.antes}`;
      return { puesto, nombre: nombre(id), saldo: rankAhora.get(id) ?? 0, movimiento };
    });

  // ── Uso regular ─────────────────────────────────────────────────────────
  const diasPorAlumno = new Map<string, string[]>();
  for (const d of dias28) {
    const l = diasPorAlumno.get(d.student_id) ?? [];
    l.push(d.day);
    diasPorAlumno.set(d.student_id, l);
  }
  const segmentos: Record<Segmento, string[]> = {
    habitual: [],
    ocasional: [],
    dormido: [],
    nunca: [],
  };
  for (const s of conAcceso) {
    const login = usuarioPorId.get(s.profile_id!)?.last_sign_in_at ?? null;
    const seg = segmentoDeUso({
      dias28: diasPorAlumno.get(s.id) ?? [],
      ultimoDia: resumenPorId.get(s.id)?.last_day ?? null,
      ultimoLogin: login,
      fecha,
    });
    segmentos[seg].push(s.full_name);
  }
  for (const l of Object.values(segmentos)) l.sort((a, b) => a.localeCompare(b, "es"));

  // ── Embudo de activación ────────────────────────────────────────────────
  const entraron = conAcceso.filter(
    (s) => resumenPorId.has(s.id) || usuarioPorId.get(s.profile_id!)?.last_sign_in_at,
  );
  const completos = conAcceso.filter((s) => perfilCompleto(s));
  const vuelven = conAcceso.filter((s) => (resumenPorId.get(s.id)?.days ?? 0) >= 2);
  const total = activos.length;
  const embudo = [
    { etapa: "Alumnos activos", alumnos: total },
    { etapa: "Con acceso al área", alumnos: conAcceso.length },
    { etapa: "Han entrado alguna vez", alumnos: entraron.length },
    { etapa: "Perfil completo", alumnos: completos.length },
    { etapa: "Vuelven (2 días o más)", alumnos: vuelven.length },
  ].map((e) => ({ ...e, pct: pct(e.alumnos, total) }));

  // ── Enlaces pedidos y no usados ─────────────────────────────────────────
  const profePorPerfil = new Map(
    (teachers.data ?? []).filter((t) => t.profile_id).map((t) => [t.profile_id!, t.full_name]),
  );
  const alumnoPorPerfil = new Map(
    students.filter((s) => s.profile_id).map((s) => [s.profile_id!, s.full_name]),
  );
  const enlacesSinUsar = usuarios
    .filter((u) => {
      const pedido = u.recovery_sent_at;
      if (!pedido || pedido < desde || pedido >= hasta) return false;
      return !u.last_sign_in_at || u.last_sign_in_at < pedido;
    })
    .map((u) => ({
      nombre:
        alumnoPorPerfil.get(u.id) ??
        (profePorPerfil.has(u.id) ? `${profePorPerfil.get(u.id)} (profe)` : (u.email ?? "Sin email")),
      pedido: horaMinutoMadrid(u.recovery_sent_at!),
    }));

  // ── Clases: riesgo de baja y diario sin resumen ─────────────────────────
  const cursoIds = [...new Set(enrollments.map((e) => e.course_id))];
  const [courses, sesiones, courseTeachers] = await Promise.all([
    porIds(cursoIds, (l) => supabase.from("courses").select("id, name").in("id", l)),
    porIds(cursoIds, (l) =>
      supabase
        .from("class_sessions")
        .select("id, course_id, session_date, status, substitute_teacher_id")
        .in("course_id", l)
        .gte("session_date", inicioClases)
        .lte("session_date", fecha)
        .neq("status", "cancelada"),
    ),
    porIds(cursoIds, (l) =>
      supabase.from("course_teachers").select("course_id, teacher_id").in("course_id", l),
    ),
  ]);
  const sesionIds = sesiones.map((s) => s.id);
  const [asistencia, notas] = await Promise.all([
    porIds(sesionIds, (l) =>
      supabase.from("attendance").select("class_session_id, student_id, present").in("class_session_id", l),
    ),
    porIds(
      sesiones.filter((s) => s.session_date >= sumarDias(fecha, -6)).map((s) => s.id),
      (l) => supabase.from("session_notes").select("class_session_id, resumen").in("class_session_id", l),
    ),
  ]);

  const nombreCurso = new Map(courses.map((c) => [c.id, c.name]));
  const profeNombre = new Map((teachers.data ?? []).map((t) => [t.id, t.full_name]));
  const conLista = new Set(asistencia.map((a) => a.class_session_id));
  const presentes = new Set(
    asistencia.filter((a) => a.present).map((a) => `${a.class_session_id}:${a.student_id}`),
  );

  const riesgo: FilaRiesgo[] = [];
  for (const e of enrollments) {
    const s = alumnoPorId.get(e.student_id);
    if (!s?.active) continue;
    const matricula = diaMadrid(e.enrolled_at);
    const suyas: SesionAlumno[] = sesiones
      .filter((x) => x.course_id === e.course_id && x.session_date >= matricula)
      .map((x) => ({
        fecha: x.session_date,
        listaPasada: conLista.has(x.id),
        presente: presentes.has(`${x.id}:${e.student_id}`),
      }));
    const r = riesgoDeBaja(suyas);
    if (!r) continue;
    riesgo.push({
      nombre: s.full_name,
      curso: nombreCurso.get(e.course_id) ?? "Curso",
      faltas: r.faltasSeguidas,
      ultimaAsistencia: fechaCorta(r.ultimaAsistencia),
      ultimaVisita: resumenPorId.get(s.id)?.last_day
        ? fechaCorta(resumenPorId.get(s.id)!.last_day)
        : null,
    });
  }
  riesgo.sort((a, b) => b.faltas - a.faltas || a.nombre.localeCompare(b.nombre, "es"));

  const conNota = new Set(notas.filter((n) => n.resumen.trim()).map((n) => n.class_session_id));
  const profesDe = (courseId: string, sustituto: string | null) =>
    sustituto
      ? (profeNombre.get(sustituto) ?? "—")
      : courseTeachers
          .filter((ct) => ct.course_id === courseId)
          .map((ct) => profeNombre.get(ct.teacher_id) ?? "—")
          .join(" y ") || "—";
  const sinResumen: FilaSinResumen[] = sesiones
    .filter((x) => x.session_date >= sumarDias(fecha, -6) && !conNota.has(x.id))
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .map((x) => ({
      curso: nombreCurso.get(x.course_id) ?? "Curso",
      fecha: fechaCorta(x.session_date),
      profes: profesDe(x.course_id, x.substitute_teacher_id),
    }));

  // ── Vídeos vistos ayer ──────────────────────────────────────────────────
  const playsRows = plays.data ?? [];
  const videoRows = await porIds(
    playsRows.map((p) => p.session_video_id),
    (l) => supabase.from("session_videos").select("id, titulo, class_session_id").in("id", l),
  );
  const sesionesVideo = await porIds(
    videoRows.map((v) => v.class_session_id),
    (l) => supabase.from("class_sessions").select("id, course_id, session_date").in("id", l),
  );
  const cursosVideo = await porIds(
    sesionesVideo.map((s) => s.course_id).filter((id) => !nombreCurso.has(id)),
    (l) => supabase.from("courses").select("id, name").in("id", l),
  );
  for (const c of cursosVideo) nombreCurso.set(c.id, c.name);
  const sesionPorId = new Map(sesionesVideo.map((s) => [s.id, s]));
  const videos: FilaVideo[] = videoRows
    .map((v) => {
      const deEste = playsRows.filter((p) => p.session_video_id === v.id);
      const ses = sesionPorId.get(v.class_session_id);
      return {
        titulo: v.titulo?.trim() || "Vídeo sin título",
        curso: ses ? (nombreCurso.get(ses.course_id) ?? "Curso") : "—",
        sesion: ses ? fechaCorta(ses.session_date) : "—",
        alumnos: new Set(deEste.map((p) => p.student_id)).size,
        veces: deEste.reduce((t, p) => t + p.plays, 0),
      };
    })
    .sort((a, b) => b.alumnos - a.alumnos || b.veces - a.veces);

  // ── Operativa ───────────────────────────────────────────────────────────
  const rewardIds = (canjesRows.data ?? []).map((c) => c.reward_id);
  const rewards = await porIds(rewardIds, (l) =>
    supabase.from("rewards").select("id, name").in("id", l),
  );
  const premio = new Map(rewards.map((r) => [r.id, r.name]));
  const canjes: FilaCanje[] = (canjesRows.data ?? []).map((c) => {
    const dia = diaMadrid(c.requested_at);
    return {
      nombre: nombre(c.student_id),
      premio: premio.get(c.reward_id) ?? "Premio retirado",
      desde: fechaCorta(dia),
      dias: diasEntre(dia, envio),
    };
  });

  const cumples = activos
    .filter((s) => s.birthday)
    .map((s) => ({ s, n: diasHastaCumple(s.birthday!, envio, 7) }))
    .filter((x): x is { s: (typeof activos)[number]; n: number } => x.n !== null)
    .sort((a, b) => a.n - b.n)
    .map(({ s, n }) => ({ nombre: s.full_name, cuando: cuandoCumple(n) }));

  // ── Semana (solo el correo del lunes) ───────────────────────────────────
  const esLunes = new Date(`${envio}T12:00:00Z`).getUTCDay() === 1;
  const semana = esLunes
    ? {
        activos7: activosEntre(dias28, sumarDias(fecha, -6), fecha),
        activos7Antes: activosEntre(dias28, sumarDias(fecha, -13), sumarDias(fecha, -7)),
        activos28: activosEntre(dias28, inicio28, fecha),
        conAcceso: conAcceso.length,
      }
    : null;

  // ── Lo importante ───────────────────────────────────────────────────────
  const nuevos = visitas.filter((v) => v.nuevo).length;
  const avisos: string[] = [];
  if (visitas.length === 0) avisos.push("Ayer no entró nadie al área de alumnos.");
  if (nuevos > 0)
    avisos.push(`${nuevos} ${nuevos === 1 ? "alumno entró" : "alumnos entraron"} por primera vez.`);
  if (riesgo.length > 0)
    avisos.push(
      `${riesgo.length} ${riesgo.length === 1 ? "alumno lleva" : "alumnos llevan"} 2 clases seguidas o más sin venir.`,
    );
  if (enlacesSinUsar.length > 0)
    avisos.push(
      `${enlacesSinUsar.length} ${enlacesSinUsar.length === 1 ? "persona pidió" : "personas pidieron"} el enlace de acceso y no lo usó. Puede ser el correo o la carpeta de spam.`,
    );
  const canjesViejos = canjes.filter((c) => c.dias >= 3).length;
  if (canjesViejos > 0)
    avisos.push(
      `${canjesViejos} ${canjesViejos === 1 ? "premio lleva" : "premios llevan"} 3 días o más sin entregar.`,
    );
  if (sinResumen.length > 0)
    avisos.push(
      `${sinResumen.length} ${sinResumen.length === 1 ? "clase" : "clases"} de esta semana sin resumen en el diario.`,
    );

  return {
    fecha,
    envio,
    kpis: { entraron: visitas.length, nuevos, camposRellenados, puntos: puntosRepartidos },
    avisos,
    visitas,
    cambios: filasCambios,
    puntos: puntosFilas,
    hitos: hitosAyer,
    ranking,
    segmentos,
    sinAcceso: activos.length - conAcceso.length,
    embudo,
    enlacesSinUsar,
    riesgo,
    videos,
    sinResumen,
    canjes,
    cumples,
    semana,
  };
}
