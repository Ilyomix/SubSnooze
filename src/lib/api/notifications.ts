import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

function getClient(): SupabaseClient<Database> {
  return createClient()
}

export async function getNotifications(userId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function markAsRead(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markAllAsRead(userId: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
}

export async function deleteNotification(id: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function deleteAllNotifications(userId: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)

  if (error) throw error
}
