import type { Metadata, Viewport } from "next"
import { Outfit, Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { ToastProvider } from "@/hooks/useToast"
import { CookieBanner } from "@/components/ui/CookieBanner"
import { AnalyticsProvider } from "@/lib/analytics/provider"
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
    statusBarStyle: "black-translucent",
    title: "SubSnooze",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1918" },
  ],
}

// Inline script to prevent FOUC (flash of unstyled content) on dark mode
const themeScript = `(function(){try{var t=localStorage.getItem("subsnooze_theme");if(t==="dark"||(t==="system"||!t)&&window.matchMedia("(prefers-color-scheme:dark)").matches){document.documentElement.classList.add("dark")}}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <AnalyticsProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <CookieBanner />
            </ToastProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
