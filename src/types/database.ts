export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          fcm_token: string | null
          push_enabled: boolean
          email_reminders_enabled: boolean
          sms_reminders_enabled: boolean
          phone_number: string | null
          is_premium: boolean
          premium_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          fcm_token?: string | null
          push_enabled?: boolean
          email_reminders_enabled?: boolean
          sms_reminders_enabled?: boolean
          phone_number?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          fcm_token?: string | null
          push_enabled?: boolean
          email_reminders_enabled?: boolean
          sms_reminders_enabled?: boolean
          phone_number?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          logo: string
          logo_color: string
          price: number
          billing_cycle: "weekly" | "monthly" | "yearly"
          renewal_date: string
          status: "active" | "renewing_soon" | "cancelled" | "expired"
          cancel_url: string | null
          reminders_sent: number
          last_reminder_date: string | null
          reminder_7_day_sent: boolean
          reminder_3_day_sent: boolean
          reminder_1_day_sent: boolean
          cancel_attempt_date: string | null
          cancel_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          logo: string
          logo_color: string
          price: number
          billing_cycle: "weekly" | "monthly" | "yearly"
          renewal_date: string
          status?: "active" | "renewing_soon" | "cancelled" | "expired"
          cancel_url?: string | null
          reminders_sent?: number
          last_reminder_date?: string | null
          reminder_7_day_sent?: boolean
          reminder_3_day_sent?: boolean
          reminder_1_day_sent?: boolean
          cancel_attempt_date?: string | null
          cancel_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          logo?: string
          logo_color?: string
          price?: number
          billing_cycle?: "weekly" | "monthly" | "yearly"
          renewal_date?: string
          status?: "active" | "renewing_soon" | "cancelled" | "expired"
          cancel_url?: string | null
          reminders_sent?: number
          last_reminder_date?: string | null
          reminder_7_day_sent?: boolean
          reminder_3_day_sent?: boolean
          reminder_1_day_sent?: boolean
          cancel_attempt_date?: string | null
          cancel_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          title: string
          message: string
          type: "warning" | "info" | "success" | "cancel_followup"
          read: boolean
          action_type: string | null
          action_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          title: string
          message: string
          type: "warning" | "info" | "success" | "cancel_followup"
          read?: boolean
          action_type?: string | null
          action_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          title?: string
          message?: string
          type?: "warning" | "info" | "success" | "cancel_followup"
          read?: boolean
          action_type?: string | null
          action_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_cycle: "weekly" | "monthly" | "yearly"
      subscription_status: "active" | "renewing_soon" | "cancelled" | "expired"
      notification_type: "warning" | "info" | "success" | "cancel_followup"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// Convenient type aliases
export type User = Tables<"users">
export type DbSubscription = Tables<"subscriptions">
export type DbNotification = Tables<"notifications">
export type BillingCycle = Enums<"billing_cycle">
export type SubscriptionStatus = Enums<"subscription_status">
export type NotificationType = Enums<"notification_type">
