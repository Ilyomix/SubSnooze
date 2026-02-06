"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { User } from "@/types/database"

interface AuthContextValue {
  // Supabase auth user
  authUser: SupabaseUser | null
  // Profile data from users table
  profile: User | null
  // Loading state
  loading: boolean
  // Sign out function
  signOut: () => Promise<void>
  // Refresh profile data
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        // PGRST116 = Row not found (new user, trigger may not have created profile yet)
        // 42P01 = Table doesn't exist (migration not run)
        if (error.code === "PGRST116" && email) {
          // Try to create the profile manually (fallback if trigger didn't work)
          const { data: newProfile, error: insertError } = await supabase
            .from("users")
            .insert({ id: userId, email })
            .select()
            .single()

          if (insertError) {
            return null
          }
          return newProfile
        }
        if (error.code === "42P01") {
          return null
        }
        return null
      }

      return data
    } catch {
      return null
    }
  }

  const refreshProfile = async () => {
    if (authUser) {
      const profileData = await fetchProfile(authUser.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // Get initial user (getUser() validates the JWT server-side, unlike deprecated getSession())
    const getInitialUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // Token expired or invalid — redirect to login if we had a stale session
        const { data: { session } } = await supabase.auth.getSession()
        if (session && error) {
          // Had a session but token is invalid — force re-login
          await supabase.auth.signOut()
          window.location.href = "/login"
          return
        }
        setLoading(false)
        return
      }

      setAuthUser(user)
      // Set loading false immediately - don't wait for profile
      setLoading(false)
      // Fetch profile in background
      fetchProfile(user.id, user.email).then(profileData => {
        setProfile(profileData)
      })
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "TOKEN_REFRESHED" && !session) {
          // Refresh failed — redirect to login
          window.location.href = "/login"
          return
        }

        if (session?.user) {
          setAuthUser(session.user)
          // Set loading false immediately - don't wait for profile
          setLoading(false)
          // Fetch profile in background
          fetchProfile(session.user.id, session.user.email).then(profileData => {
            setProfile(profileData)
          })
        } else {
          setAuthUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setProfile(null)
    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
