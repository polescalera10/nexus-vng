/**
 * Tipos de la base de datos.
 * Escritos a mano para reflejar las migraciones de /supabase/migrations.
 * Regenerar contra la BD real con:  pnpm db:types
 */

export type UserRole = "alumno" | "profesor" | "admin";
export type LeadEstado =
  | "nuevo"
  | "contactado"
  | "prueba_agendada"
  | "convertido"
  | "descartado";
export type InscripcionEstado = "activa" | "pausada" | "baja" | "lista_espera";
export type ContenidoTipo = "video" | "comentario" | "fiesta" | "evento";
export type EventoTipo =
  | "fiesta"
  | "masterclass"
  | "social"
  | "otro"
  | "congreso"
  | "taller"
  | "intensivo";
/** Clase abierta vs grupo de compañía (migración 0025). */
export type ModalidadCategoria = "clase" | "compania";

// ── Panel interno (migraciones 0011-0018) ────────────────────────────────────
export type DanceRole = "leader" | "follower" | "both";
export type PaymentStatus = "al_dia" | "pendiente";
export type CycleType = "curso" | "suelta";
export type EnrollmentRole = "leader" | "follower";
export type SessionStatus = "programada" | "impartida" | "cancelada";
export type WhatsappEventType =
  | "recordatorio_clase"
  | "cuota_pendiente"
  | "alumno_inactivo"
  | "confirmacion_lista_espera"
  | "broadcast"
  | "cumpleanos"
  | "puntos_hito"
  | "premio_canjeado";
export type WhatsappEventStatus = "pendiente" | "enviado" | "error";

// ── Intensivos (migración 0024) ──────────────────────────────────────────────
export type MetodoPago = "efectivo" | "bizum" | "tarjeta" | "otro";

// ── Gamificación (migración 0027) ────────────────────────────────────────────
export type PointSource = "asistencia" | "evento" | "manual" | "canje" | "ajuste";
export type RedemptionStatus = "solicitado" | "entregado" | "cancelado";

export type Modalidad = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  categoria: ModalidadCategoria;
  created_at: string;
  updated_at: string;
}

export type Nivel = {
  id: string;
  nombre: string;
  orden: number;
}

export type Profile = {
  id: string;
  role: UserRole;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Lead = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  modalidad_interes: string | null;
  /** Etiquetas de interés (estilos/sesiones) para marketing segmentado. */
  intereses: string[] | null;
  origen: string;
  mensaje: string | null;
  estado: LeadEstado;
  /** Ficha de alumno creada al convertir este lead (migración 0029). */
  student_id: string | null;
  converted_at: string | null;
  created_at: string;
}

export type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  /** Fin del evento; null = sin hora de cierre publicada. */
  fecha_fin: string | null;
  tipo: EventoTipo;
  publico: boolean;
  /** NOT NULL desde 0028: es la URL /eventos/[slug]. */
  slug: string;
  ubicacion: string | null;
  /** Numeric(8,2): PostgREST lo devuelve como número. */
  precio: number | null;
  cover_image_url: string | null;
  capacidad: number | null;
  cta_url: string | null;
  /** Puntos de gamificación por asistir. 0 = no puntúa. */
  puntos: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type Student = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  dance_role: DanceRole;
  nivel_id: string | null;
  partner_id: string | null;
  payment_status: PaymentStatus;
  is_founding_member: boolean;
  notes: string | null;
  active: boolean;
  /** Usuario de Auth con el que entra al área privada. Null = sin login. */
  profile_id: string | null;
  birthday: string | null;
  created_at: string;
  updated_at: string;
}

