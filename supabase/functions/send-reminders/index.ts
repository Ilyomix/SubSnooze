// SubSnooze Configurable Reminder System
// This Edge Function runs daily via cron to send subscription renewal reminders
// Supports presets: aggressive (7,3,1), relaxed (14,3), minimal (3)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { sendPushNotification } from "../_shared/fcm.ts"

type ReminderPreset = "aggressive" | "relaxed" | "minimal"

interface SubscriptionReminder {
  id: string
  user_id: string
  name: string
  renewal_date: string
  price: number
  email: string
  fcm_token: string | null
  push_enabled: boolean
  email_reminders_enabled: boolean
  reminder_preset: ReminderPreset
  days_until_renewal: number
  reminder_14_day_sent: boolean
  reminder_7_day_sent: boolean
  reminder_3_day_sent: boolean
  reminder_1_day_sent: boolean
}

function getReminderMessage(subName: string, daysUntil: number, price: number): { title: string; body: string } {
  if (daysUntil === 14) {
    return {
      title: `${subName} renews in 2 weeks`,
      body: `Heads up! Your $${price.toFixed(2)}/mo subscription renews in 2 weeks. Plenty of time to decide.`,
    }
  } else if (daysUntil === 7) {
    return {
      title: `${subName} renews in 1 week`,
      body: `Your $${price.toFixed(2)}/mo subscription renews soon. Review it now if you want to cancel.`,
    }
  } else if (daysUntil === 3) {
    return {
      title: `${subName} renews in 3 days`,
      body: `Still want to keep ${subName}? It renews for $${price.toFixed(2)} in 3 days.`,
    }
  } else if (daysUntil === 1) {
    return {
      title: `${subName} renews TOMORROW`,
      body: `Last chance! ${subName} ($${price.toFixed(2)}) renews tomorrow. Cancel now or keep it.`,
    }
  }

  return {
    title: `${subName} renewal reminder`,
    body: `Your subscription renews in ${daysUntil} days.`,
  }
}

serve(async (req) => {
  // Verify this is a cron request or authorized call
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = getSupabaseClient()

  try {
    // Query subscriptions needing reminders using the view
    const { data: subscriptions, error } = await supabase
      .from("subscriptions_needing_reminders")
      .select("*") as { data: SubscriptionReminder[] | null; error: unknown }

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders to send" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const results = {
      processed: 0,
      pushSent: 0,
      notificationsCreated: 0,
      errors: [] as string[],
    }

    for (const sub of subscriptions) {
      results.processed++

      const days = sub.days_until_renewal
      const { title, body } = getReminderMessage(sub.name, days, sub.price)

      // Determine which reminder stage this is based on days and preset
      let reminderField: string
      let reminderType: "warning" | "info"

      if (days === 14 && !sub.reminder_14_day_sent) {
        // Only for relaxed preset (view already filters this)
        reminderField = "reminder_14_day_sent"
        reminderType = "info"
      } else if (days === 7 && !sub.reminder_7_day_sent) {
        // Only for aggressive preset (view already filters this)
        reminderField = "reminder_7_day_sent"
        reminderType = "info"
      } else if (days === 3 && !sub.reminder_3_day_sent) {
        // For all presets
        reminderField = "reminder_3_day_sent"
        reminderType = "warning"
      } else if (days === 1 && !sub.reminder_1_day_sent) {
        // Only for aggressive preset (view already filters this)
        reminderField = "reminder_1_day_sent"
        reminderType = "warning"
      } else {
        continue // Skip if reminder already sent or not applicable
      }

      // Send push notification if enabled
      if (sub.push_enabled && sub.fcm_token) {
        const pushSent = await sendPushNotification(sub.fcm_token, title, body, {
          subscription_id: sub.id,
          type: "renewal_reminder",
          days_until_renewal: days.toString(),
        })

        if (pushSent) {
          results.pushSent++
        } else {
          results.errors.push(`Failed to send push to ${sub.id}`)
        }
      }

      // Create in-app notification
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        title,
        message: body,
        type: reminderType,
        read: false,
      })

      if (notifError) {
        results.errors.push(`Failed to create notification for ${sub.id}: ${notifError.message}`)
      } else {
        results.notificationsCreated++
      }

      // Update subscription reminder tracking
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          [reminderField]: true,
          reminders_sent: sub.reminder_7_day_sent ? (sub.reminder_3_day_sent ? 3 : 2) : 1,
          last_reminder_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", sub.id)

      if (updateError) {
        results.errors.push(`Failed to update subscription ${sub.id}: ${updateError.message}`)
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
