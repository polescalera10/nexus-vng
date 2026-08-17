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
export type EventoTipo = "fiesta" | "masterclass" | "social" | "otro";

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
  | "broadcast";
export type WhatsappEventStatus = "pendiente" | "enviado" | "error";

// ── Intensivos (migración 0024) ──────────────────────────────────────────────
export type MetodoPago = "efectivo" | "bizum" | "tarjeta" | "otro";

type Timestamps = { created_at: string; updated_at: string };

export type Modalidad = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
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
  created_at: string;
}

export type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  tipo: EventoTipo;
  publico: boolean;
  slug: string | null;
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
  created_at: string;
  updated_at: string;
}

export type Teacher = {
  id: string;
  profile_id: string | null;
  full_name: string;
  phone: string | null;
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
  teacher_id: string | null;
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
        Insert: Omit<Modalidad, "id" | keyof Timestamps> & Partial<Modalidad>;
        Update: Partial<Modalidad>;
        Relationships: [];
      };
      niveles: {
        Row: Nivel;
        Insert: Omit<Nivel, "id"> & Partial<Nivel>;
        Update: Partial<Nivel>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "estado" | "created_at" | "intereses"> & Partial<Lead>;
        Update: Partial<Lead>;
        Relationships: [];
      };
      eventos: {
        Row: Evento;
        Insert: Omit<Evento, "id" | keyof Timestamps> & Partial<Evento>;
        Update: Partial<Evento>;
        Relationships: [];
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | keyof Timestamps> & Partial<Student>;
        Update: Partial<Student>;
        Relationships: [];
      };
      teachers: {
        Row: Teacher;
        Insert: Omit<Teacher, "id" | keyof Timestamps> & Partial<Teacher>;
        Update: Partial<Teacher>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | keyof Timestamps> & Partial<Course>;
        Update: Partial<Course>;
        Relationships: [];
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, "id" | "enrolled_at"> & Partial<Enrollment>;
        Update: Partial<Enrollment>;
        Relationships: [];
      };
      class_sessions: {
        Row: ClassSession;
        Insert: Omit<ClassSession, "id" | keyof Timestamps> & Partial<ClassSession>;
        Update: Partial<ClassSession>;
        Relationships: [];
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "recorded_at"> & Partial<Attendance>;
        Update: Partial<Attendance>;
        Relationships: [];
      };
      whatsapp_events: {
        Row: WhatsappEvent;
        Insert: Omit<WhatsappEvent, "id" | "created_at"> & Partial<WhatsappEvent>;
        Update: Partial<WhatsappEvent>;
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
    Views: Record<never, never>;
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
    };
  };
}
