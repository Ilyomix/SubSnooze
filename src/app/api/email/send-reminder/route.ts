import { NextRequest, NextResponse } from "next/server"

interface ReminderEmailPayload {
  to: string
  subscriptionName: string
  daysUntil: number
  price: number
  subscriptionId: string
}

function getReminderSubject(subName: string, daysUntil: number): string {
  if (daysUntil === 1) return `⚠️ ${subName} renews TOMORROW`
  if (daysUntil === 3) return `${subName} renews in 3 days`
  if (daysUntil === 7) return `${subName} renews in 1 week`
  if (daysUntil === 14) return `${subName} renews in 2 weeks`
  return `${subName} renewal reminder`
}

function getReminderHtml(subName: string, daysUntil: number, price: number, appUrl: string): string {
  const isUrgent = daysUntil <= 1
  const accentColor = isUrgent ? "#C9553D" : "#237A5A"

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <div style="background:white;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:${accentColor}15;border-radius:12px;padding:12px">
          <span style="font-size:24px">${isUrgent ? "⚠️" : "🔔"}</span>
        </div>
      </div>
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1918;text-align:center">
        ${isUrgent ? `Last chance: ${subName} renews tomorrow` : `${subName} renews in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#666;text-align:center;line-height:1.5">
        ${isUrgent
          ? `Your $${price.toFixed(2)} subscription renews tomorrow. Cancel now if you don't want to be charged.`
          : `Your $${price.toFixed(2)} subscription renews soon. Review it now if you're thinking about canceling.`
        }
      </p>
      <a href="${appUrl}" style="display:block;text-align:center;background:${accentColor};color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;font-size:15px">
        ${isUrgent ? "Review Now" : "Open SubSnooze"}
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center">
      You're receiving this because you enabled email reminders in SubSnooze.
    </p>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  // Verify internal cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: ReminderEmailPayload = await request.json()
  const { to, subscriptionName, daysUntil, price } = body

  if (!to || !subscriptionName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subsnooze.com"

  // Use Resend API if configured, otherwise use Supabase email (via edge function)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SubSnooze <reminders@subsnooze.com>",
          to: [to],
          subject: getReminderSubject(subscriptionName, daysUntil),
          html: getReminderHtml(subscriptionName, daysUntil, price, appUrl),
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        return NextResponse.json({ error: `Resend error: ${error}` }, { status: 500 })
      }

      return NextResponse.json({ sent: true })
    } catch {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  }

  // No email provider configured — log and skip
  return NextResponse.json({ sent: false, reason: "No email provider configured" })
}
