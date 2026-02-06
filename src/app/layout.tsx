import type { Metadata, Viewport } from "next"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { ToastProvider } from "@/components/ui/Toast"
import { CookieBanner } from "@/components/ui/CookieBanner"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "SubSnooze - Subscription Tracker",
  description: "Track and manage your subscriptions. Stop paying the ADHD tax. Never forget to cancel again.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubSnooze",
  },
  openGraph: {
    title: "SubSnooze - Subscription Tracker",
    description: "Track and manage your subscriptions. Stop paying the ADHD tax. Never forget to cancel again.",
    type: "website",
    locale: "en_US",
    siteName: "SubSnooze",
  },
  twitter: {
    card: "summary",
    title: "SubSnooze - Subscription Tracker",
    description: "Track and manage your subscriptions. Stop paying the ADHD tax.",
  },
  robots: {
    index: true,
    follow: true,
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
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
              <CookieBanner />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
