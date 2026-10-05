/**
 * Tipos de dominio de la base de datos.
 *
 * La forma de las tablas YA NO se escribe a mano: sale de
 * `database.generated.ts`, que genera `supabase gen types` a partir del esquema
 * (`pnpm db:types` contra la BD local levantada con `pnpm db:reset`). La CI lo
 * regenera sobre las migraciones y falla si no coincide con el del repo, así que
 * una columna nueva, renombrada o que cambia de nulabilidad aparece en `tsc` en
 * vez de en producción.
 *
 * Aquí solo quedan:
 *   · los nombres de dominio que usa la app (`Student`, `Lead`…), derivados;
 *   · los ESTRECHAMIENTOS que el generador no puede deducir, cada uno con su
 *     motivo. Son la única parte escrita a mano: si una migración toca una de
 *     esas columnas, hay que revisar su estrechamiento.
 */
import type {
  Database as GeneratedDatabase,
  Enums,
  Json,
  Tables,
} from "./database.generated";

export type { Json };

// ── Enums de Postgres (espejo directo) ──────────────────────────────────────
export type UserRole = Enums<"user_role">;
export type LeadEstado = Enums<"lead_estado">;
export type InscripcionEstado = Enums<"inscripcion_estado">;
export type ContenidoTipo = Enums<"contenido_tipo">;
export type EventoTipo = Enums<"evento_tipo">;
export type DanceRole = Enums<"dance_role">;
export type PaymentStatus = Enums<"payment_status">;
export type CycleType = Enums<"cycle_type">;
export type EnrollmentRole = Enums<"enrollment_role">;
export type SessionStatus = Enums<"session_status">;
export type WhatsappEventType = Enums<"whatsapp_event_type">;
export type WhatsappEventStatus = Enums<"whatsapp_event_status">;
export type PointSource = Enums<"point_source">;
export type RedemptionStatus = Enums<"redemption_status">;

// ── Estrechamientos (lo que el generador no ve) ─────────────────────────────

/**
 * `modalidades.categoria` es `text` con `check (categoria in ('clase','compania'))`
 * (0025). Postgres no expone un CHECK como enum, así que se genera `string`.
 */
export type ModalidadCategoria = "clase" | "compania";

/** `intensivo_registros.metodo_pago`: `text` con CHECK (0024). */
export type MetodoPago = "efectivo" | "bizum" | "tarjeta" | "otro";

/** `teachers.weekly_availability` es `jsonb`: bloques por día, {"mon":[{"start":"18:00","end":"21:00"}]}. */
export type WeeklyAvailability = Record<string, { start: string; end: string }[]>;

/** Sustituye columnas de T por las de R (mismo nombre, tipo más preciso). */
type Narrow<T, R> = Omit<T, keyof R> & R;

// ── Filas de dominio ────────────────────────────────────────────────────────
export type Modalidad = Narrow<Tables<"modalidades">, { categoria: ModalidadCategoria }>;
export type Nivel = Tables<"niveles">;
export type Profile = Tables<"profiles">;
export type Lead = Tables<"leads">;
export type Evento = Tables<"eventos">;
export type Student = Tables<"students">;
export type Teacher = Narrow<Tables<"teachers">, { weekly_availability: WeeklyAvailability }>;
export type Course = Tables<"courses">;
/** Profes titulares de un curso (N:N, 0032a). El sustituto puntual vive en `class_sessions`. */
export type CourseTeacher = Tables<"course_teachers">;
export type Enrollment = Tables<"enrollments">;
export type ClassSession = Tables<"class_sessions">;
export type Attendance = Tables<"attendance">;
/** Qué se dio en una sesión. Uno por sesión (0043a). */
export type SessionNote = Tables<"session_notes">;
/** Vídeo de una sesión. Siempre URL externa: ver `lib/video.ts`. */
export type SessionVideo = Tables<"session_videos">;
export type Contenido = Tables<"contenido">;
/** `payload` es `jsonb` libre: cada tipo de evento lleva sus claves (docs/whatsapp-contracts.md). */
export type WhatsappEvent = Narrow<Tables<"whatsapp_events">, { payload: Record<string, unknown> }>;
/** Asistencia y cobro de un intensivo (0024). `lead_id` nulo = alta en puerta. */
export type IntensivoRegistro = Narrow<
  Tables<"intensivo_registros">,
  { metodo_pago: MetodoPago | null }
