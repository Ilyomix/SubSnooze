// SubSnooze Auto-Advance Renewals
// Runs daily via cron to advance past renewal dates based on billing cycle
// Should run BEFORE send-reminders so dates are current when reminders are checked

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"

type BillingCycle = "weekly" | "monthly" | "yearly"

interface Subscription {
  id: string
  renewal_date: string
  billing_cycle: BillingCycle
  status: string
}

function getNextRenewalDate(renewalDate: Date, billingCycle: BillingCycle): Date {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const nextDate = new Date(
    renewalDate.getFullYear(),
    renewalDate.getMonth(),
    renewalDate.getDate()
  )

  while (nextDate <= todayMidnight) {
    switch (billingCycle) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }
  }

  return nextDate
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

serve(async (req) => {
  // Verify this is a cron request or authorized call
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = getSupabaseClient()

  try {
    // Query subscriptions with past renewal dates (non-cancelled only)
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("id, renewal_date, billing_cycle, status")
      .neq("status", "cancelled")
      .lte("renewal_date", new Date().toISOString().split("T")[0])

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No renewals to advance", updated: 0 }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const results = { processed: 0, updated: 0, errors: [] as string[] }

    for (const sub of subscriptions as Subscription[]) {
      results.processed++

      const renewalDate = new Date(sub.renewal_date + "T00:00:00")
      const nextDate = getNextRenewalDate(renewalDate, sub.billing_cycle)

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          renewal_date: formatLocalDate(nextDate),
          // Reset reminder flags for new cycle
          reminder_14_day_sent: false,
          reminder_7_day_sent: false,
          reminder_3_day_sent: false,
          reminder_1_day_sent: false,
          reminders_sent: 0,
        })
        .eq("id", sub.id)

      if (updateError) {
        results.errors.push(`${sub.id}: ${updateError.message}`)
      } else {
        results.updated++
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
