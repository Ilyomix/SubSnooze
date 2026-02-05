import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

function getClient(): SupabaseClient<Database> {
  return createClient()
}

const PAGE_SIZE = 20

export async function getNotifications(userId: string, page = 0) {
  const supabase = getClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data, total: count ?? 0 }
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

export async function markAsUnread(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: false })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
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

export async function createTestNotification(userId: string) {
  const supabase = getClient()

  const samples = [
    {
      title: "Spotify renews in 3 days",
      message: "Want to keep it or cancel? Your call.",
      type: "warning" as const,
    },
    {
      title: "Netflix renews tomorrow",
      message: "Just a heads up — renews Feb 6.",
      type: "warning" as const,
    },
    {
      title: "Did you cancel Hulu?",
      message: "You started cancelling 2 days ago. Did it go through?",
      type: "cancel_followup" as const,
    },
    {
      title: "Nice — you saved $15.99/mo",
      message: "Hulu has been marked as cancelled.",
      type: "success" as const,
    },
  ]

  const sample = samples[Math.floor(Math.random() * samples.length)]

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: sample.title,
      message: sample.message,
      type: sample.type,
      read: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
