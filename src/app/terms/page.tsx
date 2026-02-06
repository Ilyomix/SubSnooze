import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service",
  description: "SubSnooze terms of service — subscription tracker rules of use, limitations, and your rights.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 p-6">
        <Link
          href="/login"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Link>
      </header>

      <main className="flex-1 px-6 pb-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Terms of Service</h1>
            <p className="mt-1 text-sm text-text-tertiary">Last updated: February 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">1. About SubSnooze</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze is a subscription tracking tool that helps you monitor recurring payments and receive reminders before renewals. The service is provided &ldquo;as is&rdquo; and is designed to assist — not replace — your own financial decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">2. Account</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials. You can delete your account and all associated data at any time from the Settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">3. Subscription Data</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze does not connect to your bank or payment providers. All subscription data is entered manually by you. We do not process payments, nor do we have access to your financial accounts. Reminder dates are calculated based on the information you provide — accuracy depends on your input.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">4. Notifications</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We send reminders via email and/or push notifications based on your preferences. While we strive for timely delivery, we cannot guarantee that reminders will arrive at a specific time. SubSnooze is not liable for missed renewals or charges resulting from delayed or undelivered notifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">5. Cancellation Assistance</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze may redirect you to a third-party service&apos;s cancellation page. We are not responsible for the cancellation process on those platforms. Always verify directly with your subscription provider that cancellation was successful.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">6. Free and Premium Plans</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze offers a free tier with core tracking and reminder features. Premium features may be offered in the future. We will clearly communicate pricing before any purchase. You can cancel premium at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">7. Acceptable Use</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              You agree not to misuse the service, including but not limited to: creating multiple accounts to circumvent limits, using automated tools to scrape the platform, or attempting to compromise security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">8. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze is a reminder tool, not financial advice. We are not liable for any financial loss arising from missed cancellations, inaccurate data entry, or service downtime. To the maximum extent permitted by law, our total liability is limited to the amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">9. Changes to These Terms</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We may update these terms from time to time. Material changes will be communicated via email or in-app notification. Continued use of SubSnooze after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">10. Contact</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Questions about these terms? Contact us at{" "}
              <a href="mailto:support@subsnooze.com" className="text-primary hover:underline">
                support@subsnooze.com
              </a>.
            </p>
          </section>

          <div className="border-t border-divider pt-6">
            <p className="text-sm text-text-tertiary">
              See also our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
