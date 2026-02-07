import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createClient } from "@supabase/supabase-js"

// Use the service role key for webhook handlers — they run without user context
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL")
  }
  // Use untyped client — stripe_events table may not be in generated types yet
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (process.env.NODE_ENV === "development") {
      console.error("Webhook signature verification failed:", message)
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  // Idempotency check — prevent duplicate event processing
  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("event_id", event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Record the event ID before processing
  await supabase.from("stripe_events").insert({
    event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  })

  try {
    switch (event.type) {
      // ─── One-time payment completed (lifetime Pro purchase) ───
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
          break
        }

        // Only process completed payments
        if (session.payment_status !== "paid") {
          break
        }

        // Activate Pro
        await supabase
          .from("users")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_payment_id: session.payment_intent as string,
          })
          .eq("id", userId)

        break
      }

      // ─── Payment refunded → revoke Pro ───
      case "charge.refunded": {
        const charge = event.data.object
        const customerId = charge.customer as string | null

        if (!customerId) break

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (user) {
          await supabase
            .from("users")
            .update({ is_premium: false })
            .eq("id", user.id)
        }
        break
      }

      // ─── Payment disputed → revoke Pro ───
      case "charge.dispute.created": {
        const dispute = event.data.object
        const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.toString()
        if (!chargeId) break

        const charge = await stripe.charges.retrieve(chargeId)
        const customerId = charge.customer as string | null

        if (!customerId) break

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (user) {
          await supabase
            .from("users")
            .update({ is_premium: false })
            .eq("id", user.id)
        }
        break
      }

      default:
        // Unhandled event type — that's fine
        break
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Webhook handler error:", error)
    }
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
