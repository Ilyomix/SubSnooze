import type { Metadata, Viewport } from "next"
import { Outfit, Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { ToastProvider } from "@/hooks/useToast"
import { CookieBanner } from "@/components/ui/CookieBanner"
import "@/styles/globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "SubSnooze - ADHD-Friendly Subscription Tracker",
    template: "%s | SubSnooze",
  },
  description:
    "Stop paying the ADHD tax on subscriptions. Track renewals, get timely reminders, and cancel on time.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://subsnooze.com"),
  openGraph: {
    title: "SubSnooze - ADHD-Friendly Subscription Tracker",
    description:
      "Stop paying the ADHD tax on subscriptions. Track renewals, get timely reminders, and cancel on time.",
    url: "https://subsnooze.com",
    siteName: "SubSnooze",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SubSnooze - ADHD-Friendly Subscription Tracker",
    description:
      "Stop paying the ADHD tax on subscriptions. Track renewals, get timely reminders, and cancel on time.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubSnooze",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F7F4",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} style={{ colorScheme: "light" }}>
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>
            {children}
            <CookieBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
