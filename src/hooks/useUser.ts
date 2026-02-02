"use client"

import { useAuth } from "@/contexts/AuthContext"

export function useUser() {
  const { authUser, profile, loading, signOut, refreshProfile } = useAuth()

  // Compute display name from profile or auth user metadata
  const displayName =
    profile?.display_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.email?.split("@")[0] ||
    "User"

  // Get first name for greeting
  const firstName = displayName.split(" ")[0]

  // Avatar URL
  const avatarUrl =
    profile?.avatar_url || authUser?.user_metadata?.avatar_url || null

  return {
    // User identity
    id: authUser?.id ?? null,
    email: authUser?.email ?? null,
    displayName,
    firstName,
    avatarUrl,

    // Profile settings
    isPremium: profile?.is_premium ?? false,
    pushEnabled: profile?.push_enabled ?? false,
    emailRemindersEnabled: profile?.email_reminders_enabled ?? true,
    smsRemindersEnabled: profile?.sms_reminders_enabled ?? false,
    phoneNumber: profile?.phone_number ?? null,
    fcmToken: profile?.fcm_token ?? null,

    // State
    isAuthenticated: !!authUser,
    loading,

    // Actions
    signOut,
    refreshProfile,
  }
}
