import type { Subscription } from "@/types/subscription"
import { formatLocalDate } from "@/lib/date-utils"

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function subscriptionsToCSV(subscriptions: Subscription[]): string {
  const headers = ["Name", "Price", "Billing Cycle", "Renewal Date", "Status"]
  const rows = subscriptions.map((sub) => [
    escapeCSV(sub.name),
    sub.price.toFixed(2),
    sub.billingCycle,
    formatLocalDate(sub.renewalDate),
    sub.status === "renewing_soon" ? "active" : sub.status,
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
