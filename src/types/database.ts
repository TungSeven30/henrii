export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string;
          dark_mode_schedule: Json;
          deleted_at: string | null;
          purge_after: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          dark_mode_schedule?: Json;
          deleted_at?: string | null;
          purge_after?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          dark_mode_schedule?: Json;
          deleted_at?: string | null;
          purge_after?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      babies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          date_of_birth: string;
          gender: string | null;
          birth_weight_grams: number | null;
          birth_length_cm: number | null;
          country_code: string;
          timezone: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          date_of_birth: string;
          gender?: string | null;
          birth_weight_grams?: number | null;
          birth_length_cm?: number | null;
          country_code?: string;
          timezone?: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          date_of_birth?: string;
          gender?: string | null;
          birth_weight_grams?: number | null;
          birth_length_cm?: number | null;
          country_code?: string;
          timezone?: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      caregivers: {
        Row: {
          id: string;
          baby_id: string;
          user_id: string;
          role: string;
          invited_by: string;
          invite_status: string;
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          baby_id: string;
          user_id: string;
          role?: string;
          invited_by: string;
          invite_status?: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          baby_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string;
          invite_status?: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      feedings: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          type: string;
          amount_ml: number | null;
          amount_description: string | null;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          notes: string | null;
          client_uuid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          type: string;
          amount_ml?: number | null;
          amount_description?: string | null;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          client_uuid: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          logged_by?: string;
          type?: string;
          amount_ml?: number | null;
          amount_description?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          client_uuid?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sleep_sessions: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          quality: string | null;
          notes: string | null;
          client_uuid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          quality?: string | null;
          notes?: string | null;
          client_uuid: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          logged_by?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          quality?: string | null;
          notes?: string | null;
          client_uuid?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diaper_changes: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          changed_at: string;
          type: string;
          color: string | null;
          consistency: string | null;
          notes: string | null;
          client_uuid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          changed_at: string;
          type: string;
          color?: string | null;
          consistency?: string | null;
          notes?: string | null;
          client_uuid: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          logged_by?: string;
          changed_at?: string;
          type?: string;
          color?: string | null;
          consistency?: string | null;
          notes?: string | null;
          client_uuid?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vaccinations: {
        Row: {
          id: string;
          baby_id: string;
          vaccine_name: string;
          dose_number: number;
          scheduled_date: string;
          administered_date: string | null;
          status: string;
          administered_by: string | null;
          lot_number: string | null;
          notes: string | null;
          source_schedule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          vaccine_name: string;
          dose_number: number;
          scheduled_date: string;
          administered_date?: string | null;
          status?: string;
          administered_by?: string | null;
          lot_number?: string | null;
          notes?: string | null;
          source_schedule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          vaccine_name?: string;
          dose_number?: number;
          scheduled_date?: string;
          administered_date?: string | null;
          status?: string;
          administered_by?: string | null;
          lot_number?: string | null;
          notes?: string | null;
          source_schedule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          baby_id: string;
          created_by: string;
          client_uuid: string | null;
          title: string;
          scheduled_at: string;
          location: string | null;
          notes: string | null;
          reminder_hours_before: number;
          status: string;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          created_by: string;
          client_uuid?: string | null;
          title: string;
          scheduled_at: string;
          location?: string | null;
          notes?: string | null;
          reminder_hours_before?: number;
          status?: string;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          created_by?: string;
          client_uuid?: string | null;
          title?: string;
          scheduled_at?: string;
          location?: string | null;
          notes?: string | null;
          reminder_hours_before?: number;
          status?: string;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      growth_measurements: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          measured_at: string;
          weight_grams: number | null;
          length_cm: number | null;
          head_circumference_cm: number | null;
          weight_percentile: number | null;
          length_percentile: number | null;
          head_percentile: number | null;
          bmi: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          measured_at: string;
          weight_grams?: number | null;
          length_cm?: number | null;
          head_circumference_cm?: number | null;
          weight_percentile?: number | null;
          length_percentile?: number | null;
          head_percentile?: number | null;
          bmi?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          logged_by?: string;
          measured_at?: string;
          weight_grams?: number | null;
          length_cm?: number | null;
          head_circumference_cm?: number | null;
          weight_percentile?: number | null;
          length_percentile?: number | null;
          head_percentile?: number | null;
          bmi?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      developmental_milestones: {
        Row: {
          id: string;
          baby_id: string;
          milestone_key: string;
          achieved_at: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          milestone_key: string;
          achieved_at?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          milestone_key?: string;
          achieved_at?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          baby_id: string;
          event_type: string;
          push_enabled: boolean;
          email_enabled: boolean;
          threshold_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_id: string;
          event_type: string;
          push_enabled?: boolean;
          email_enabled?: boolean;
          threshold_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          baby_id?: string;
          event_type?: string;
          push_enabled?: boolean;
          email_enabled?: boolean;
          threshold_minutes?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      deletion_jobs: {
        Row: {
          id: string;
          user_id: string;
          scheduled_for: string;
          status: string;
          attempts: number;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scheduled_for: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scheduled_for?: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
