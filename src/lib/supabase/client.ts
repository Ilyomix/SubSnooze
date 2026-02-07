import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

const PLACEHOLDER_PATTERNS = ["placeholder", "your_", "your-", "example", "xxx"]

function isPlaceholderUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))
}

/** Returns true if the Supabase URL is properly configured (not empty, not a placeholder). */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && !isPlaceholderUrl(SUPABASE_URL)
}

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    if (!SUPABASE_URL || isPlaceholderUrl(SUPABASE_URL)) {
      console.error(
        `[SubSnooze] Invalid NEXT_PUBLIC_SUPABASE_URL: "${SUPABASE_URL}". ` +
          "Set the correct Supabase project URL in your environment variables."
      )
    }
    client = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return client
}
