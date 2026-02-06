import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy",
  description: "SubSnooze privacy policy — what data we collect, how we store it, and your GDPR rights.",
}

export default function PrivacyPage() {
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
            <h1 className="text-2xl font-semibold text-text-primary">Privacy Policy</h1>
            <p className="mt-1 text-sm text-text-tertiary">Last updated: February 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">1. What We Collect</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              When you use SubSnooze, we collect:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li><strong>Account info:</strong> name, email address (required for authentication)</li>
              <li><strong>Subscription data:</strong> service names, prices, billing cycles, and renewal dates you enter manually</li>
              <li><strong>Notification preferences:</strong> email, push, and SMS settings</li>
              <li><strong>Device token:</strong> if you enable push notifications (Firebase Cloud Messaging)</li>
            </ul>
            <p className="text-sm leading-relaxed text-text-secondary">
              We do <strong>not</strong> collect financial data, bank details, or payment card information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">2. How We Store Your Data</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Your data is stored securely in <strong>Supabase</strong> (PostgreSQL), a cloud database with row-level security. Each user can only access their own data. All connections use TLS encryption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">3. Push Notifications</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              If you opt in, we use <strong>Firebase Cloud Messaging (FCM)</strong> by Google to deliver push notifications to your device. This requires storing a device token associated with your account. You can disable push notifications at any time in Settings. We do not share your device token with any third party beyond Firebase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">4. Authentication</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Authentication is handled by <strong>Supabase Auth</strong>. If you sign in with Google, we receive your name, email, and profile picture from Google. We do not access any other Google account data. Passwords are hashed and stored by Supabase — we never have access to plaintext passwords.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">5. Cookies, Local Storage &amp; Analytics</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              SubSnooze uses cookies and local storage for authentication sessions and user preferences (such as theme and price display mode).
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              If you accept analytics cookies, we use <strong>PostHog</strong>, a privacy-friendly analytics platform, to understand how SubSnooze is used so we can improve it. PostHog does not track you across other websites, respects Do Not Track settings, and we do not send any personally identifiable information. You can decline analytics in the cookie banner, and no analytics data will be collected.
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              We use <strong>Sentry</strong> for error monitoring to detect and fix bugs. Error reports may include technical information about the error (stack trace, browser type) but do not include personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">6. Data Sharing</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We do not sell, rent, or share your personal data with third parties. Your data is only processed by:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li><strong>Supabase:</strong> database hosting and authentication</li>
              <li><strong>Firebase (Google):</strong> push notification delivery only</li>
              <li><strong>Stripe:</strong> payment processing for Pro upgrades (no card data stored by us)</li>
              <li><strong>PostHog:</strong> privacy-friendly analytics (only if you accept cookies)</li>
              <li><strong>Sentry:</strong> error monitoring (technical data only, no PII)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">7. Your Rights (GDPR)</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Under the General Data Protection Regulation, you have the right to:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li><strong>Access:</strong> view all data we hold about you</li>
              <li><strong>Rectification:</strong> correct inaccurate data via the app</li>
              <li><strong>Erasure:</strong> permanently delete your account and all data from Settings</li>
              <li><strong>Portability:</strong> request an export of your data</li>
              <li><strong>Objection:</strong> disable notifications or contact us to stop processing</li>
            </ul>
            <p className="text-sm leading-relaxed text-text-secondary">
              Account deletion is immediate and irreversible. All subscriptions, notifications, and profile data are permanently removed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">8. Data Retention</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We retain your data for as long as your account is active. When you delete your account, all data is permanently erased within seconds via cascading database deletion. We do not retain backups of deleted accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">9. Security</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We implement industry-standard security measures including TLS encryption, row-level security policies, and secure authentication flows. If you discover a security vulnerability, please report it to{" "}
              <a href="mailto:security@subsnooze.com" className="text-primary hover:underline">
                security@subsnooze.com
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">10. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              We may update this policy when our practices change. Material changes will be communicated via email. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">11. Contact</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              For privacy-related questions or to exercise your rights, contact us at{" "}
              <a href="mailto:privacy@subsnooze.com" className="text-primary hover:underline">
                privacy@subsnooze.com
              </a>.
            </p>
          </section>

          <div className="border-t border-divider pt-6">
            <p className="text-sm text-text-tertiary">
              See also our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