>;
/**
 * `point_rules.icon` y `rewards.icon`: `text` con la misma lista cerrada en un
 * CHECK (0050). Si la migración amplía la lista, ampliarla aquí y en
 * `components/alumno/IconoPuntos.tsx`.
 */
export type IconoPuntos =
  | "masterclass"
  | "congreso"
  | "amigo"
  | "perfil"
  | "story"
  | "reel"
  | "estrella"
  | "invitado"
  | "descuento"
  | "entrada"
  | "mes"
  | "hoodie"
  | "pase"
  | "corona"
  | "regalo";

/** `rewards.redeem_limit`: `text` con CHECK (0050). Ventana móvil de 3 o 12 meses. */
export type RedeemLimit = "trimestre" | "anual";

export type PointRule = Narrow<Tables<"point_rules">, { icon: IconoPuntos | null }>;
/** Apunte del libro mayor de puntos. El saldo NUNCA se materializa. */
export type PointEvent = Tables<"point_events">;
export type Reward = Narrow<
  Tables<"rewards">,
  { icon: IconoPuntos | null; redeem_limit: RedeemLimit | null }
>;
export type RewardRedemption = Tables<"reward_redemptions">;
export type PointMilestone = Tables<"point_milestones">;

/**
 * Vista `student_point_balances`. El generador marca nullable toda columna de
 * una vista; esta agrupa `point_events` por `student_id` (NOT NULL) y suma, así
 * que ninguna fila trae nulls.
 */
export type StudentPointBalance = { student_id: string; balance: number };

/**
 * Campos de `student_profile_changes.field` (0049a). La columna es `text` con
 * CHECK, que el generador no ve. Si la migración amplía la lista, ampliarla aquí.
 */
export type ProfileChangeField =
  | "full_name"
  | "phone"
  | "birthday"
  | "dance_role"
  | "avatar_path"
  | "show_in_leaderboard";

export type StudentProfileChange = Narrow<
  Tables<"student_profile_changes">,
  { field: ProfileChangeField }
>;

/** Visita del alumno a su área: una fila por alumno y día (0049a). */
export type StudentActivityDay = Tables<"student_activity_days">;

/**
 * Vista `student_activity_summary` (0049a). Como la de saldos, agrupa por una
 * columna NOT NULL con `min`/`max`/`count` sobre columnas NOT NULL: ninguna
 * fila trae nulls aunque el generador los marque.
 */
export type StudentActivitySummary = {
  student_id: string;
  first_day: string;
  last_day: string;
  days: number;
};

/**
 * Fila de `leaderboard_alumno()` (0044d). El generador no deduce nulabilidad en
 * el RETURNS TABLE de una función SQL y da `avatar_path: string`, pero sale de
 * `students.avatar_path`, que es nullable.
 */
export type LeaderboardRow = {
  student_id: string;
  full_name: string;
  avatar_path: string | null;
  balance: number;
};

// ── Database para los clientes de Supabase ──────────────────────────────────
type Generated = GeneratedDatabase["public"];
type WithRow<T, R> = Omit<T, "Row"> & { Row: R };

/**
 * El esquema generado con los estrechamientos de arriba aplicados, para que las
 * consultas devuelvan ya los tipos de dominio.
 */
export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<Generated, "Tables" | "Views" | "Functions"> & {
    Tables: Omit<
      Generated["Tables"],
      | "modalidades"
      | "teachers"
      | "whatsapp_events"
      | "intensivo_registros"
      | "student_profile_changes"
    > & {
      modalidades: WithRow<Generated["Tables"]["modalidades"], Modalidad>;
      teachers: WithRow<Generated["Tables"]["teachers"], Teacher>;
      whatsapp_events: WithRow<Generated["Tables"]["whatsapp_events"], WhatsappEvent>;
      intensivo_registros: WithRow<Generated["Tables"]["intensivo_registros"], IntensivoRegistro>;
      student_profile_changes: WithRow<
        Generated["Tables"]["student_profile_changes"],
        StudentProfileChange
      >;
    };
    Views: Omit<Generated["Views"], "student_point_balances" | "student_activity_summary"> & {
      student_activity_summary: WithRow<
        Generated["Views"]["student_activity_summary"],
        StudentActivitySummary
      >;
      student_point_balances: WithRow<
        Generated["Views"]["student_point_balances"],
        StudentPointBalance
      >;
    };
    Functions: Omit<Generated["Functions"], "leaderboard_alumno"> & {
      leaderboard_alumno: Omit<Generated["Functions"]["leaderboard_alumno"], "Returns"> & {
        Returns: LeaderboardRow[];
      };
    };
  };
};
