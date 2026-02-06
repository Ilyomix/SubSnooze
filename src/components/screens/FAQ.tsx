"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react"
import { Card } from "@/components/ui"
import { Skeleton } from "@/components/ui/Skeleton"

interface FAQProps {
  onBack: () => void
}

const FAQ_ITEMS = [
  {
    question: "Is SubSnooze really free?",
    answer: "Yes! The free tier lets you track up to 5 subscriptions with full reminder support. Pro unlocks unlimited tracking and extra features.",
  },
  {
    question: "How do reminders work?",
    answer: "You choose a reminder style: Aggressive (7, 3, and 1 day before renewal), Relaxed (14 and 3 days), or Minimal (3 days only). We send push notifications and/or emails depending on your settings.",
  },
  {
    question: "Does SubSnooze cancel subscriptions for me?",
    answer: "Not directly. We provide a direct link to the cancellation page for each service. After you visit the link, we ask you to confirm the cancellation so we can track your savings.",
  },
  {
    question: "What is the 'Decide Later' button?",
    answer: "We designed SubSnooze for how ADHD brains work. If you're not ready to cancel, hit 'Decide Later' and we'll remind you again. No pressure, no guilt.",
  },
  {
    question: "Is my data safe?",
    answer: "Your data stays on secure Supabase servers. We never sell your subscription data or share it with third parties. You can export or delete everything at any time.",
  },
  {
    question: "Can I use SubSnooze on my phone?",
    answer: "SubSnooze is a Progressive Web App (PWA). Add it to your home screen from your browser and it works just like a native app, with offline support and push notifications.",
  },
  {
    question: "How do I add a subscription that's not in the list?",
    answer: "Just type the name in the search bar and select 'Add as custom subscription'. You can track any service, even ones we don't have in our database.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes! Go to Settings > Your Data > Export subscriptions to download a CSV file with all your subscription data.",
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-[18px] py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
      >
        <span className="text-[15px] font-medium text-text-primary pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-muted motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-divider px-[18px] py-4 motion-safe:animate-fade-in">
          <p className="text-sm leading-relaxed text-text-secondary">{answer}</p>
        </div>
      )}
    </Card>
  )
}

export function FAQ({ onBack }: FAQProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-surface/80 px-6 backdrop-blur-sm pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
            <HelpCircle className="h-4 w-4 text-violet-600" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">FAQ</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex flex-col gap-3 px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {!ready ? (
          <>
            <Skeleton className="h-4 w-56" />
            <div className="mt-2 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[58px] w-full rounded-2xl" />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-2">
              Got questions? We have answers.
            </p>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
