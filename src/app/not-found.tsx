import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <span className="text-2xl">?</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          This page doesn&apos;t exist. No worries, let&apos;s get you back on track.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
