import { createClient } from "@/lib/supabase/client"
import type { Database, Insertable, Updatable } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

function getClient(): SupabaseClient<Database> {
  return createClient()
}

export async function getSubscriptions(userId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("renewal_date", { ascending: true })

  if (error) {
    // 42P01 = Table doesn't exist (migration not run)
    if (error.code === "42P01") {
      console.error("Database tables not found. Please run the migration.")
      return []
    }
    throw error
  }
  return data ?? []
}

export async function getSubscription(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createSubscription(
  subscription: Insertable<"subscriptions">
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(subscription)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSubscription(
  id: string,
  updates: Updatable<"subscriptions">
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSubscription(id: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function cancelSubscription(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" as const })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function recordCancelAttempt(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      cancel_attempt_date: new Date().toISOString(),
      cancel_verified: false,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verifyCancellation(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      cancel_verified: true,
      status: "cancelled" as const,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function resetCancelAttempt(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      cancel_attempt_date: null,
      cancel_verified: null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function restoreSubscription(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "active" as const,
      cancel_attempt_date: null,
      cancel_verified: null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}
