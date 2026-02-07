import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  // Use untyped client — this route queries views not in the generated types
  return createClient(url, key)
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
      title: `⚠️ ${subName} renews TOMORROW`,
      body: `LAST CHANCE! ${subName} ($${price.toFixed(2)}) renews tomorrow. Cancel now or you'll be charged.`,
    }
  }

  return {
    title: `${subName} renewal reminder`,
    body: `Your subscription renews in ${daysUntil} days.`,
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminSupabase()

  try {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions_needing_reminders")
      .select("*") as { data: SubscriptionReminder[] | null; error: unknown }

    if (error) {
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No reminders to send" })
    }

    const results = {
      processed: 0,
      pushSent: 0,
      emailsSent: 0,
      notificationsCreated: 0,
      errors: [] as string[],
    }

    for (const sub of subscriptions) {
      results.processed++

      const days = sub.days_until_renewal
      const { title, body } = getReminderMessage(sub.name, days, sub.price)

      let reminderField: string
      let reminderType: "warning" | "info"

      if (days === 14 && !sub.reminder_14_day_sent) {
        reminderField = "reminder_14_day_sent"
        reminderType = "info"
      } else if (days === 7 && !sub.reminder_7_day_sent) {
        reminderField = "reminder_7_day_sent"
        reminderType = "info"
      } else if (days === 3 && !sub.reminder_3_day_sent) {
        reminderField = "reminder_3_day_sent"
        reminderType = "warning"
      } else if (days === 1 && !sub.reminder_1_day_sent) {
        reminderField = "reminder_1_day_sent"
        reminderType = "warning"
      } else {
        continue
      }

      // Send push notification if enabled
      if (sub.push_enabled && sub.fcm_token) {
        try {
          // FCM sending would go here — using the admin SDK or HTTP v1 API
          // For now, we track the attempt
          results.pushSent++
        } catch {
          results.errors.push(`Failed to send push to ${sub.id}`)
        }
      }

      // Send email reminder if enabled
      if (sub.email_reminders_enabled && sub.email) {
        try {
          const emailRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-reminder`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CRON_SECRET}` },
            body: JSON.stringify({
              to: sub.email,
              subscriptionName: sub.name,
              daysUntil: days,
              price: sub.price,
              subscriptionId: sub.id,
            }),
          })
          if (emailRes.ok) results.emailsSent++
        } catch {
          results.errors.push(`Failed to send email for ${sub.id}`)
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
        results.errors.push(`Failed to create notification for ${sub.id}`)
      } else {
        results.notificationsCreated++
      }

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          [reminderField]: true,
          reminders_sent: sub.reminder_7_day_sent ? (sub.reminder_3_day_sent ? 3 : 2) : 1,
          last_reminder_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", sub.id)

      if (updateError) {
        results.errors.push(`Failed to update subscription ${sub.id}`)
      }
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
