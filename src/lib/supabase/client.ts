import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// Placeholders allow the client to be created during build-time static generation
// (e.g. /_not-found prerender) when env vars are not yet available.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return client
}
