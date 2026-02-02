export type SubscriptionStatus = "renewing_soon" | "good" | "cancelled"

export interface Subscription {
  id: string
  name: string
  logo: string // letter or icon name
  logoColor: string
  price: number
  billingCycle: "monthly" | "yearly" | "weekly"
  renewalDate: Date
  status: SubscriptionStatus
  cancelUrl?: string
}

export interface Notification {
  id: string
  subscriptionId: string
  title: string
  message: string
  type: "warning" | "info" | "success"
  date: Date
  read: boolean
}
