import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type BillingCycle = "weekly" | "monthly" | "yearly"

interface Subscription {
  id: string
  renewal_date: string
  billing_cycle: BillingCycle
  status: string
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  return createClient(url, key)
}

function getNextRenewalDate(renewalDate: Date, billingCycle: BillingCycle): Date {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const nextDate = new Date(renewalDate.getFullYear(), renewalDate.getMonth(), renewalDate.getDate())

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

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminSupabase()

  try {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("id, renewal_date, billing_cycle, status")
      .neq("status", "cancelled")
      .lte("renewal_date", new Date().toISOString().split("T")[0])

    if (error) {
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No renewals to advance", updated: 0 })
    }

    const results = { processed: 0, updated: 0, errors: [] as string[] }

    for (const sub of subscriptions as Subscription[]) {
      results.processed++
      const renewalDate = new Date(sub.renewal_date + "T00:00:00")
      const nextDate = getNextRenewalDate(renewalDate, sub.billing_cycle)

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          renewal_date: formatDate(nextDate),
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

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
