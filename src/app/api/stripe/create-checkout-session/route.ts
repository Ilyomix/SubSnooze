import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe/server"
import { getStripePriceId } from "@/lib/stripe/pricing"

export async function POST() {
  try {
    // 1. Authenticate the user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Check if already premium
    const { data: profile } = await supabase
      .from("users")
      .select("is_premium, stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profile?.is_premium) {
      return NextResponse.json(
        { error: "Already on Pro plan" },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // 3. Get or create Stripe customer
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Store customer ID in our database
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    // 4. Create Checkout Session (one-time payment for lifetime Pro)
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price: getStripePriceId(),
          quantity: 1,
        },
      ],
      payment_intent_data: {
        receipt_email: user.email ?? undefined,
      },
      success_url: `${origin}/?upgrade=success`,
      cancel_url: `${origin}/?upgrade=cancelled`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
