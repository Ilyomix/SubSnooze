import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface UnverifiedCancellation {
  id: string
  user_id: string
  name: string
  cancel_attempt_date: string
  email: string
  fcm_token: string | null
  push_enabled: boolean
  email_reminders_enabled: boolean
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  // Use untyped client — this route queries views not in the generated types
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminSupabase()

  try {
    const { data: cancellations, error } = await supabase
      .from("unverified_cancellations")
      .select("*") as { data: UnverifiedCancellation[] | null; error: unknown }

    if (error) {
      return NextResponse.json({ error: "Failed to fetch cancellations" }, { status: 500 })
    }

    if (!cancellations || cancellations.length === 0) {
      return NextResponse.json({ message: "No follow-ups to send" })
    }

    const results = {
      processed: 0,
      pushSent: 0,
      notificationsCreated: 0,
      errors: [] as string[],
    }

    for (const cancel of cancellations) {
      results.processed++

      const title = `Did you cancel ${cancel.name}?`
      const body = `You started canceling ${cancel.name} a few days ago. Confirm the cancellation or snooze the reminder.`

      // Create in-app notification with actions
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: cancel.user_id,
        subscription_id: cancel.id,
        title,
        message: body,
        type: "cancel_followup",
        read: false,
        action_type: "verify_cancel",
        action_data: {
          subscription_id: cancel.id,
          subscription_name: cancel.name,
          options: ["yes_cancelled", "remind_again"],
        },
      })

      if (notifError) {
        results.errors.push(`Failed to create notification for ${cancel.id}`)
      } else {
        results.notificationsCreated++
      }
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
