export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          scope: string
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          scope: string
          updated_at?: string
          user_id: string
          window_start: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          scope?: string
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      appointment_attachments: {
        Row: {
          appointment_id: string
          baby_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          size_bytes: number
          uploaded_by: string
        }
        Insert: {
          appointment_id: string
          baby_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          size_bytes?: number
          uploaded_by: string
        }
        Update: {
          appointment_id?: string
          baby_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_attachments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_attachments_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          baby_id: string
          client_uuid: string
          created_at: string
          created_by: string
          id: string
          location: string | null
          notes: string | null
          reminder_hours_before: number
          reminder_sent_at: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_uuid?: string
          created_at?: string
          created_by: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_hours_before?: number
          reminder_sent_at?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_uuid?: string
          created_at?: string
          created_by?: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_hours_before?: number
          reminder_sent_at?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      babies: {
        Row: {
          country_code: string
          created_at: string
          date_of_birth: string
          id: string
          name: string
          owner_id: string
          photo_url: string | null
          sex: "male" | "female"
          timezone: string
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          date_of_birth: string
          id?: string
          name: string
          owner_id: string
          photo_url?: string | null
          sex?: "male" | "female"
          timezone?: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          date_of_birth?: string
          id?: string
          name?: string
          owner_id?: string
          photo_url?: string | null
          sex?: "male" | "female"
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      caregiver_invites: {
        Row: {
          accepted_at: string | null
          baby_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          revoked_at: string | null
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          baby_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          revoked_at?: string | null
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          baby_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          revoked_at?: string | null
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_invites_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          accepted_at: string | null
          baby_id: string
          created_at: string
          email: string
          id: string
          invite_status: string
          invited_at: string
          invited_by: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          baby_id: string
          created_at?: string
          email: string
          id?: string
          invite_status?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          baby_id?: string
          created_at?: string
          email?: string
          id?: string
          invite_status?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_jobs: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          processed_at: string | null
          profile_id: string
          scheduled_for: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          profile_id: string
          scheduled_for: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          profile_id?: string
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      developmental_milestones: {
        Row: {
          achieved_at: string | null
          baby_id: string
          created_at: string
          id: string
          logged_by: string
          milestone_key: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          baby_id: string
          created_at?: string
          id?: string
          logged_by: string
          milestone_key: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          baby_id?: string
          created_at?: string
          id?: string
          logged_by?: string
          milestone_key?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developmental_milestones_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "developmental_milestones_milestone_key_fkey"
            columns: ["milestone_key"]
            isOneToOne: false
            referencedRelation: "milestone_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      diaper_changes: {
        Row: {
          baby_id: string
          change_type: string
          changed_at: string
          client_uuid: string
          created_at: string
          id: string
          logged_by: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          baby_id: string
          change_type?: string
          changed_at?: string
          client_uuid?: string
          created_at?: string
          id?: string
          logged_by: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          baby_id?: string
          change_type?: string
          changed_at?: string
          client_uuid?: string
          created_at?: string
          id?: string
          logged_by?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diaper_changes_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_conflicts: {
        Row: {
          baby_id: string
          created_at: string
          detected_reason: string
          event_1_happened_at: string
          event_1_id: string
          event_1_logged_by: string
          event_1_snapshot: Json
          event_2_happened_at: string
          event_2_id: string
          event_2_logged_by: string
          event_2_snapshot: Json
          event_table: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          detected_reason?: string
          event_1_happened_at: string
          event_1_id: string
          event_1_logged_by: string
          event_1_snapshot: Json
          event_2_happened_at: string
          event_2_id: string
          event_2_logged_by: string
          event_2_snapshot: Json
          event_table: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          detected_reason?: string
          event_1_happened_at?: string
          event_1_id?: string
          event_1_logged_by?: string
          event_1_snapshot?: Json
          event_2_happened_at?: string
          event_2_id?: string
          event_2_logged_by?: string
          event_2_snapshot?: Json
          event_table?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_conflicts_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      feedings: {
        Row: {
          amount_ml: number | null
          baby_id: string
          client_uuid: string
          created_at: string
          feeding_type: string
          id: string
          logged_by: string
          notes: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          amount_ml?: number | null
          baby_id: string
          client_uuid?: string
          created_at?: string
          feeding_type?: string
          id?: string
          logged_by: string
          notes?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          amount_ml?: number | null
          baby_id?: string
          client_uuid?: string
          created_at?: string
          feeding_type?: string
          id?: string
          logged_by?: string
          notes?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedings_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_measurements: {
        Row: {
          baby_id: string
          client_uuid: string
          created_at: string
          head_circumference_cm: number | null
          head_percentile: number | null
          id: string
          length_cm: number | null
          length_percentile: number | null
          logged_by: string
          measured_at: string
          notes: string | null
          updated_at: string
          weight_kg: number | null
          weight_percentile: number | null
        }
        Insert: {
          baby_id: string
          client_uuid?: string
          created_at?: string
          head_circumference_cm?: number | null
          head_percentile?: number | null
          id?: string
          length_cm?: number | null
          length_percentile?: number | null
          logged_by: string
          measured_at: string
          notes?: string | null
          updated_at?: string
          weight_kg?: number | null
          weight_percentile?: number | null
        }
        Update: {
          baby_id?: string
          client_uuid?: string
          created_at?: string
          head_circumference_cm?: number | null
          head_percentile?: number | null
          id?: string
          length_cm?: number | null
          length_percentile?: number | null
          logged_by?: string
          measured_at?: string
          notes?: string | null
          updated_at?: string
          weight_kg?: number | null
          weight_percentile?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_measurements_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_rate_limits: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone_definitions: {
        Row: {
          category: string
          created_at: string
          description_en: string
          description_vi: string
          key: string
          name_en: string
          name_vi: string
          source: string
          typical_age_max_months: number
          typical_age_min_months: number
        }
        Insert: {
          category: string
          created_at?: string
          description_en: string
          description_vi: string
          key: string
          name_en: string
          name_vi: string
          source?: string
          typical_age_max_months: number
          typical_age_min_months: number
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string
          description_vi?: string
          key?: string
          name_en?: string
          name_vi?: string
          source?: string
          typical_age_max_months?: number
          typical_age_min_months?: number
        }
        Relationships: []
      }
      mutation_conflicts: {
        Row: {
          actual_updated_at: string
          attempted_patch: Json | null
          baby_id: string
          created_at: string
          current_snapshot: Json
          event_id: string
          event_table: string
          expected_updated_at: string | null
          id: string
          operation: string
          reported_by: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          actual_updated_at: string
          attempted_patch?: Json | null
          baby_id: string
          created_at?: string
          current_snapshot: Json
          event_id: string
          event_table: string
          expected_updated_at?: string | null
          id?: string
          operation: string
          reported_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          actual_updated_at?: string
          attempted_patch?: Json | null
          baby_id?: string
          created_at?: string
          current_snapshot?: Json
          event_id?: string
          event_table?: string
          expected_updated_at?: string | null
          id?: string
          operation?: string
          reported_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutation_conflicts_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          appointment_id: string | null
          channel: string
          created_at: string
          error_message: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          status: string
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          baby_id: string
          created_at: string
          email_enabled: boolean
          event_type: string
          id: string
          push_enabled: boolean
          threshold_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          email_enabled?: boolean
          event_type: string
          id?: string
          push_enabled?: boolean
          threshold_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          email_enabled?: boolean
          event_type?: string
          id?: string
          push_enabled?: boolean
          threshold_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_baby_id: string | null
          created_at: string
          deleted_at: string | null
          full_name: string | null
          id: string
          locale: string
          purge_after: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          active_baby_id?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id: string
          locale?: string
          purge_after?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          active_baby_id?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          locale?: string
          purge_after?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_baby_id_fkey"
            columns: ["active_baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          baby_id: string
          created_at: string
          enabled: boolean
          endpoint: string
          id: string
          last_error: string | null
          last_sent_at: string | null
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          baby_id: string
          created_at?: string
          enabled?: boolean
          endpoint: string
          id?: string
          last_error?: string | null
          last_sent_at?: string | null
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          baby_id?: string
          created_at?: string
          enabled?: boolean
          endpoint?: string
          id?: string
          last_error?: string | null
          last_sent_at?: string | null
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_sessions: {
        Row: {
          baby_id: string
          client_uuid: string
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          logged_by: string
          notes: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_uuid?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          logged_by: string
          notes?: string | null
          started_at: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_uuid?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          logged_by?: string
          notes?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          baby_id: string
          client_uuid: string
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          logged_by: string
          notes: string | null
          status: string
          updated_at: string
          vaccine_code: string
          vaccine_name: string
        }
        Insert: {
          baby_id: string
          client_uuid?: string
          completed_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          logged_by: string
          notes?: string | null
          status?: string
          updated_at?: string
          vaccine_code: string
          vaccine_name: string
        }
        Update: {
          baby_id?: string
          client_uuid?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          logged_by?: string
          notes?: string | null
          status?: string
          updated_at?: string
          vaccine_code?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      baby_has_premium: { Args: { target_baby_id: string }; Returns: boolean }
      caregiver_write_allowed: {
        Args: { target_baby_id: string }
        Returns: boolean
      }
      current_user_is_accepted_caregiver: {
        Args: { target_baby_id: string }
        Returns: boolean
      }
      current_user_is_baby_owner: {
        Args: { target_baby_id: string }
        Returns: boolean
      }
      insert_event_conflict: {
        Args: {
          p_baby_id: string
          p_event_a_happened_at: string
          p_event_a_id: string
          p_event_a_logged_by: string
          p_event_a_snapshot: Json
          p_event_b_happened_at: string
          p_event_b_id: string
          p_event_b_logged_by: string
          p_event_b_snapshot: Json
          p_event_table: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
