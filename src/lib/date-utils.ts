import type { BillingCycle } from "@/types/database"

/**
 * Parse a YYYY-MM-DD string as LOCAL midnight (not UTC)
 * This is the correct interpretation for user-selected dates
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

/**
 * Format a Date to YYYY-MM-DD string using LOCAL date components
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Calculate next renewal date from today based on billing cycle
 */
export function calculateNextRenewalDate(billingCycle: BillingCycle | string): string {
  const today = new Date()
  const nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

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

  return formatLocalDate(nextDate)
}

/**
 * Advance a renewal date forward until it's in the future
 */
export function getNextRenewalDate(renewalDate: Date, billingCycle: BillingCycle): Date {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const nextDate = new Date(
    renewalDate.getFullYear(),
    renewalDate.getMonth(),
    renewalDate.getDate()
  )

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

/**
 * Calculate days until renewal using date-only comparison
 */
export function daysUntilRenewal(renewalDate: Date): number {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const renewalMidnight = new Date(
    renewalDate.getFullYear(),
    renewalDate.getMonth(),
    renewalDate.getDate()
  )

  const diffMs = renewalMidnight.getTime() - todayMidnight.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}
