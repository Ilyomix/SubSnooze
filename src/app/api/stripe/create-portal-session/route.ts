import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe/server"

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

    // 2. Get Stripe customer ID
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      )
    }

    // 3. Create Billing Portal session
    const stripe = getStripe()
    const headersList = await headers()
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000"
    const protocol = headersList.get("x-forwarded-proto") || "https"
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: origin,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Stripe portal error:", error)
    }
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