export type Teacher = {
  id: string;
  profile_id: string | null;
  full_name: string;
  phone: string | null;
  /** Identidad de acceso al panel (magic link). */
  email: string | null;
  disciplines: string[];
  /** Bloques por día: {"mon":[{"start":"18:00","end":"21:00"}],...} */
  weekly_availability: Record<string, { start: string; end: string }[]>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type Course = {
  id: string;
  name: string;
  modalidad_id: string;
  nivel_id: string | null;
  /** 1=Lun … 7=Dom (convención heredada de `clases`). */
  weekday: number;
  start_time: string;
  duration_min: number;
  capacity_leaders: number;
  capacity_followers: number;
  cycle_type: CycleType;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Profes titulares de un curso (N:N). Sustituye a `courses.teacher_id`, que
 * solo admitía uno: el cartel tiene clases a dos (Bachata 2, Martina y Davide).
 * El sustituto puntual no vive aquí, sigue en `class_sessions`.
 */
export type CourseTeacher = {
  course_id: string;
  teacher_id: string;
  created_at: string;
}

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  role_in_course: EnrollmentRole;
  status: InscripcionEstado;
  enrolled_at: string;
}

export type ClassSession = {
  id: string;
  course_id: string;
  session_date: string;
  status: SessionStatus;
  substitute_teacher_id: string | null;
  created_at: string;
  updated_at: string;
}

export type Attendance = {
  id: string;
  class_session_id: string;
  student_id: string;
  present: boolean;
  recorded_by: string | null;
  recorded_at: string;
}

export type WhatsappEvent = {
  id: string;
  student_id: string | null;
  type: WhatsappEventType;
  payload: Record<string, unknown>;
  status: WhatsappEventStatus;
  sent_at: string | null;
  created_at: string;
}

/**
 * Marca de asistencia y cobro de una sesión de intensivo (migración 0024).
 * `lead_id` nulo = alta en puerta (no venía del formulario de la web).
 */
export type IntensivoRegistro = {
  id: string;
  /** Slug de la sesión en `src/content/intensivos.ts`. */
  sesion: string;
  lead_id: string | null;
  nombre: string;
  telefono: string | null;
  email: string | null;
  asistio: boolean;
  pagado: boolean;
  /** Numeric(6,2): PostgREST lo devuelve como número. */
  importe: number;
  metodo_pago: MetodoPago | null;
  nota: string | null;
  created_at: string;
  updated_at: string;
}

// ── Gamificación (migración 0027) ────────────────────────────────────────────

/** Motivo catalogado que otorga puntos. Editable desde el panel. */
export type PointRule = {
  id: string;
  code: string;
  label: string;
  points: number;
  source: PointSource;
  active: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

/**
 * Apunte del libro mayor de puntos. El saldo NUNCA se materializa: es la suma
 * de estas filas (`student_point_balances`).
 */
export type PointEvent = {
  id: string;
  student_id: string;
  points: number;
  concept: string;
  source: PointSource;
  rule_code: string | null;
  /** Fila de origen (sesión, evento, canje…). Sin FK: depende de `source`. */
  source_id: string | null;
  occurred_on: string;
  created_by: string | null;
  created_at: string;
}

export type Reward = {
  id: string;
  name: string;
  description: string | null;
  cost_points: number;
  /** null = sin límite de unidades. */
  stock: number | null;
  active: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export type RewardRedemption = {
  id: string;
  student_id: string;
  reward_id: string;
  /** Coste congelado en el momento del canje. */
  cost_points: number;
  status: RedemptionStatus;
  notes: string | null;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export type PointMilestone = {
  id: string;
  points: number;
  label: string;
  active: boolean;
  created_at: string;
}

/** Vista `student_point_balances` (security_invoker). */
export type StudentPointBalance = {
  student_id: string;
  balance: number;
}

/**
 * Forma mínima que esperan los clientes `@supabase/ssr`.
 * Solo se tipan a fondo las tablas que la web pública/scaffold consultan;
 * el resto quedan permisivas hasta generar los tipos contra la BD real.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      modalidades: {
        Row: Modalidad;
        Insert: Pick<Modalidad, "slug" | "nombre"> & Partial<Modalidad>;
        Update: Partial<Modalidad>;
        Relationships: [];
      };
      niveles: {
        Row: Nivel;
        Insert: Pick<Nivel, "nombre"> & Partial<Nivel>;
        Update: Partial<Nivel>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        // Solo `nombre`, `telefono` y `origen` son NOT NULL sin default.
        Insert: Pick<Lead, "nombre" | "telefono" | "origen"> & Partial<Lead>;
        Update: Partial<Lead>;
        Relationships: [];
      };
      eventos: {
        Row: Evento;
        Insert: Pick<Evento, "titulo" | "fecha" | "slug"> & Partial<Evento>;
        Update: Partial<Evento>;
        Relationships: [];
      };
      students: {
        Row: Student;
        Insert: Pick<Student, "full_name" | "phone" | "dance_role"> & Partial<Student>;
        Update: Partial<Student>;
        Relationships: [];
      };
      teachers: {
        Row: Teacher;
        Insert: Pick<Teacher, "full_name"> & Partial<Teacher>;
        Update: Partial<Teacher>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Pick<Course, "modalidad_id" | "weekday" | "start_time"> & Partial<Course>;
        Update: Partial<Course>;
        Relationships: [];
      };
      course_teachers: {
        Row: CourseTeacher;
        Insert: Pick<CourseTeacher, "course_id" | "teacher_id"> & Partial<CourseTeacher>;
        Update: Partial<CourseTeacher>;
        Relationships: [];
      };
      enrollments: {
        Row: Enrollment;
        Insert: Pick<Enrollment, "student_id" | "course_id" | "role_in_course"> &
          Partial<Enrollment>;
        Update: Partial<Enrollment>;
        Relationships: [];
      };
      class_sessions: {
        Row: ClassSession;
        Insert: Pick<ClassSession, "course_id" | "session_date"> & Partial<ClassSession>;
        Update: Partial<ClassSession>;
        Relationships: [];
      };
      attendance: {
        Row: Attendance;
        Insert: Pick<Attendance, "class_session_id" | "student_id" | "present"> &
          Partial<Attendance>;
        Update: Partial<Attendance>;
        Relationships: [];
      };
      whatsapp_events: {
        Row: WhatsappEvent;
        Insert: Pick<WhatsappEvent, "type"> & Partial<WhatsappEvent>;
        Update: Partial<WhatsappEvent>;
        Relationships: [];
      };
      point_rules: {
        Row: PointRule;
        Insert: Pick<PointRule, "code" | "label" | "points"> & Partial<PointRule>;
        Update: Partial<PointRule>;
        Relationships: [];
      };
      point_events: {
        Row: PointEvent;
        Insert: Pick<PointEvent, "student_id" | "points" | "concept"> &
          Partial<PointEvent>;
        Update: Partial<PointEvent>;
        Relationships: [];
      };
      rewards: {
        Row: Reward;
        Insert: Pick<Reward, "name" | "cost_points"> & Partial<Reward>;
        Update: Partial<Reward>;
        Relationships: [];
      };
      reward_redemptions: {
        Row: RewardRedemption;
        Insert: Pick<RewardRedemption, "student_id" | "reward_id" | "cost_points"> &
          Partial<RewardRedemption>;
        Update: Partial<RewardRedemption>;
        Relationships: [];
      };
      point_milestones: {
        Row: PointMilestone;
        Insert: Pick<PointMilestone, "points" | "label"> & Partial<PointMilestone>;
        Update: Partial<PointMilestone>;
        Relationships: [];
      };
      intensivo_registros: {
        Row: IntensivoRegistro;
        // Casi todas las columnas tienen default en Postgres (migración 0024):
        // obligatorias solo `sesion` y `nombre`.
        Insert: Pick<IntensivoRegistro, "sesion" | "nombre"> &
          Partial<IntensivoRegistro>;
        Update: Partial<IntensivoRegistro>;
        Relationships: [];
      };
    };
    Views: {
      student_point_balances: {
        Row: StudentPointBalance;
        Relationships: [];
      };
    };
    Functions: Record<never, never>;
    CompositeTypes: Record<never, never>;
    Enums: {
      user_role: UserRole;
      lead_estado: LeadEstado;
      inscripcion_estado: InscripcionEstado;
      contenido_tipo: ContenidoTipo;
      evento_tipo: EventoTipo;
      dance_role: DanceRole;
      payment_status: PaymentStatus;
      cycle_type: CycleType;
      enrollment_role: EnrollmentRole;
      session_status: SessionStatus;
      whatsapp_event_type: WhatsappEventType;
      whatsapp_event_status: WhatsappEventStatus;
      point_source: PointSource;
      redemption_status: RedemptionStatus;
    };
  };
}
