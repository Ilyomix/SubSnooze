// Weekly cron job to update subscription services
// Verifies URLs are still valid and attempts price extraction
// Schedule: Sunday 3 AM UTC via Supabase cron
// Usage: Deploy and set up cron via Supabase Dashboard

import { getSupabaseClient } from "../_shared/supabase.ts"

const BATCH_SIZE = 100 // Process 100 services per run to avoid rate limits
const REQUEST_DELAY_MS = 500 // Delay between requests to avoid rate limiting
const REQUEST_TIMEOUT_MS = 10000 // 10 second timeout for HTTP requests

interface Service {
  id: string
  slug: string
  name: string
  domain: string
  logo_url: string | null
  cancel_url: string | null
  website_url: string | null
  price_monthly: number | null
  status: string
  last_verified_at: string | null
}

interface UpdateResult {
  id: string
  slug: string
  status: "ok" | "logo_broken" | "cancel_broken" | "website_broken" | "error"
  priceUpdated: boolean
  newPrice?: number
  error?: string
}

// Verify a URL is still accessible
async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "SubSnooze-Bot/1.0 (https://subsnooze.app)",
      },
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// Try to extract price from a webpage
// Note: This is best-effort and may not work for all sites
async function extractPrice(url: string): Promise<number | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "SubSnooze-Bot/1.0 (https://subsnooze.app)",
        "Accept": "text/html",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const html = await response.text()

    // Common price patterns (USD-focused)
    const patterns = [
      /\$(\d+\.?\d*)\s*\/?\s*mo(?:nth)?/i,           // $9.99/mo or $9.99/month
      /\$(\d+\.?\d*)\s*per\s*month/i,                // $9.99 per month
      /(\d+\.?\d*)\s*USD\s*\/?\s*month/i,            // 9.99 USD/month
      /monthly[:\s]+\$?(\d+\.?\d*)/i,                // Monthly: $9.99
      /\$(\d+\.?\d*)\s*\/\s*mo/i,                    // $9.99 / mo
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        const price = parseFloat(match[1])
        // Sanity check: price should be between $0.50 and $500
        if (price >= 0.5 && price <= 500) {
          return price
        }
      }
    }

    return null
  } catch {
    return null
  }
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Process a single service
async function processService(service: Service): Promise<UpdateResult> {
  const result: UpdateResult = {
    id: service.id,
    slug: service.slug,
    status: "ok",
    priceUpdated: false,
  }

  try {
    // 1. Verify logo URL if present
    if (service.logo_url) {
      const logoOk = await verifyUrl(service.logo_url)
      if (!logoOk) {
        result.status = "logo_broken"
      }
      await delay(REQUEST_DELAY_MS)
    }

    // 2. Verify cancel URL if present
    if (service.cancel_url && result.status === "ok") {
      const cancelOk = await verifyUrl(service.cancel_url)
      if (!cancelOk) {
        result.status = "cancel_broken"
      }
      await delay(REQUEST_DELAY_MS)
    }

    // 3. Try to extract current price from website
    if (service.website_url) {
      const extractedPrice = await extractPrice(service.website_url)
      if (extractedPrice !== null) {
        // Only update if price differs significantly (more than $0.50 difference)
        if (
          service.price_monthly === null ||
          Math.abs(extractedPrice - service.price_monthly) > 0.5
        ) {
          result.priceUpdated = true
          result.newPrice = extractedPrice
        }
      }
    }

    return result
  } catch (error) {
    result.status = "error"
    result.error = error instanceof Error ? error.message : "Unknown error"
    return result
  }
}

// Main handler
Deno.serve(async (req) => {
  // Verify this is a scheduled invocation or has proper auth
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabase = getSupabaseClient()

  // Get services that need verification (oldest first)
  const { data: services, error: fetchError } = await supabase
    .from("subscription_services")
    .select("id, slug, name, domain, logo_url, cancel_url, website_url, price_monthly, status, last_verified_at")
    .eq("status", "active")
    .order("last_verified_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error("Error fetching services:", fetchError)
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!services || services.length === 0) {
    return new Response(JSON.stringify({ message: "No services to process" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  console.log(`Processing ${services.length} services...`)

  const results: UpdateResult[] = []
  const updates: { id: string; updates: Record<string, unknown> }[] = []

  // Process each service
  for (const service of services) {
    const result = await processService(service as Service)
    results.push(result)

    // Prepare update object
    const serviceUpdates: Record<string, unknown> = {
      last_verified_at: new Date().toISOString(),
    }

    // Update status if broken
    if (result.status !== "ok" && result.status !== "error") {
      serviceUpdates.status = "needs_review"
    }

    // Update price if changed
    if (result.priceUpdated && result.newPrice !== undefined) {
      serviceUpdates.price_monthly = result.newPrice
    }

    updates.push({ id: service.id, updates: serviceUpdates })

    // Add delay between services to avoid overwhelming external services
    await delay(REQUEST_DELAY_MS)
  }

  // Apply updates in batch
  let successCount = 0
  let errorCount = 0

  for (const { id, updates: serviceUpdates } of updates) {
    const { error: updateError } = await supabase
      .from("subscription_services")
      .update(serviceUpdates)
      .eq("id", id)

    if (updateError) {
      console.error(`Error updating service ${id}:`, updateError)
      errorCount++
    } else {
      successCount++
    }
  }

  // Summary
  const summary = {
    processed: services.length,
    updated: successCount,
    errors: errorCount,
    broken: results.filter((r) => r.status !== "ok" && r.status !== "error").length,
    priceUpdates: results.filter((r) => r.priceUpdated).length,
    results: results,
  }

  console.log(`Completed: ${successCount} updated, ${errorCount} errors`)

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
