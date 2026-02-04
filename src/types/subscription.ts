import type { DbSubscription, DbNotification, BillingCycle } from "./database"

// Legacy status type for UI (maps from database status)
export type SubscriptionStatus = "renewing_soon" | "good" | "cancelled"

// Client-side subscription model (used in UI components)
export interface Subscription {
  id: string
  name: string
  logo: string
  logoColor: string
  price: number
  billingCycle: BillingCycle
  renewalDate: Date
  status: SubscriptionStatus
  cancelUrl?: string

  // Reminder System fields
  remindersSent: number
  lastReminderDate?: Date
  reminder14DaySent: boolean
  reminder7DaySent: boolean
  reminder3DaySent: boolean
  reminder1DaySent: boolean

  // Cancel verification flow
  cancelAttemptDate?: Date
  cancelVerified?: boolean
}

// Client-side notification model (used in UI components)
export interface Notification {
  id: string
  subscriptionId?: string
  title: string
  message: string
  type: "warning" | "info" | "success" | "cancel_followup"
  date: Date
  read: boolean
  actionType?: string
  actionData?: Record<string, unknown>
}

// Transform database subscription to client model
// Auto-advances renewal date if it's in the past (for active subscriptions)
export function dbToSubscription(db: DbSubscription): Subscription {
  const originalRenewalDate = new Date(db.renewal_date)

  // Auto-advance renewal date if in the past (only for non-cancelled subscriptions)
  const renewalDate = db.status !== "cancelled"
    ? getNextRenewalDate(originalRenewalDate, db.billing_cycle)
    : originalRenewalDate

  const days = daysUntilRenewal(renewalDate)

  // Calculate status based on database status and days until renewal
  let status: SubscriptionStatus = "good"
  if (db.status === "cancelled") {
    status = "cancelled"
  } else if (days <= 7) {
    // Mark as renewing soon if within 7 days
    status = "renewing_soon"
  }

  return {
    id: db.id,
    name: db.name,
    logo: db.logo,
    logoColor: db.logo_color,
    price: db.price,
    billingCycle: db.billing_cycle,
    renewalDate,
    status,
    cancelUrl: db.cancel_url ?? undefined,
    remindersSent: db.reminders_sent,
    lastReminderDate: db.last_reminder_date ? new Date(db.last_reminder_date) : undefined,
    reminder14DaySent: db.reminder_14_day_sent,
    reminder7DaySent: db.reminder_7_day_sent,
    reminder3DaySent: db.reminder_3_day_sent,
    reminder1DaySent: db.reminder_1_day_sent,
    cancelAttemptDate: db.cancel_attempt_date ? new Date(db.cancel_attempt_date) : undefined,
    cancelVerified: db.cancel_verified ?? undefined,
  }
}

// Transform client subscription to database insert format
export function subscriptionToDb(
  sub: Omit<Subscription, "id" | "remindersSent" | "lastReminderDate" | "reminder14DaySent" | "reminder7DaySent" | "reminder3DaySent" | "reminder1DaySent" | "cancelAttemptDate" | "cancelVerified">,
  userId: string
): Omit<DbSubscription, "id" | "created_at" | "updated_at" | "reminders_sent" | "last_reminder_date" | "reminder_14_day_sent" | "reminder_7_day_sent" | "reminder_3_day_sent" | "reminder_1_day_sent" | "cancel_attempt_date" | "cancel_verified"> {
  return {
    user_id: userId,
    name: sub.name,
    logo: sub.logo,
    logo_color: sub.logoColor,
    price: sub.price,
    billing_cycle: sub.billingCycle,
    renewal_date: sub.renewalDate.toISOString().split("T")[0],
    status: sub.status === "cancelled" ? "cancelled" : "active",
    cancel_url: sub.cancelUrl ?? null,
  }
}

// Transform database notification to client model
export function dbToNotification(db: DbNotification): Notification {
  return {
    id: db.id,
    subscriptionId: db.subscription_id ?? undefined,
    title: db.title,
    message: db.message,
    type: db.type,
    date: new Date(db.created_at),
    read: db.read,
    actionType: db.action_type ?? undefined,
    actionData: db.action_data as Record<string, unknown> | undefined,
  }
}

// Helper to calculate days until renewal
export function daysUntilRenewal(renewalDate: Date): number {
  const now = new Date()
  const diffTime = renewalDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper to advance renewal date to next cycle if in the past
export function getNextRenewalDate(renewalDate: Date, billingCycle: BillingCycle): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Compare dates only, not time

  const nextDate = new Date(renewalDate)
  nextDate.setHours(0, 0, 0, 0)

  // Keep advancing until the date is in the future
  while (nextDate <= now) {
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

// Helper to get reminder stage (for UI display)
export function getReminderStage(sub: Subscription): 0 | 1 | 2 | 3 {
  const days = daysUntilRenewal(sub.renewalDate)
  if (days <= 1 && sub.reminder1DaySent) return 3
  if (days <= 3 && sub.reminder3DaySent) return 2
  if (days <= 7 && sub.reminder7DaySent) return 1
  return 0
}
