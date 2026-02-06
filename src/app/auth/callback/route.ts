import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle password recovery — redirect to dedicated update-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/update-password`)
      }

      // Successful auth, redirect to app
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
