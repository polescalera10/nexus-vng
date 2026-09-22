export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          class_session_id: string
          id: string
          present: boolean
          recorded_at: string
          recorded_by: string | null
          student_id: string
        }
        Insert: {
          class_session_id: string
          id?: string
          present?: boolean
          recorded_at?: string
          recorded_by?: string | null
          student_id: string
        }
        Update: {
          class_session_id?: string
          id?: string
          present?: boolean
          recorded_at?: string
          recorded_by?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          course_id: string
          created_at: string
          id: string
          session_date: string
          status: Database["public"]["Enums"]["session_status"]
          substitute_teacher_id: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          session_date: string
          status?: Database["public"]["Enums"]["session_status"]
          substitute_teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          session_date?: string
          status?: Database["public"]["Enums"]["session_status"]
          substitute_teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      contenido: {
        Row: {
          body: string | null
          clase_id: string | null
          created_at: string
          created_by: string | null
          id: string
          modalidad_id: string | null
          tipo: Database["public"]["Enums"]["contenido_tipo"]
          titulo: string
          updated_at: string
          url: string | null
        }
        Insert: {
          body?: string | null
          clase_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          modalidad_id?: string | null
          tipo: Database["public"]["Enums"]["contenido_tipo"]
          titulo: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          body?: string | null
          clase_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          modalidad_id?: string | null
          tipo?: Database["public"]["Enums"]["contenido_tipo"]
          titulo?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contenido_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenido_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenido_modalidad_id_fkey"
            columns: ["modalidad_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      course_teachers: {
        Row: {
          course_id: string
          created_at: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_teachers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean
          capacity_followers: number
          capacity_leaders: number
          created_at: string
          cycle_type: Database["public"]["Enums"]["cycle_type"]
          duration_min: number
          end_date: string | null
          id: string
          modalidad_id: string
          name: string
          nivel_id: string | null
          start_date: string | null
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          capacity_followers?: number
          capacity_leaders?: number
          created_at?: string
          cycle_type?: Database["public"]["Enums"]["cycle_type"]
          duration_min?: number
          end_date?: string | null
          id?: string
          modalidad_id: string
          name?: string
          nivel_id?: string | null
          start_date?: string | null
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          capacity_followers?: number
          capacity_leaders?: number
          created_at?: string
          cycle_type?: Database["public"]["Enums"]["cycle_type"]
          duration_min?: number
          end_date?: string | null
          id?: string
          modalidad_id?: string
          name?: string
          nivel_id?: string | null
          start_date?: string | null
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "clases_modalidad_id_fkey"
            columns: ["modalidad_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          role_in_course: Database["public"]["Enums"]["enrollment_role"]
          status: Database["public"]["Enums"]["inscripcion_estado"]
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          role_in_course: Database["public"]["Enums"]["enrollment_role"]
          status?: Database["public"]["Enums"]["inscripcion_estado"]
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          role_in_course?: Database["public"]["Enums"]["enrollment_role"]
          status?: Database["public"]["Enums"]["inscripcion_estado"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_clase_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          capacidad: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          cta_url: string | null
          descripcion: string | null
          fecha: string
          fecha_fin: string | null
          id: string
          precio: number | null
          publico: boolean
          puntos: number
          slug: string
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          capacidad?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          descripcion?: string | null
          fecha: string
          fecha_fin?: string | null
          id?: string
          precio?: number | null
          publico?: boolean
          puntos?: number
          slug: string
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          capacidad?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          descripcion?: string | null
          fecha?: string
          fecha_fin?: string | null
          id?: string
          precio?: number | null
          publico?: boolean
          puntos?: number
          slug?: string
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titulo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intensivo_registros: {
        Row: {
          asistio: boolean
          created_at: string
          email: string | null
          id: string
          importe: number
          lead_id: string | null
          metodo_pago: string | null
          nombre: string
          nota: string | null
          pagado: boolean
          sesion: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          asistio?: boolean
          created_at?: string
          email?: string | null
          id?: string
          importe?: number
          lead_id?: string | null
          metodo_pago?: string | null
          nombre: string
          nota?: string | null
          pagado?: boolean
          sesion: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          asistio?: boolean
          created_at?: string
          email?: string | null
          id?: string
          importe?: number
          lead_id?: string | null
          metodo_pago?: string | null
          nombre?: string
          nota?: string | null
          pagado?: boolean
          sesion?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intensivo_registros_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          converted_at: string | null
          created_at: string
          email: string | null
          estado: Database["public"]["Enums"]["lead_estado"]
          evento_slug: string | null
          id: string
          intereses: string[] | null
          mensaje: string | null
          modalidad_interes: string | null
          nombre: string
          origen: string
          student_id: string | null
          telefono: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          email?: string | null
          estado?: Database["public"]["Enums"]["lead_estado"]
          evento_slug?: string | null
          id?: string
          intereses?: string[] | null
          mensaje?: string | null
          modalidad_interes?: string | null
          nombre: string
          origen: string
          student_id?: string | null
          telefono: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          email?: string | null
          estado?: Database["public"]["Enums"]["lead_estado"]
          evento_slug?: string | null
          id?: string
          intereses?: string[] | null
          mensaje?: string | null
          modalidad_interes?: string | null
          nombre?: string
          origen?: string
          student_id?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      modalidades: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          slug: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          slug: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      niveles: {
        Row: {
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      point_events: {
        Row: {
          concept: string
          created_at: string
          created_by: string | null
          id: string
          occurred_on: string
          points: number
          rule_code: string | null
          source: Database["public"]["Enums"]["point_source"]
          source_id: string | null
          student_id: string
        }
        Insert: {
          concept: string
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string
          points: number
          rule_code?: string | null
          source?: Database["public"]["Enums"]["point_source"]
          source_id?: string | null
          student_id: string
        }
        Update: {
          concept?: string
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string
          points?: number
          rule_code?: string | null
          source?: Database["public"]["Enums"]["point_source"]
          source_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_events_rule_code_fkey"
            columns: ["rule_code"]
            isOneToOne: false
            referencedRelation: "point_rules"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "point_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      point_milestones: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          points: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          points: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          points?: number
        }
        Relationships: []
      }
      point_rules: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          label: string
          orden: number
          points: number
          source: Database["public"]["Enums"]["point_source"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          label: string
          orden?: number
          points: number
          source?: Database["public"]["Enums"]["point_source"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          label?: string
          orden?: number
          points?: number
          source?: Database["public"]["Enums"]["point_source"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nombre: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefono: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nombre?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nombre?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          cost_points: number
          id: string
          notes: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          student_id: string
        }
        Insert: {
          cost_points: number
          id?: string
          notes?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          student_id: string
        }
        Update: {
          cost_points?: number
          id?: string
          notes?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cost_points: number
          created_at: string
          description: string | null
          id: string
          name: string
          orden: number
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cost_points: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          orden?: number
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cost_points?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          orden?: number
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          class_session_id: string
          created_at: string
          created_by: string | null
          id: string
          resumen: string
          updated_at: string
        }
        Insert: {
          class_session_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          resumen: string
          updated_at?: string
        }
        Update: {
          class_session_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          resumen?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: true
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_videos: {
        Row: {
          class_session_id: string
          created_at: string
          created_by: string | null
          id: string
          orden: number
          titulo: string | null
          updated_at: string
          url: string
        }
        Insert: {
          class_session_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          orden?: number
          titulo?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          class_session_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          orden?: number
          titulo?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_videos_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          avatar_path: string | null
          birthday: string | null
          created_at: string
          dance_role: Database["public"]["Enums"]["dance_role"]
          email: string | null
          full_name: string
          id: string
          is_founding_member: boolean
          nivel_id: string | null
          notes: string | null
          onboarding_seen_at: string | null
          partner_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          profile_id: string | null
          show_in_leaderboard: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_path?: string | null
          birthday?: string | null
          created_at?: string
          dance_role: Database["public"]["Enums"]["dance_role"]
          email?: string | null
          full_name: string
          id?: string
          is_founding_member?: boolean
          nivel_id?: string | null
          notes?: string | null
          onboarding_seen_at?: string | null
          partner_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          profile_id?: string | null
          show_in_leaderboard?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_path?: string | null
          birthday?: string | null
          created_at?: string
          dance_role?: Database["public"]["Enums"]["dance_role"]
          email?: string | null
          full_name?: string
          id?: string
          is_founding_member?: boolean
          nivel_id?: string | null
          notes?: string | null
          onboarding_seen_at?: string | null
          partner_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          profile_id?: string | null
          show_in_leaderboard?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          active: boolean
          created_at: string
          disciplines: string[]
          email: string | null
          full_name: string
          id: string
          phone: string | null
          profile_id: string | null
          updated_at: string
          weekly_availability: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          disciplines?: string[]
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          weekly_availability?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          disciplines?: string[]
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          weekly_availability?: Json
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_event_status"]
          student_id: string | null
          type: Database["public"]["Enums"]["whatsapp_event_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_event_status"]
          student_id?: string | null
          type: Database["public"]["Enums"]["whatsapp_event_type"]
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_event_status"]
          student_id?: string | null
          type?: Database["public"]["Enums"]["whatsapp_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      student_point_balances: {
        Row: {
          balance: number | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_drop_in_session: {
        Args: { p_session_id: string; p_student_id: string }
        Returns: boolean
      }
      can_record_attendance: {
        Args: { p_session_id: string; p_student_id: string }
        Returns: boolean
      }
      can_teach_session: { Args: { p_session_id: string }; Returns: boolean }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      current_student_course_ids: { Args: never; Returns: string[] }
      current_student_id: { Args: never; Returns: string }
      current_student_teacher_ids: { Args: never; Returns: string[] }
      current_teacher_course_ids: { Args: never; Returns: string[] }
      founding_drop_in_candidates: {
        Args: { p_session_id: string }
        Returns: {
          full_name: string
          id: string
        }[]
      }
      founding_spots_taken: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      lead_identity_key: {
        Args: { p_nombre: string; p_telefono: string }
        Returns: string
      }
      leaderboard_alumno: {
        Args: { p_limit?: number }
        Returns: {
          avatar_path: string
          balance: number
          full_name: string
          student_id: string
        }[]
      }
      perfil_alumno_completo: {
        Args: { p_avatar_path: string; p_birthday: string; p_full_name: string }
        Returns: boolean
      }
      student_can_see_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      student_point_balance: { Args: { p_student_id: string }; Returns: number }
      teaches_or_substitutes_student: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      teaches_student: { Args: { p_student_id: string }; Returns: boolean }
    }
    Enums: {
      contenido_tipo: "video" | "comentario" | "fiesta" | "evento"
      cycle_type: "curso" | "suelta"
      dance_role: "leader" | "follower" | "both"
      enrollment_role: "leader" | "follower"
      evento_tipo:
        | "fiesta"
        | "masterclass"
        | "social"
        | "otro"
        | "congreso"
        | "taller"
        | "intensivo"
      inscripcion_estado: "activa" | "pausada" | "baja" | "lista_espera"
      lead_estado:
        | "nuevo"
        | "contactado"
        | "prueba_agendada"
        | "convertido"
        | "descartado"
      payment_status: "al_dia" | "pendiente"
      point_source: "asistencia" | "evento" | "manual" | "canje" | "ajuste"
      redemption_status: "solicitado" | "entregado" | "cancelado"
      session_status: "programada" | "impartida" | "cancelada"
      user_role: "alumno" | "profesor" | "admin"
      whatsapp_event_status: "pendiente" | "enviado" | "error"
      whatsapp_event_type:
        | "recordatorio_clase"
        | "cuota_pendiente"
        | "alumno_inactivo"
        | "confirmacion_lista_espera"
        | "broadcast"
        | "cumpleanos"
        | "puntos_hito"
        | "premio_canjeado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contenido_tipo: ["video", "comentario", "fiesta", "evento"],
      cycle_type: ["curso", "suelta"],
      dance_role: ["leader", "follower", "both"],
      enrollment_role: ["leader", "follower"],
      evento_tipo: [
        "fiesta",
        "masterclass",
        "social",
        "otro",
        "congreso",
        "taller",
        "intensivo",
      ],
      inscripcion_estado: ["activa", "pausada", "baja", "lista_espera"],
      lead_estado: [
        "nuevo",
        "contactado",
        "prueba_agendada",
        "convertido",
        "descartado",
      ],
      payment_status: ["al_dia", "pendiente"],
      point_source: ["asistencia", "evento", "manual", "canje", "ajuste"],
      redemption_status: ["solicitado", "entregado", "cancelado"],
      session_status: ["programada", "impartida", "cancelada"],
      user_role: ["alumno", "profesor", "admin"],
      whatsapp_event_status: ["pendiente", "enviado", "error"],
      whatsapp_event_type: [
        "recordatorio_clase",
        "cuota_pendiente",
        "alumno_inactivo",
        "confirmacion_lista_espera",
        "broadcast",
        "cumpleanos",
        "puntos_hito",
        "premio_canjeado",
      ],
    },
  },
} as const

