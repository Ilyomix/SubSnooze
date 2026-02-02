// SubSnooze Cancel Followup System
// This Edge Function runs periodically to check for unverified cancellations
// and send follow-up "Did you finish canceling?" notifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { sendPushNotification } from "../_shared/fcm.ts"

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

serve(async (req) => {
  // Verify authorization
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = getSupabaseClient()

  try {
    // Query unverified cancellations using the view (>24 hours old)
    const { data: cancellations, error } = await supabase
      .from("unverified_cancellations")
      .select("*") as { data: UnverifiedCancellation[] | null; error: unknown }

    if (error) {
      console.error("Error fetching unverified cancellations:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch cancellations" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!cancellations || cancellations.length === 0) {
      return new Response(JSON.stringify({ message: "No follow-ups to send" }), {
        headers: { "Content-Type": "application/json" },
      })
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
      const body = `You started canceling ${cancel.name} yesterday. Confirm the cancellation or snooze the reminder.`

      // Send push notification if enabled
      if (cancel.push_enabled && cancel.fcm_token) {
        const pushSent = await sendPushNotification(cancel.fcm_token, title, body, {
          subscription_id: cancel.id,
          type: "cancel_followup",
          action: "verify_or_snooze",
        })

        if (pushSent) {
          results.pushSent++
        } else {
          results.errors.push(`Failed to send push to ${cancel.id}`)
        }
      }

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
        results.errors.push(`Failed to create notification for ${cancel.id}: ${notifError.message}`)
      } else {
        results.notificationsCreated++
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
